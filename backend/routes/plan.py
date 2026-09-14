"""
Adaptive Study Pathway API Routes for StudyRot.
Delivers 7-day personalized study calendars, session completions,
streak calculations, and manual plan regenerations.
"""

from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field

from planner import generate_weekly_study_plan
from db import db
from auth import get_current_user_optional

router = APIRouter(prefix="/api/plan", tags=["plan"])


class RegeneratePlanRequest(BaseModel):
    daily_budget_min: int = Field(45, ge=15, le=180, description="Daily study budget in minutes")
    exam_date: Optional[str] = None


class SessionCompleteRequest(BaseModel):
    completed: bool = True


@router.get("/current")
async def get_current_plan(request: Request):
    """Retrieves current week's personalized study plan."""
    user = await get_current_user_optional(request)
    user_id = user["id"] if user else "guest"

    today = date.today()
    week_start = (today - timedelta(days=today.weekday())).isoformat()

    plan_record = await db.get_study_plan(user_id, week_start)
    if not plan_record:
        # Generate fresh weekly plan
        review_states = await db.get_user_review_states(user_id) if user else []
        error_patterns = await db.get_user_error_patterns(user_id) if user else []

        plan_data = generate_weekly_study_plan(
            user_id=user_id,
            week_start_date=today - timedelta(days=today.weekday()),
            daily_budget_min=45,
            review_states=review_states,
            error_patterns=error_patterns,
        )
        plan_record = await db.save_study_plan(user_id, week_start, plan_data)

    return {
        "ok": True,
        "data": plan_record.get("plan_json") or plan_record,
    }


@router.post("/regenerate")
async def regenerate_plan(request: Request, body: RegeneratePlanRequest):
    """Forces fresh generation of current week's study plan."""
    user = await get_current_user_optional(request)
    user_id = user["id"] if user else "guest"

    today = date.today()
    week_start = (today - timedelta(days=today.weekday())).isoformat()

    review_states = await db.get_user_review_states(user_id) if user else []
    error_patterns = await db.get_user_error_patterns(user_id) if user else []

    plan_data = generate_weekly_study_plan(
        user_id=user_id,
        week_start_date=today - timedelta(days=today.weekday()),
        daily_budget_min=body.daily_budget_min,
        exam_date_str=body.exam_date,
        review_states=review_states,
        error_patterns=error_patterns,
    )
    saved = await db.save_study_plan(user_id, week_start, plan_data)
    return {"ok": True, "data": saved.get("plan_json") or saved}


@router.post("/session/{session_id}/complete")
async def toggle_session_complete(request: Request, session_id: str, body: SessionCompleteRequest):
    """Marks a session completed or incomplete and updates day status."""
    user = await get_current_user_optional(request)
    user_id = user["id"] if user else "guest"

    today = date.today()
    week_start = (today - timedelta(days=today.weekday())).isoformat()

    record = await db.get_study_plan(user_id, week_start)
    if not record:
        raise HTTPException(status_code=404, detail="Study plan not found")

    plan = record.get("plan_json", {})
    session_found = False

    for d in plan.get("days", []):
        for s in d.get("sessions", []):
            if s.get("id") == session_id:
                s["completed"] = body.completed
                session_found = True
                break

        # Check if 70% of day's minutes are completed for streak credit
        completed_min = sum(s["minutes"] for s in d.get("sessions", []) if s.get("completed"))
        total_min = d.get("total_minutes", 45)
        d["completed"] = (completed_min / max(1, total_min)) >= 0.70

    if session_found:
        await db.save_study_plan(user_id, week_start, plan)
        return {"ok": True, "data": plan}

    raise HTTPException(status_code=404, detail="Session not found in current plan")


@router.get("/history")
async def get_plan_history(request: Request):
    """Retrieves previous weekly study plans for signed-in user."""
    user = await get_current_user_optional(request)
    if not user:
        return {"ok": True, "data": []}
    plans = await db.get_user_study_plans(user["id"])
    return {"ok": True, "data": plans}
