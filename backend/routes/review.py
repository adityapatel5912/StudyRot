"""
Exam-Date-Aware Spaced Repetition (FSRS-6) Route Handlers.
Endpoints:
- PUT  /api/profile/exam-date
- GET  /api/review/today
- POST /api/review/rate
- GET  /api/review/cutoffs
- GET  /api/review/weakness
- POST /api/review/record-error
"""

import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Request, HTTPException, Depends

from auth import get_current_user_optional
from db import db
from review import (
    update_fsrs_state,
    calculate_exam_retrievability,
    compute_marginal_gain,
    compute_subject_cutoffs,
    classify_error,
    generate_weakness_report,
)

logger = logging.getLogger("studyrot.routes.review")
router = APIRouter(tags=["review"])


class ExamDatePayload(BaseModel):
    exam_date: str


class RateCardPayload(BaseModel):
    card_id: str
    rating: int  # 1: Forgot, 2: Hard, 3: Good, 4: Easy
    subject: Optional[str] = "Science"
    grade: Optional[int] = 10
    topic: Optional[str] = "CBSE Chapter"


class RecordErrorPayload(BaseModel):
    card_id: str
    question: str
    chosen_option: str
    correct_answer: str
    explanation: Optional[str] = ""
    groq_key: Optional[str] = ""


@router.put("/api/profile/exam-date")
async def set_exam_date(body: ExamDatePayload, user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "guest_user"
    await db.set_user_exam_date(user_id, body.exam_date)
    return {"ok": True, "data": {"exam_date": body.exam_date}}


@router.get("/api/review/cutoffs")
async def get_cutoffs(user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "guest_user"
    exam_date_str = await db.get_user_exam_date(user_id) or "2027-02-20"
    cutoffs = compute_subject_cutoffs(exam_date_str)
    return {"ok": True, "data": cutoffs}


@router.get("/api/review/today")
async def get_today_review_queue(user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "guest_user"
    exam_date_str = await db.get_user_exam_date(user_id) or "2027-02-20"
    try:
        exam_dt = datetime.fromisoformat(exam_date_str.replace("Z", "+00:00"))
        if exam_dt.tzinfo is None:
            exam_dt = exam_dt.replace(tzinfo=timezone.utc)
    except Exception:
        exam_dt = datetime(2027, 2, 20, tzinfo=timezone.utc)

    records = await db.get_user_review_states(user_id)
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    queue = []
    for r in records:
        # Check if due for review
        next_rev = r.get("next_review")
        is_due = True
        if next_rev:
            try:
                nxt_dt = datetime.fromisoformat(next_rev.replace("Z", "+00:00"))
                if nxt_dt > now:
                    is_due = False
            except Exception:
                is_due = True

        stability = float(r.get("stability") or 0)
        difficulty = float(r.get("difficulty") or 5.0)
        last_rev = r.get("last_reviewed")

        retrievability = calculate_exam_retrievability(stability, now, exam_dt)
        marginal_gain = compute_marginal_gain(stability, difficulty, last_rev, exam_dt)

        item = dict(r)
        item["retrievability_pct"] = int(round(retrievability * 100))
        item["marginal_gain"] = marginal_gain
        item["is_due"] = is_due
        queue.append(item)

    # Sort queue by marginal gain descending
    queue.sort(key=lambda x: (x["is_due"], x["marginal_gain"]), reverse=True)
    daily_queue = queue[:15]  # Standard 12-15 cards

    return {
        "ok": True,
        "data": {
            "queue": daily_queue,
            "total_due": len([q for q in queue if q["is_due"]]),
            "estimated_minutes": max(1, int(round(len(daily_queue) * 0.8))),
            "exam_date": exam_date_str,
        },
    }


@router.post("/api/review/rate")
async def rate_review_card(body: RateCardPayload, user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "guest_user"
    records = await db.get_user_review_states(user_id)
    existing = next((r for r in records if r.get("card_id") == body.card_id), None)

    curr_stability = float(existing.get("stability", 0)) if existing else 0.0
    curr_diff = float(existing.get("difficulty", 5.0)) if existing else 5.0
    last_rev = existing.get("last_reviewed") if existing else None
    rev_count = int(existing.get("review_count", 0)) if existing else 0

    new_s, new_d, last_iso, next_iso = update_fsrs_state(
        current_stability=curr_stability,
        current_difficulty=curr_diff,
        rating=body.rating,
        last_reviewed_iso=last_rev,
    )

    updated = await db.upsert_review_state(
        user_id=user_id,
        card_id=body.card_id,
        subject=body.subject or "Science",
        grade=body.grade or 10,
        topic=body.topic or "CBSE Chapter",
        stability=new_s,
        difficulty=new_d,
        last_reviewed=last_iso,
        next_review=next_iso,
        review_count=rev_count + 1,
    )

    return {
        "ok": True,
        "data": {
            "card_id": body.card_id,
            "stability": new_s,
            "difficulty": new_d,
            "next_review": next_iso,
            "review_count": rev_count + 1,
        },
    }


@router.post("/api/review/record-error")
async def record_error(body: RecordErrorPayload, user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "guest_user"
    error_type = await classify_error(
        question=body.question,
        chosen_option=body.chosen_option,
        correct_answer=body.correct_answer,
        explanation=body.explanation or "",
        groq_key=body.groq_key,
    )

    await db.record_error_pattern(
        user_id=user_id,
        card_id=body.card_id,
        error_type=error_type,
    )

    return {
        "ok": True,
        "data": {
            "card_id": body.card_id,
            "error_type": error_type,
        },
    }


@router.get("/api/review/weakness")
async def get_weakness_report(user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    user_id = user["id"] if user else "guest_user"
    errors = await db.get_user_error_patterns(user_id)
    report = generate_weakness_report(errors)
    return {
        "ok": True,
        "data": {
            "report": report,
            "total_errors": len(errors),
            "unlocked": report is not None,
        },
    }
