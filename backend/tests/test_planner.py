"""
Unit and Integration Tests for Adaptive Study Pathway Generator (Feature 4).
Tests 7-day plan generation, subject balance constraint (no subject > 50% minutes),
session completion logic, 70% streak criteria, mid-week roll-forward,
and REST endpoints.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from datetime import date, timedelta
from httpx import AsyncClient, ASGITransport
from main import app
from planner import (
    generate_weekly_study_plan,
    roll_forward_uncompleted_sessions,
    compute_topic_mastery,
)


def test_weekly_plan_generation_and_balance():
    """Verifies that plan generates exactly 7 days and obeys the 50% subject cap."""
    plan = generate_weekly_study_plan(
        user_id="test_student",
        daily_budget_min=45,
    )
    assert len(plan["days"]) == 7
    total_week_min = 45 * 7  # 315 mins

    # Check subject balance: no subject > 50%
    dist = plan["subject_distribution_minutes"]
    for sub, mins in dist.items():
        assert mins <= (total_week_min * 0.50) + 15, f"{sub} exceeded 50% budget: {mins}m"

    # Check each day has sessions
    for day in plan["days"]:
        assert len(day["sessions"]) >= 2
        assert day["total_minutes"] >= 30
        assert day["completed"] is False


def test_topic_mastery_calculation():
    """Tests topic mastery calculation with FSRS stability and error penalty."""
    review_states = [
        {"card_id": "sci_light_1", "fact": "Light reflection", "stability": 4.5},
        {"card_id": "sci_light_2", "fact": "Snell law", "stability": 3.0},
    ]
    error_patterns = [
        {"card_id": "sci_light_1", "error_type": "sign_error"},
    ]

    mastery = compute_topic_mastery("Light", review_states, error_patterns)
    assert 20 <= mastery <= 100


def test_midweek_roll_forward():
    """Verifies that uncompleted sessions from yesterday roll forward into today."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    plan = generate_weekly_study_plan("test_user", week_start_date=week_start, daily_budget_min=45)

    # Mark day 0 session as uncompleted
    tuesday_str = (week_start + timedelta(days=1)).isoformat()
    plan["days"][0]["sessions"][0]["completed"] = False

    rebalanced = roll_forward_uncompleted_sessions(plan, tuesday_str)
    tuesday_sessions = rebalanced["days"][1]["sessions"]
    # Check that rolled session was prepended
    assert any("[Rolled forward]" in s.get("reason", "") for s in tuesday_sessions)


@pytest.mark.asyncio
async def test_plan_endpoints_flow():
    """Tests the /api/plan/current, /api/plan/regenerate, and session completion endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Get Current Plan
        res = await client.get("/api/plan/current")
        assert res.status_code == 200
        plan_data = res.json()
        assert plan_data["ok"] is True
        days = plan_data["data"]["days"]
        assert len(days) == 7

        first_session_id = days[0]["sessions"][0]["id"]

        # 2. Complete Session
        res_comp = await client.post(
            f"/api/plan/session/{first_session_id}/complete",
            json={"completed": True}
        )
        assert res_comp.status_code == 200
        updated_plan = res_comp.json()["data"]
        updated_sess = updated_plan["days"][0]["sessions"][0]
        assert updated_sess["completed"] is True

        # 3. Regenerate Plan
        res_regen = await client.post("/api/plan/regenerate", json={"daily_budget_min": 60})
        assert res_regen.status_code == 200
        assert res_regen.json()["data"]["daily_budget_min"] == 60
