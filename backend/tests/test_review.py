"""
Unit & integration tests for Feature 2: Exam-Date-Aware Spaced Repetition (FSRS-6)
and Error Pattern Detection.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from main import app
from review import (
    calculate_retrievability,
    update_fsrs_state,
    calculate_exam_retrievability,
    compute_marginal_gain,
    compute_subject_cutoffs,
    classify_error,
    generate_weakness_report,
)

client = TestClient(app)


def test_fsrs_retrievability_decay():
    """Validates FSRS power decay formula R(t, S) = (1 + 1/9 * (t/S))^(-1)."""
    # At t = 0, R = 1.0
    assert calculate_retrievability(0, 10.0) == 1.0

    # At t = S, R = 0.90
    r_target = calculate_retrievability(10.0, 10.0)
    assert round(r_target, 2) == 0.90

    # Monotonically decreasing
    r_2s = calculate_retrievability(20.0, 10.0)
    assert r_2s < r_target
    assert round(r_2s, 3) == round(1.0 / (1.0 + 2.0 / 9.0), 3)


def test_fsrs_state_updates():
    """Validates FSRS rating updates for Forgot (1), Hard (2), Good (3), Easy (4)."""
    # Initial review: Good (3)
    s, d, last_rev, next_rev = update_fsrs_state(0, 5.0, 3)
    assert s == 3.2
    assert d == 5.0
    assert next_rev > last_rev

    # Subsequent review: Good (3)
    s2, d2, _, next_rev2 = update_fsrs_state(s, d, 3, last_reviewed_iso=last_rev)
    assert s2 > s
    assert d2 >= 1.0

    # Forgot rating (1) resets stability
    s_forgot, d_forgot, _, next_rev_forgot = update_fsrs_state(s2, d2, 1, last_reviewed_iso=last_rev)
    assert s_forgot < s2
    assert s_forgot >= 0.25


def test_cutoff_date_computation():
    """Calculates subject cutoff dates for board exam."""
    exam_str = "2027-02-20"
    cutoffs = compute_subject_cutoffs(exam_str)
    assert cutoffs["exam_date"] == "2027-02-20"
    assert "Science" in cutoffs["subjects"]
    assert "Maths" in cutoffs["subjects"]
    assert "SST" in cutoffs["subjects"]

    # Science needs 28 days lead time
    sci = cutoffs["subjects"]["Science"]
    assert sci["lead_days_required"] == 28
    assert sci["cutoff_date"] == "2027-01-23"


@pytest.mark.asyncio
async def test_error_classification():
    """Verifies heuristic error classifier categorizes accurately."""
    # Sign error in physics
    sign_err = await classify_error(
        question="What is the focal length of a concave mirror?",
        chosen_option="+15 cm",
        correct_answer="-15 cm",
        explanation="Concave mirror focal length is negative according to Cartesian sign convention.",
    )
    assert sign_err == "sign_error"

    # Formula confusion
    formula_err = await classify_error(
        question="Which equation relates current and resistance at constant temperature?",
        chosen_option="P = VI",
        correct_answer="V = IR",
        explanation="Ohm's law formula is V = IR.",
    )
    assert formula_err == "formula_confusion"

    # Negation misread
    misread_err = await classify_error(
        question="Which of the following is NOT an allotrope of carbon?",
        chosen_option="Diamond",
        correct_answer="Quartz",
        explanation="Quartz is a silicon dioxide compound, not a carbon allotrope.",
    )
    assert misread_err == "misread"


def test_weakness_report_threshold():
    """Report returns None until 10+ wrong answers are recorded."""
    records_9 = [{"error_type": "sign_error"} for _ in range(9)]
    assert generate_weakness_report(records_9) is None

    records_10 = [{"error_type": "sign_error"} for _ in range(10)]
    report = generate_weakness_report(records_10)
    assert report is not None
    assert report["top_error_type"] == "sign_error"
    assert report["top_error_count"] == 10
    assert "Sign Convention" in report["title"]
    assert "5-minute" in report["recommended_fix"]


def test_review_endpoints():
    """Tests PUT /api/profile/exam-date, POST /api/review/rate, GET /api/review/today."""
    # 1. Set exam date
    res = client.put("/api/profile/exam-date", json={"exam_date": "2027-03-01"})
    assert res.status_code == 200
    assert res.json()["data"]["exam_date"] == "2027-03-01"

    # 2. Rate a card
    res_rate = client.post("/api/review/rate", json={
        "card_id": "card_test_101",
        "rating": 3,
        "subject": "Science",
        "grade": 10,
        "topic": "Reflection",
    })
    assert res_rate.status_code == 200
    r_data = res_rate.json()["data"]
    assert r_data["card_id"] == "card_test_101"
    assert r_data["stability"] > 0
    assert r_data["review_count"] == 1

    # 3. Check today's queue
    res_today = client.get("/api/review/today")
    assert res_today.status_code == 200
    t_data = res_today.json()["data"]
    assert "queue" in t_data
    assert len(t_data["queue"]) >= 1
    assert "retrievability_pct" in t_data["queue"][0]
