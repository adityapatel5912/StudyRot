"""
Collaborative Study Rooms Engine for StudyRot.
Manages persistent room state (2–8 students), real-time WebSockets,
Sync Mode vs Free Mode, moderated chat with @ai NCERT responses,
and 3-question synchronized Group Quizzes with 20-second timers.
"""

import re
import asyncio
import time
import json
import logging
from typing import Dict, Any, List, Optional, Set
from fastapi import WebSocket

from db import db
from utils.codes import generate_short_code
from verified_context import get_verified_ncert_context
from mock import load_question_pool

logger = logging.getLogger("studyrot.study_room")

# In-memory room storage: room_code -> StudyRoom
_ROOMS: Dict[str, "StudyRoom"] = {}

# Banned words for moderation
BANNED_WORDS = {"badword", "spam", "abuse", "hate"}


def clean_room_nickname(nickname: str) -> str:
    """Sanitizes nickname: max 16 chars, stripped of HTML/newlines."""
    no_html = re.sub(r'<[^>]*>', '', nickname or '')
    cleaned = "".join(c for c in no_html if c.isalnum() or c in (" ", "_", "-")).strip()
    return cleaned[:16] or "Student"


class StudyRoom:
    def __init__(self, code: str, host_nickname: str, topic: str, subject: str, grade: int, max_players: int = 8):
        self.code = code
        self.topic = topic
        self.subject = subject
        self.grade = grade
        self.max_players = min(8, max(2, max_players))
        self.mode = "sync"  # "sync" or "free"
        self.current_post_index = 0
        self.created_at = time.time()
        self.host_id: Optional[str] = None

        # player_id -> {"nickname": str, "ws": WebSocket, "color": str, "score": int, "last_msg_time": float}
        self.players: Dict[str, Dict[str, Any]] = {}

        # Group Quiz State
        self.quiz_active = False
        self.quiz_questions: List[Dict[str, Any]] = []
        self.quiz_current_q = 0
        self.quiz_deadline_ms = 0
        self.quiz_answers: Dict[str, int] = {}  # player_id -> option_idx
        self.quiz_task: Optional[asyncio.Task] = None

    def get_public_state(self) -> Dict[str, Any]:
        return {
            "room_code": self.code,
            "topic": self.topic,
            "subject": self.subject,
            "grade": self.grade,
            "mode": self.mode,
            "current_post_index": self.current_post_index,
            "host_id": self.host_id,
            "max_players": self.max_players,
            "player_count": len(self.players),
            "players": [
                {
                    "id": pid,
                    "nickname": p["nickname"],
                    "color": p["color"],
                    "is_host": pid == self.host_id,
                    "score": p.get("score", 0),
                }
                for pid, p in self.players.items()
            ],
            "quiz_active": self.quiz_active,
        }

    async def broadcast(self, message: Dict[str, Any], exclude_player: Optional[str] = None):
        """Broadcasts a JSON message to all connected player websockets."""
        msg_text = json.dumps(message)
        dead_players = []

        for pid, p in list(self.players.items()):
            if pid == exclude_player:
                continue
            ws: WebSocket = p.get("ws")
            if ws:
                try:
                    await ws.send_text(msg_text)
                except Exception as e:
                    logger.warning("Error broadcasting to player %s in room %s: %s", pid, self.code, e)
                    dead_players.append(pid)

        for dp in dead_players:
            await self.remove_player(dp)

    async def add_player(self, player_id: str, nickname: str, ws: WebSocket) -> Dict[str, Any]:
        """Adds a player to the room with rate limiting and capacity checking."""
        if len(self.players) >= self.max_players and player_id not in self.players:
            raise ValueError("Room is at maximum capacity (8 players).")

        clean_nick = clean_room_nickname(nickname)
        colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"]
        color = colors[len(self.players) % len(colors)]

        is_first = len(self.players) == 0
        if is_first or not self.host_id:
            self.host_id = player_id

        self.players[player_id] = {
            "nickname": clean_nick,
            "ws": ws,
            "color": color,
            "score": 0,
            "last_msg_time": 0.0,
        }

        player_data = {
            "id": player_id,
            "nickname": clean_nick,
            "color": color,
            "is_host": player_id == self.host_id,
            "score": 0,
        }

        await self.broadcast({
            "type": "player_joined",
            "player": player_data,
            "player_count": len(self.players),
        }, exclude_player=player_id)

        return player_data

    async def remove_player(self, player_id: str):
        """Removes a player and promotes a new host if the host left."""
        if player_id in self.players:
            p_data = self.players.pop(player_id)
            logger.info("Player %s (%s) left room %s", player_id, p_data.get("nickname"), self.code)

            # Reassign host if host left
            if self.host_id == player_id and self.players:
                self.host_id = next(iter(self.players.keys()))
                logger.info("New host promoted in room %s: %s", self.code, self.host_id)

            await self.broadcast({
                "type": "player_left",
                "player_id": player_id,
                "new_host_id": self.host_id,
                "player_count": len(self.players),
            })

    async def handle_chat(self, player_id: str, text: str, user_groq_key: Optional[str] = None):
        """Handles chat messages with rate limiting, length restriction, and @ai resolution."""
        player = self.players.get(player_id)
        if not player:
            return

        # Rate limit: 1 msg per second
        now = time.time()
        if now - player["last_msg_time"] < 0.9:
            ws: WebSocket = player.get("ws")
            if ws:
                await ws.send_text(json.dumps({"type": "error", "message": "Slow down! Rate limit: 1 message per second."}))
            return
        player["last_msg_time"] = now

        # Length restriction: 200 chars
        clean_text = text.strip()[:200]
        if not clean_text:
            return

        # Check banned words
        if any(w in clean_text.lower() for w in BANNED_WORDS):
            ws: WebSocket = player.get("ws")
            if ws:
                await ws.send_text(json.dumps({"type": "error", "message": "Message contained prohibited language."}))
            return

        # Save to database
        await db.save_room_chat(
            room_code=self.code,
            user_id=player_id,
            nickname=player["nickname"],
            message=clean_text,
            is_ai=False,
        )

        # Broadcast user message
        timestamp_iso = time.strftime("%H:%M")
        await self.broadcast({
            "type": "chat",
            "player_id": player_id,
            "nickname": player["nickname"],
            "color": player["color"],
            "text": clean_text,
            "timestamp": timestamp_iso,
            "is_ai": False,
        })

        # Check for @ai trigger
        if "@ai" in clean_text.lower():
            query = clean_text.replace("@ai", "").replace("@AI", "").strip()
            await self.respond_with_ai(query, user_groq_key)

    async def respond_with_ai(self, query: str, user_groq_key: Optional[str] = None):
        """Generates AI response using verified NCERT context and KaTeX support."""
        verified_ctx, is_verified = get_verified_ncert_context(self.subject, self.grade, query or self.topic)
        ai_reply = ""

        if user_groq_key:
            try:
                from groq import AsyncGroq
                client = AsyncGroq(api_key=user_groq_key)
                system_prompt = (
                    "You are StudyRot AI Tutor in a collaborative study room. "
                    "Answer concisely in 2-3 sentences for Class 10/12 CBSE students. "
                    "Use LaTeX formulas e.g. $...$ when mathematical or scientific terms are used."
                )
                if verified_ctx:
                    system_prompt += f"\nVerified NCERT facts:\n{verified_ctx}"
                res = await client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": query or f"Explain the concept of {self.topic}"},
                    ],
                    max_tokens=250,
                    temperature=0.3,
                )
                ai_reply = res.choices[0].message.content
            except Exception as e:
                logger.warning("Groq AI response in room failed: %s", e)

        if not ai_reply:
            # Fallback to verified research context snippet (0 API cost, zero developer key consumption)
            if verified_ctx:
                lines = [l for l in verified_ctx.splitlines() if l.strip() and not l.startswith("#")]
                ai_reply = " ".join(lines[:2]) if lines else f"In NCERT {self.subject} Class {self.grade}: {self.topic} is a core syllabus concept tested annually in board exams."
            else:
                ai_reply = f"Hello! I am StudyRot AI Tutor. We are studying {self.topic} ({self.subject} Class {self.grade}). Ask me any concept doubt!"

        # Save AI chat message
        await db.save_room_chat(
            room_code=self.code,
            user_id="ai_tutor",
            nickname="StudyRot AI Tutor 🤖",
            message=ai_reply,
            is_ai=True,
        )

        await self.broadcast({
            "type": "ai_message",
            "nickname": "StudyRot AI Tutor 🤖",
            "text": ai_reply,
            "timestamp": time.strftime("%H:%M"),
            "is_ai": True,
        })

    async def start_group_quiz(self):
        """Starts a 3-question Group Quiz with 20s server-authoritative timer."""
        if self.quiz_active:
            return

        pool = load_question_pool(self.subject, self.grade)
        mcq_pool = [q for q in pool if q.get("type") == "MCQ"]
        if len(mcq_pool) < 3:
            # Generate fallback sample MCQs from verified facts
            mcq_pool = [
                {
                    "question": f"What is the SI unit of measurement related to {self.topic}?",
                    "options": ["Ohm (Ω)", "Volt (V)", "Ampere (A)", "Joule (J)"],
                    "correct_answer": "Joule (J)",
                },
                {
                    "question": f"Which principle applies directly to {self.topic} in CBSE Class {self.grade}?",
                    "options": ["Conservation of Energy", "Newton's 1st Law", "Ohm's Law", "Snell's Law"],
                    "correct_answer": "Conservation of Energy",
                },
                {
                    "question": "What is the nature of an image formed by a convex mirror?",
                    "options": ["Virtual and Erect", "Real and Inverted", "Real and Erect", "Virtual and Inverted"],
                    "correct_answer": "Virtual and Erect",
                },
            ]

        import random
        self.quiz_questions = random.sample(mcq_pool, min(3, len(mcq_pool)))
        self.quiz_current_q = 0
        self.quiz_active = True

        if self.quiz_task and not self.quiz_task.done():
            self.quiz_task.cancel()
        self.quiz_task = asyncio.create_task(self._run_quiz_flow())

    async def _run_quiz_flow(self):
        """Runs the 3-question sequence with 20-second countdowns per question."""
        try:
            for q_idx, q in enumerate(self.quiz_questions):
                self.quiz_current_q = q_idx
                self.quiz_answers = {}
                duration_sec = 20
                self.quiz_deadline_ms = int((time.time() + duration_sec) * 1000)

                # Broadcast question start
                await self.broadcast({
                    "type": "group_quiz_start",
                    "question_index": q_idx,
                    "total_questions": len(self.quiz_questions),
                    "question": {
                        "text": q.get("question"),
                        "options": q.get("options", []),
                    },
                    "deadline_ms": self.quiz_deadline_ms,
                    "duration_sec": duration_sec,
                })

                # Wait for deadline or all answered
                start_time = time.time()
                while time.time() - start_time < duration_sec:
                    if len(self.quiz_answers) >= len(self.players) and len(self.players) > 0:
                        break
                    await asyncio.sleep(0.5)

                # Reveal results for this question
                correct_answer = q.get("correct_answer")
                options = q.get("options", [])
                correct_idx = -1
                for idx, opt in enumerate(options):
                    if opt.lower().strip() == str(correct_answer).lower().strip():
                        correct_idx = idx
                        break

                per_player = {}
                correct_count = 0
                for pid, player in self.players.items():
                    ans_idx = self.quiz_answers.get(pid, -1)
                    is_correct = (ans_idx == correct_idx)
                    if is_correct:
                        player["score"] = player.get("score", 0) + 10
                        correct_count += 1
                    per_player[pid] = {
                        "nickname": player["nickname"],
                        "color": player["color"],
                        "selected_idx": ans_idx,
                        "is_correct": is_correct,
                        "score": player["score"],
                    }

                accuracy_pct = round((correct_count / max(1, len(self.players))) * 100)

                await self.broadcast({
                    "type": "group_quiz_reveal",
                    "question_index": q_idx,
                    "correct_idx": correct_idx,
                    "correct_answer": correct_answer,
                    "per_player_results": per_player,
                    "combined_accuracy": accuracy_pct,
                })

                # Wait 5 seconds before next question
                await asyncio.sleep(5.0)

            # Quiz Completed: find MVP
            mvp_player = None
            highest_score = -1
            for pid, player in self.players.items():
                if player.get("score", 0) > highest_score:
                    highest_score = player["score"]
                    mvp_player = player["nickname"]

            await self.broadcast({
                "type": "group_quiz_finished",
                "mvp": mvp_player or "Everyone",
                "high_score": max(0, highest_score),
            })
        except asyncio.CancelledError:
            logger.info("Quiz in room %s was cancelled", self.code)
        finally:
            self.quiz_active = False

    def record_quiz_answer(self, player_id: str, q_idx: int, option_idx: int):
        """Records an answer for the current question."""
        if self.quiz_active and q_idx == self.quiz_current_q:
            self.quiz_answers[player_id] = option_idx


class StudyRoomManager:
    def __init__(self):
        self.rooms = _ROOMS

    def create_room(self, host_nickname: str, topic: str, subject: str, grade: int, max_players: int = 8) -> StudyRoom:
        code = generate_short_code(6)
        while code in self.rooms:
            code = generate_short_code(6)

        room = StudyRoom(code, host_nickname, topic, subject, grade, max_players)
        self.rooms[code] = room
        logger.info("Created Study Room %s for topic %s", code, topic)
        return room

    def get_room(self, code: str) -> Optional[StudyRoom]:
        code = code.strip().upper()
        return self.rooms.get(code)

    def delete_room(self, code: str):
        code = code.strip().upper()
        if code in self.rooms:
            room = self.rooms.pop(code)
            if room.quiz_task and not room.quiz_task.done():
                room.quiz_task.cancel()


room_manager = StudyRoomManager()
