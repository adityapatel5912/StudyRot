"""
Mock Test API Routes for StudyRot.
Handles mock test creation, auto-saving answers, scoring with CBSE marking schemes,
and result report generation with FSRS-6 synchronization.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from db import db
from auth import get_current_user_optional
from auth_keys import get_user_groq_key
from mock import assemble_mock_paper, grade_mock_submission, get_available_templates

router = APIRouter(prefix="/api/mock", tags=["mock"])


class MockCreateRequest(BaseModel):
    subject: str = Field(..., description="Subject name e.g. Science, Maths, SST")
    grade: int = Field(10, description="Grade 8 to 12")
    template_id: Optional[str] = None


class MockAutosaveRequest(BaseModel):
    answers: Dict[str, Any] = Field(default_factory=dict)
    duration_sec: int = 0


class MockSubmitRequest(BaseModel):
    answers: Dict[str, Any] = Field(default_factory=dict)
    duration_sec: int = 0
    groq_key: Optional[str] = None


@router.get("/templates")
async def list_templates():
    """Lists all available CBSE mock test blueprints."""
    templates = get_available_templates()
    return {"ok": True, "data": templates}


@router.post("/create")
async def create_mock(request: Request, body: MockCreateRequest):
    """Generates a full-length CBSE mock paper."""
    user = await get_current_user_optional(request)
    user_id = user["id"] if user else None

    paper = assemble_mock_paper(body.subject, body.grade, body.template_id)
    if user:
        paper["user_id"] = user_id

    record = await db.create_mock_test(
        user_id=user_id,
        subject=body.subject,
        grade=body.grade,
        paper_json=paper,
    )

    return {
        "ok": True,
        "data": {
            "id": record["id"],
            "mock_id": record["id"],
            "paper": paper,
            "started_at": record["started_at"],
        }
    }


@router.post("/{mock_id}/autosave")
async def autosave_mock(mock_id: str, body: MockAutosaveRequest):
    """Auto-saves candidate answers every 30 seconds."""
    existing = await db.get_mock_test(mock_id)
    if not existing:
        return JSONResponse(status_code=404, content={"ok": False, "error": "Mock test not found"})

    await db.update_mock_test(mock_id, {
        "answers_json": body.answers,
        "duration_sec": body.duration_sec,
    })
    return {"ok": True, "saved_at": existing.get("started_at")}


@router.post("/{mock_id}/submit")
async def submit_mock(request: Request, mock_id: str, body: MockSubmitRequest):
    """Grades mock paper against CBSE marking schemes and updates FSRS queue."""
    existing = await db.get_mock_test(mock_id)
    if not existing:
        return JSONResponse(status_code=404, content={"ok": False, "error": "Mock test not found"})

    paper = existing.get("paper_json", {})
    user_groq = get_user_groq_key(request, body.groq_key)

    report = await grade_mock_submission(
        paper=paper,
        answers=body.answers,
        duration_sec=body.duration_sec,
        user_groq_key=user_groq,
    )

    await db.update_mock_test(mock_id, {
        "answers_json": body.answers,
        "score": report["total_score"],
        "duration_sec": body.duration_sec,
        "status": "completed",
    })

    return {"ok": True, "data": report}


@router.get("/{mock_id}")
async def get_mock(mock_id: str):
    """Retrieves mock test paper and saved state."""
    record = await db.get_mock_test(mock_id)
    if not record:
        return JSONResponse(status_code=404, content={"ok": False, "error": "Mock test not found"})
    return {"ok": True, "data": record}


@router.get("/history")
async def get_mock_history(request: Request):
    """Retrieves previous mock tests for signed-in user or empty for guests."""
    user = await get_current_user_optional(request)
    if not user:
        return {"ok": True, "data": []}
    history = await db.get_user_mock_history(user["id"])
    return {"ok": True, "data": history}


@router.get("/{mock_id}/pdf")
async def export_mock_pdf(mock_id: str):
    """Returns HTML print report formatted for PDF download."""
    record = await db.get_mock_test(mock_id)
    if not record:
        raise HTTPException(status_code=404, detail="Mock test not found")

    paper = record.get("paper_json", {})
    answers = record.get("answers_json", {})
    score = record.get("score", 0)
    total = record.get("total_marks", 80)

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>StudyRot CBSE Mock Report - {paper.get('title')}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1e293b; }}
    .header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }}
    .score-box {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; display: inline-block; margin-bottom: 24px; }}
    .section {{ margin-top: 24px; }}
    .question {{ margin-bottom: 16px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; }}
    .badge {{ display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }}
  </style>
</head>
<body>
  <div class="header">
    <h1>StudyRot CBSE Board Mock Test Report</h1>
    <p><strong>{paper.get('title')}</strong> | Subject: {paper.get('subject')} | Grade: {paper.get('grade')}</p>
  </div>
  <div class="score-box">
    <h2>Score: {score} / {total}</h2>
    <p>Status: {record.get('status')}</p>
  </div>
  <div class="section">
    <h3>Detailed Performance Summary</h3>
    <p>This report was generated by StudyRot Retention Engine with FSRS-6 calibration.</p>
  </div>
</body>
</html>"""
    return Response(content=html, media_type="text/html")
