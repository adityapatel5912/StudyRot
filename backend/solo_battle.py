"""
Single-player Solo Battle Engine vs AI Bots.
Features:
- Deterministic seeded simulation per battle_id
- Realistic Indian student bot profiles: Bot Aditya, Bot Priya, Bot Rohan, etc.
- Difficulty tiers: Easy (55% acc, 8-12s), Medium (75% acc, 4-7s), Hard (90% acc, 2-5s)
- Speed-based scoring: 1000 - (time_ms / 15000) * 500
- Staggered bot reveal timing, commentary, and emoji reactions (🔥/💀)
- Memory cleanup after 2 hours.
"""

import time
import random
import hashlib
from typing import Dict, List, Optional, Any

BOT_POOL = [
    {"name": "Bot Aditya", "avatar": "👨‍🎓", "personality": "aggressive"},
    {"name": "Bot Priya", "avatar": "👩‍🎓", "personality": "consistent"},
    {"name": "Bot Rohan", "avatar": "🧑‍🔬", "personality": "methodical"},
    {"name": "Bot Ananya", "avatar": "👩‍🏫", "personality": "speedy"},
    {"name": "Bot Kabir", "avatar": "🧑‍🎓", "personality": "clutch"},
    {"name": "Bot Meera", "avatar": "👩‍💻", "personality": "analytical"},
]

DIFFICULTY_PARAMS = {
    "easy": {"accuracy": 0.55, "min_time": 8000, "max_time": 16000},
    "medium": {"accuracy": 0.75, "min_time": 4000, "max_time": 8000},
    "hard": {"accuracy": 0.90, "min_time": 2000, "max_time": 5000},
}


def calculate_score(is_correct: bool, time_ms: int) -> int:
    """Standard scoring: 1000 - (time_ms / 15000) * 500 for correct, 0 for wrong/timeout."""
    if not is_correct or time_ms >= 15000 or time_ms < 0:
        return 0
    raw = 1000 - (time_ms / 15000.0) * 500
    return max(500, min(1000, int(round(raw))))


