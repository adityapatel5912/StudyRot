"""
Real-time Classroom Battle room manager, scoring engine, and WebSocket protocol handler.
Handles synchronized 15-second countdowns, speed-based scoring, live leaderboards,
message replay buffer, and auto-cleanup of stale rooms.
"""

import re
import time
import string
import random
import asyncio
import logging
from typing import Dict, List, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("studyrot.battle")

ALLOWED_ROOM_CHARS = "".join(c for c in string.ascii_uppercase + string.digits if c not in "O0I1")


def generate_room_code() -> str:
    """Generates a friendly 6-char alphanumeric room code excluding confusing characters O, 0, I, 1."""
    return "".join(random.choices(ALLOWED_ROOM_CHARS, k=6))


def clean_nickname(name: str) -> str:
    """Cleans nickname, removes HTML/script tags, limits length to 16 characters."""
    if not name:
        return f"Player_{random.randint(100, 999)}"
    clean = re.sub(r"<[^>]*>", "", name).strip()
    clean = re.sub(r"[^\w\s\-_]", "", clean)
    return clean[:16] or f"Student_{random.randint(100, 999)}"


class BattleRoom:
    def __init__(self, code: str, host_id: str, topic: str, subject: str, grade: int, questions: List[Dict[str, Any]]):
        self.code = code
        self.host_id = host_id
        self.topic = topic
        self.subject = subject
        self.grade = grade
        self.questions = questions[:5]  # Standard 5-question match
        self.current_q_idx = 0
        self.state = "lobby"  # lobby | question | reveal | podium
        self.deadline_ms = 0
        self.q_start_ms = 0
        self.created_at = time.time()
        self.last_active = time.time()

        # Replay buffer (last 10 messages)
        self.message_history: List[Dict[str, Any]] = []

        # player_id -> dict
        self.players: Dict[str, Dict[str, Any]] = {}
        # player_id -> WebSocket
        self.connections: Dict[str, WebSocket] = {}

    def record_message(self, msg: Dict[str, Any]):
        """Records message into circular history buffer for reconnection replay."""
        self.message_history.append(msg)
        if len(self.message_history) > 10:
            self.message_history.pop(0)

    def get_recent_messages(self, count: int = 5) -> List[Dict[str, Any]]:
        """Returns the last N messages for replay."""
        return self.message_history[-count:]

    def get_public_state(self, for_player_id: Optional[str] = None) -> Dict[str, Any]:
        """Builds state dictionary tailored for clients."""
        players_list = []
        for pid, p in self.players.items():
            players_list.append({
                "id": pid,
                "nickname": p["nickname"],
                "is_host": (pid == self.host_id),
                "score": p["score"],
                "streak": p["streak"],
                "connected": p["connected"],
                "has_answered": self.current_q_idx in p.get("answers", {}),
            })

        # Sort leaderboard by score descending
        players_list.sort(key=lambda x: x["score"], reverse=True)

        current_q = None
        if self.state in ["question", "reveal", "podium"] and self.current_q_idx < len(self.questions):
            q_data = self.questions[self.current_q_idx]
            current_q = {
                "index": self.current_q_idx,
                "total": len(self.questions),
                "question": q_data.get("question"),
                "options": q_data.get("options", []),
            }
            # Only reveal answer and explanation during 'reveal' or 'podium'
            if self.state in ["reveal", "podium"]:
                current_q["answer"] = q_data.get("answer")
                current_q["explanation"] = q_data.get("explanation", "")

                # Distribution stats
                counts: Dict[str, int] = {opt: 0 for opt in q_data.get("options", [])}
                for p in self.players.values():
                    ans_info = p.get("answers", {}).get(self.current_q_idx)
                    if ans_info and ans_info.get("option") in counts:
                        counts[ans_info["option"]] += 1
                current_q["option_counts"] = counts

        time_remaining_sec = 0
        if self.state == "question" and self.deadline_ms > 0:
            now_ms = int(time.time() * 1000)
            time_remaining_sec = max(0, int((self.deadline_ms - now_ms) / 1000))

        summary = None
        if self.state == "podium":
            summary = self.compute_summary()

        return {
            "room_code": self.code,
            "topic": self.topic,
            "subject": self.subject,
            "grade": self.grade,
            "state": self.state,
            "host_id": self.host_id,
            "players": players_list,
            "player_count": len(players_list),
            "current_question": current_q,
            "current_q_idx": self.current_q_idx,
            "total_questions": len(self.questions),
            "time_remaining_sec": time_remaining_sec,
            "deadline_ms": self.deadline_ms,
            "summary": summary,
        }

    def compute_summary(self) -> Dict[str, Any]:
        """Calculates end-of-battle analytics."""
        total_answers = 0
        total_correct = 0
        fastest_record = {"nickname": "None", "time_ms": 999999}
        q_miss_count: Dict[int, int] = {i: 0 for i in range(len(self.questions))}

        for pid, p in self.players.items():
            for q_idx, ans in p.get("answers", {}).items():
                total_answers += 1
                if ans.get("is_correct"):
                    total_correct += 1
                    if ans.get("time_ms", 999999) < fastest_record["time_ms"]:
                        fastest_record = {
                            "nickname": p["nickname"],
                            "time_ms": ans["time_ms"]
                        }
                else:
                    q_miss_count[q_idx] = q_miss_count.get(q_idx, 0) + 1

        accuracy = round((total_correct / total_answers * 100)) if total_answers > 0 else 0

        # Find most missed question
        most_missed_idx = max(q_miss_count, key=q_miss_count.get) if q_miss_count else 0
        most_missed_q = self.questions[most_missed_idx].get("question", "") if self.questions else ""

        ranked = sorted(self.players.values(), key=lambda p: p["score"], reverse=True)
        podium = [
            {"rank": i + 1, "nickname": p["nickname"], "score": p["score"], "id": p["id"]}
            for i, p in enumerate(ranked[:3])
        ]

        return {
            "accuracy": accuracy,
            "total_players": len(self.players),
            "fastest_answer": fastest_record if fastest_record["time_ms"] < 999999 else None,
            "most_missed": {
                "question": most_missed_q,
                "miss_count": q_miss_count.get(most_missed_idx, 0)
            },
            "podium": podium
        }


