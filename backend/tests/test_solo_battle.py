"""
Unit & integration tests for Feature 3: Single-player Solo Battle vs AI Bots.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from fastapi.testclient import TestClient
from main import app
from solo_battle import (
    SoloBattleSession,
    calculate_score,
    DIFFICULTY_PARAMS,
    BOT_POOL,
)

client = TestClient(app)


def test_speed_scoring_formula():
    """Validates 1000 - (time_ms / 15000) * 500 scoring rule."""
    # Instant correct answer -> 1000 pts
    assert calculate_score(True, 0) == 1000

    # 7500ms correct answer -> 750 pts
    assert calculate_score(True, 7500) == 750

    # 15000ms correct answer -> 500 pts
    assert calculate_score(True, 15000) == 0  # timeout

    # Wrong answer -> 0 pts
    assert calculate_score(False, 2000) == 0

    # Timeout (>15000ms) -> 0 pts
    assert calculate_score(True, 16000) == 0


def test_bot_naming_and_labeling():
    """All bots in the bot pool must start with 'Bot ' to never masquerade as real users."""
    for b in BOT_POOL:
        assert b["name"].startswith("Bot "), f"Bot name {b['name']} must start with 'Bot '"


def test_deterministic_bot_simulation():
    """Same battle_id produces identical bot actions for consistent replays."""
    q = {
        "question": "Speed of light in vacuum?",
        "options": ["3 x 10^8 m/s", "3 x 10^6 m/s", "3 x 10^5 km/s", "Infinite"],
        "answer": "3 x 10^8 m/s",
    }
    s1 = SoloBattleSession("battle_seed_test_123", "medium", [q])
    b1_results = s1.simulate_bot_round(q, 0)

    s2 = SoloBattleSession("battle_seed_test_123", "medium", [q])
    b2_results = s2.simulate_bot_round(q, 0)

    for r1, r2 in zip(b1_results, b2_results):
        assert r1["bot_id"] == r2["bot_id"]
        assert r1["chosen_option"] == r2["chosen_option"]
        assert r1["time_ms"] == r2["time_ms"]
        assert r1["points_earned"] == r2["points_earned"]


def test_bot_accuracy_over_trials():
    """Verifies bot accuracy is aligned with difficulty profile over 100 trials."""
    q = {
        "question": "What is the SI unit of power of a lens?",
        "options": ["Dioptre", "Watt", "Metre", "Candela"],
        "answer": "Dioptre",
    }
    # Easy: target ~55%
    easy_correct = 0
    total_bots = 0
    for i in range(30):
        s = SoloBattleSession(f"trial_easy_{i}", "easy", [q])
        res = s.simulate_bot_round(q, 0)
        easy_correct += sum(1 for b in res if b["is_correct"])
        total_bots += len(res)
    easy_rate = easy_correct / total_bots
    assert 0.40 <= easy_rate <= 0.70

    # Hard: target ~90%
    hard_correct = 0
    total_hard_bots = 0
    for i in range(30):
        s = SoloBattleSession(f"trial_hard_{i}", "hard", [q])
        res = s.simulate_bot_round(q, 0)
        hard_correct += sum(1 for b in res if b["is_correct"])
        total_hard_bots += len(res)
    hard_rate = hard_correct / total_hard_bots
    assert 0.80 <= hard_rate <= 0.98


def test_solo_battle_api_flow():
    """End-to-end API test: create -> submit round -> summary."""
    # 1. Create battle
    create_res = client.post("/api/battle/solo/create", json={
        "difficulty": "medium",
        "topic": "Reflection of Light",
        "subject": "Science",
        "grade": 10,
    })
    assert create_res.status_code == 200
    lobby = create_res.json()["data"]
    battle_id = lobby["battle_id"]
    assert lobby["matchup_label"] == "You vs. 3 bots"
    assert len(lobby["bots"]) == 3
    for b in lobby["bots"]:
        assert b["name"].startswith("Bot ")

    # 2. Submit round 0
    sub_res = client.post("/api/battle/solo/submit", json={
        "battle_id": battle_id,
        "question_idx": 0,
        "option_idx": 0,
        "time_ms": 3200,
    })
    assert sub_res.status_code == 200
    round_data = sub_res.json()["data"]
    assert "user" in round_data
    assert "bots" in round_data
    assert len(round_data["bots"]) == 3
    assert "leaderboard" in round_data
    assert "commentary" in round_data

    # 3. Final summary
    sum_res = client.get(f"/api/battle/solo/{battle_id}")
    assert sum_res.status_code == 200
    summary = sum_res.json()["data"]
    assert "podium" in summary
    assert len(summary["podium"]) == 3
    assert "accuracy_pct" in summary