class SoloBattleSession:
    def __init__(self, battle_id: str, difficulty: str, questions: List[Dict[str, Any]]):
        self.battle_id = battle_id
        self.difficulty = difficulty.lower() if difficulty.lower() in DIFFICULTY_PARAMS else "medium"
        self.questions = questions[:8]  # Standard 8 questions
        self.created_at = time.time()
        self.last_active = time.time()

        # Seed random generator for determinism
        seed_int = int(hashlib.sha256(battle_id.encode("utf-8")).hexdigest()[:8], 16)
        rng = random.Random(seed_int)

        # Pick 3 unique bots from pool
        selected_bots = rng.sample(BOT_POOL, 3)
        self.bots = []
        for i, b in enumerate(selected_bots):
            self.bots.append({
                "id": f"bot_{i+1}",
                "name": b["name"],
                "avatar": b["avatar"],
                "personality": b["personality"],
                "score": 0,
                "streak": 0,
                "answers": [],  # record of each round
            })

        self.user_score = 0
        self.user_streak = 0
        self.user_answers: List[Dict[str, Any]] = []
        self.current_q_idx = 0
        self.completed = False

    def get_public_lobby(self) -> Dict[str, Any]:
        """Returns metadata for the 2-second lobby view."""
        return {
            "battle_id": self.battle_id,
            "difficulty": self.difficulty,
            "total_questions": len(self.questions),
            "matchup_label": "You vs. 3 bots",
            "bots": [
                {"id": b["id"], "name": b["name"], "avatar": b["avatar"]}
                for b in self.bots
            ],
            "questions": [
                {
                    "index": i,
                    "question": q.get("question"),
                    "options": q.get("options", []),
                }
                for i, q in enumerate(self.questions)
            ],
        }

    def simulate_bot_round(self, question: Dict[str, Any], round_idx: int) -> List[Dict[str, Any]]:
        """Simulates all 3 bots for a given round deterministically based on seed."""
        cfg = DIFFICULTY_PARAMS[self.difficulty]
        bot_results = []
        correct_ans = question.get("answer", "")
        options = question.get("options", [])
        wrong_options = [opt for opt in options if opt != correct_ans] or options

        for bot in self.bots:
            # Seed per bot and question
            bot_seed = int(hashlib.sha256(f"{self.battle_id}:{bot['id']}:{round_idx}".encode()).hexdigest()[:8], 16)
            bot_rng = random.Random(bot_seed)

            # Accuracy coin flip
            is_correct = bot_rng.random() < cfg["accuracy"]
            time_ms = bot_rng.randint(cfg["min_time"], cfg["max_time"])

            if time_ms > 15000:
                is_correct = False  # timeout

            if is_correct:
                chosen_opt = correct_ans
                chosen_idx = options.index(correct_ans) if correct_ans in options else 0
            else:
                chosen_opt = bot_rng.choice(wrong_options)
                chosen_idx = options.index(chosen_opt) if chosen_opt in options else 1

            pts = calculate_score(is_correct, time_ms)
            bot["score"] += pts
            bot["streak"] = (bot["streak"] + 1) if is_correct else 0

            # Staggered latency delay for client reveal (800ms - 2000ms after user)
            reveal_delay_ms = bot_rng.randint(800, 2000)

            reaction = "🔥" if pts > 850 else ("👍" if is_correct else "💀")

            res = {
                "bot_id": bot["id"],
                "name": bot["name"],
                "avatar": bot["avatar"],
                "chosen_option": chosen_opt,
                "chosen_index": chosen_idx,
                "is_correct": is_correct,
                "time_ms": time_ms,
                "points_earned": pts,
                "total_score": bot["score"],
                "streak": bot["streak"],
                "reveal_delay_ms": reveal_delay_ms,
                "reaction": reaction,
            }
            bot["answers"].append(res)
            bot_results.append(res)

        return bot_results

    def submit_user_answer(
        self, question_idx: int, option_idx: Optional[int], time_ms: int
    ) -> Dict[str, Any]:
        """Processes user submission, computes round scores and live commentary."""
        self.last_active = time.time()
        if question_idx >= len(self.questions):
            raise ValueError("Question index out of bounds")

        q = self.questions[question_idx]
        options = q.get("options", [])
        correct_ans = q.get("answer", "")
        explanation = q.get("explanation", "")

        user_pick = options[option_idx] if (option_idx is not None and 0 <= option_idx < len(options)) else None
        is_user_correct = (user_pick == correct_ans) and (time_ms <= 15000)
        user_points = calculate_score(is_user_correct, time_ms)

        self.user_score += user_points
        self.user_streak = (self.user_streak + 1) if is_user_correct else 0

        user_round = {
            "question_idx": question_idx,
            "user_pick": user_pick,
            "option_idx": option_idx,
            "is_correct": is_user_correct,
            "time_ms": time_ms,
            "points": user_points,
            "total_score": self.user_score,
            "streak": self.user_streak,
        }
        self.user_answers.append(user_round)

        # Simulate bots for this round
        bot_results = self.simulate_bot_round(q, question_idx)

        # Build live leaderboard
        all_participants = [
            {
                "id": "user",
                "name": "You",
                "score": self.user_score,
                "streak": self.user_streak,
                "is_user": True,
                "points_this_round": user_points,
                "is_correct": is_user_correct,
            }
        ]
        for b in self.bots:
            all_participants.append({
                "id": b["id"],
                "name": b["name"],
                "score": b["score"],
                "streak": b["streak"],
                "is_user": False,
                "points_this_round": next((r["points_earned"] for r in bot_results if r["bot_id"] == b["id"]), 0),
                "is_correct": next((r["is_correct"] for r in bot_results if r["bot_id"] == b["id"]), False),
            })
        all_participants.sort(key=lambda x: x["score"], reverse=True)

        user_rank = next((idx + 1 for idx, p in enumerate(all_participants) if p["is_user"]), 1)

        # Generate live commentary
        commentary = self._generate_commentary(user_rank, is_user_correct, bot_results)

        is_last = (question_idx == len(self.questions) - 1)
        if is_last:
            self.completed = True

        return {
            "question_idx": question_idx,
            "correct_answer": correct_ans,
            "correct_index": options.index(correct_ans) if correct_ans in options else -1,
            "explanation": explanation,
            "user": user_round,
            "bots": bot_results,
            "leaderboard": all_participants,
            "user_rank": user_rank,
            "commentary": commentary,
            "is_last_question": is_last,
        }

    def _generate_commentary(self, user_rank: int, is_user_correct: bool, bot_results: List[Dict[str, Any]]) -> str:
        """Generates dynamic, engaging commentary text."""
        bot_ahead = next((b["name"] for b in self.bots if b["score"] > self.user_score), None)
        fastest_bot = min(bot_results, key=lambda b: b["time_ms"]) if bot_results else None

        if user_rank == 1:
            if self.user_streak >= 3:
                return f"🔥 You're on fire! Unstoppable {self.user_streak}x streak!"
            return "👑 You're dominating in 1st place! Keep the pressure on!"
        elif user_rank == 2:
            return f"⚡ You're in 2nd place, right behind {bot_ahead}!"
        elif user_rank == 3:
            return f"🎯 Solid 3rd place! Fast answers will push you onto the podium."
        else:
            if not is_user_correct:
                return f"⚠️ Tough question! Catch up on the next round."
            return f"🏃 You're chasing the pack! Watch out for {fastest_bot['name'] if fastest_bot else 'the bots'}."

    def get_final_summary(self) -> Dict[str, Any]:
        """Generates final podium, statistics, and review integration data."""
        all_participants = [
            {
                "id": "user",
                "name": "You",
                "score": self.user_score,
                "is_user": True,
                "avatar": "👤",
            }
        ]
        for b in self.bots:
            all_participants.append({
                "id": b["id"],
                "name": b["name"],
                "score": b["score"],
                "is_user": False,
                "avatar": b["avatar"],
            })
        all_participants.sort(key=lambda x: x["score"], reverse=True)

        user_rank = next((idx + 1 for idx, p in enumerate(all_participants) if p["is_user"]), 4)
        user_won = (user_rank == 1)

        # Podium text as requested: "You beat 3 bots" if user wins
        podium_title = "You beat 3 bots! 🏆" if user_won else f"Finished #{user_rank} against 3 bots"

        correct_answers = [a for a in self.user_answers if a.get("is_correct")]
        accuracy_pct = int(round((len(correct_answers) / max(1, len(self.questions))) * 100))
        fastest_ms = min([a["time_ms"] for a in correct_answers], default=0)

        # Identify wrong questions for FSRS review hook
        wrong_question_records = []
        for a in self.user_answers:
            q_idx = a["question_idx"]
            q = self.questions[q_idx] if q_idx < len(self.questions) else {}
            if not a.get("is_correct"):
                wrong_question_records.append({
                    "card_id": f"{self.battle_id}-q{q_idx}",
                    "question": q.get("question", ""),
                    "chosen_option": a.get("user_pick") or "None",
                    "correct_answer": q.get("answer", ""),
                    "explanation": q.get("explanation", ""),
                })

        return {
            "battle_id": self.battle_id,
            "difficulty": self.difficulty,
            "user_won": user_won,
            "user_rank": user_rank,
            "podium_title": podium_title,
            "podium": all_participants[:3],
            "total_score": self.user_score,
            "accuracy_pct": accuracy_pct,
            "fastest_correct_ms": fastest_ms,
            "total_questions": len(self.questions),
            "wrong_questions": wrong_question_records,
        }


# In-memory store for solo battles
_SOLO_BATTLES: Dict[str, SoloBattleSession] = {}
SOLO_BATTLE_TTL = 7200  # 2 hours


def get_or_clean_battle(battle_id: str) -> Optional[SoloBattleSession]:
    now = time.time()
    # Cleanup expired
    expired = [k for k, v in _SOLO_BATTLES.items() if now - v.last_active > SOLO_BATTLE_TTL]
    for k in expired:
        _SOLO_BATTLES.pop(k, None)
    return _SOLO_BATTLES.get(battle_id)


def create_solo_battle(battle_id: str, difficulty: str, questions: List[Dict[str, Any]]) -> SoloBattleSession:
    session = SoloBattleSession(battle_id, difficulty, questions)
    _SOLO_BATTLES[battle_id] = session
    return session