class BattleManager:
    def __init__(self):
        self.rooms: Dict[str, BattleRoom] = {}

    def create_room(
        self,
        host_id: str,
        topic: str,
        subject: str,
        grade: int,
        questions: List[Dict[str, Any]]
    ) -> BattleRoom:
        # Generate unique room code
        for _ in range(20):
            code = generate_room_code()
            if code not in self.rooms:
                break
        else:
            code = generate_room_code()

        # Guarantee at least 5 questions
        if len(questions) < 5:
            questions = list(questions)
            # Add fallback NCERT quizzes
            while len(questions) < 5:
                idx = len(questions) + 1
                questions.append({
                    "question": f"Key CBSE {subject} Concept Check #{idx}",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "answer": "Option A",
                    "explanation": "Anchored to core NCERT CBSE curriculum principles."
                })

        room = BattleRoom(code, host_id, topic, subject, grade, questions)
        self.rooms[code] = room
        logger.info("Created BattleRoom %s (Host: %s, Topic: %s)", code, host_id, topic)
        return room

    def get_room(self, code: str) -> Optional[BattleRoom]:
        code = code.strip().upper()
        return self.rooms.get(code)

    def cleanup_inactive_rooms(self):
        """Removes rooms older than 30 minutes."""
        now = time.time()
        stale = [code for code, room in self.rooms.items() if now - room.last_active > 1800]
        for code in stale:
            del self.rooms[code]
            logger.info("Cleaned up stale BattleRoom %s", code)

    async def broadcast(self, room: BattleRoom, event_type: str, extra_data: Optional[Dict[str, Any]] = None):
        """Broadcasts event to all active WebSockets in the room and records in replay buffer."""
        room.last_active = time.time()
        base_state = room.get_public_state()
        
        # Standardize message types for client compatibility
        client_type = event_type.lower()
        if client_type in ["question_start"]:
            client_type = "question"
        elif client_type in ["question_reveal"]:
            client_type = "reveal"
        elif client_type in ["battle_finish"]:
            client_type = "podium"
        elif client_type in ["player_joined", "player_left", "player_answered"]:
            client_type = "lobby"

        payload = {
            "type": client_type,
            "action": event_type,
            "room": base_state,
            **(extra_data or {})
        }
        
        room.record_message(payload)

        dead_pids = []
        for pid, ws in list(room.connections.items()):
            try:
                await ws.send_json(payload)
            except Exception:
                dead_pids.append(pid)

        for pid in dead_pids:
            room.connections.pop(pid, None)
            if pid in room.players:
                room.players[pid]["connected"] = False

    async def start_question(self, room: BattleRoom, q_idx: int):
        """Initiates question countdown with 15-second deadline."""
        room.state = "question"
        room.current_q_idx = q_idx
        now_ms = int(time.time() * 1000)
        room.q_start_ms = now_ms
        room.deadline_ms = now_ms + 15000  # Exactly 15s deadline

        await self.broadcast(room, "question", {
            "q_idx": q_idx,
            "deadline_ms": room.deadline_ms,
            "duration_sec": 15
        })

        # Schedule automatic timeout check
        asyncio.create_task(self._question_timer_task(room, q_idx))

    async def _question_timer_task(self, room: BattleRoom, q_idx: int):
        await asyncio.sleep(15.2)
        if room.state == "question" and room.current_q_idx == q_idx:
            logger.info("Room %s Question %d 15s timer expired", room.code, q_idx)
            await self.reveal_question(room)

    async def submit_answer(self, room: BattleRoom, player_id: str, option: str) -> bool:
        """Processes player's answer and calculates points."""
        if room.state != "question":
            return False

        player = room.players.get(player_id)
        if not player:
            return False

        q_idx = room.current_q_idx
        if q_idx in player.get("answers", {}):
            return False  # Already answered

        now_ms = int(time.time() * 1000)
        time_taken_ms = max(50, min(15000, now_ms - room.q_start_ms))

        q_data = room.questions[q_idx]
        correct_ans = q_data.get("answer", "").strip()
        is_correct = (option.strip() == correct_ans)

        points = 0
        if is_correct:
            # Scoring: 500-1000 points by answer speed
            time_penalty = (time_taken_ms / 15000.0) * 500.0
            base_points = round(1000 - time_penalty)

            # Streak bonus
            player["streak"] = player.get("streak", 0) + 1
            streak_bonus = 50 if player["streak"] >= 2 else 0
            points = base_points + streak_bonus
            player["score"] += points
        else:
            player["streak"] = 0

        player.setdefault("answers", {})[q_idx] = {
            "option": option,
            "time_ms": time_taken_ms,
            "is_correct": is_correct,
            "points": points,
        }

        # Inform player individually of result
        ws = room.connections.get(player_id)
        if ws:
            try:
                await ws.send_json({
                    "type": "answer_ack",
                    "is_correct": is_correct,
                    "points": points,
                    "score": player["score"],
                    "streak": player["streak"]
                })
            except Exception:
                pass

        # Broadcast state update (has_answered indicator)
        await self.broadcast(room, "player_answered", {"player_id": player_id})

        # If all connected players have answered, trigger reveal immediately
        connected_players = [p for p in room.players.values() if p.get("connected", True)]
        all_answered = all(q_idx in p.get("answers", {}) for p in connected_players)
        if all_answered and len(connected_players) > 0:
            logger.info("Room %s: all players answered question %d early", room.code, q_idx)
            await self.reveal_question(room)

        return True

    async def reveal_question(self, room: BattleRoom):
        """Switches room state to reveal."""
        if room.state != "question":
            return
        room.state = "reveal"
        await self.broadcast(room, "reveal")

    async def advance_or_finish(self, room: BattleRoom):
        """Advances to next question or to podium."""
        next_idx = room.current_q_idx + 1
        if next_idx < len(room.questions):
            await self.start_question(room, next_idx)
        else:
            room.state = "podium"
            await self.broadcast(room, "podium", {"summary": room.compute_summary()})


battle_manager = BattleManager()
