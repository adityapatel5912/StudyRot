"""
Check My Work Routes for StudyRot.
Accepts student solution photos, coordinates the multi-model OCR and reasoning pipeline,
and returns step-by-step diagnostic feedback.
"""

import base64
from typing import Optional, List
from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field

from check_work import grade_solution_pipeline, check_rate_limits, SAMPLE_PHYSICS_NUMERICAL
from auth_keys import get_user_nvidia_key, get_user_groq_key
from auth import get_current_user_optional
from db import db

router = APIRouter(prefix="/api/check-work", tags=["check_work"])


class BatchCheckRequest(BaseModel):
    images: List[str] = Field(..., max_length=5, description="Base64 encoded images (up to 5)")
    question: Optional[str] = None
    nvidia_key: Optional[str] = None
    groq_key: Optional[str] = None


@router.post("")
async def check_work_single(
    request: Request,
    file: Optional[UploadFile] = File(None),
    image_b64: Optional[str] = Form(None),
    question: Optional[str] = Form(None),
    nvidia_key: Optional[str] = Form(None),
    groq_key: Optional[str] = Form(None),
):
    """Processes a single student handwritten solution photo."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    check_rate_limits(client_ip, is_batch=False)

    b64_data = ""
    if file:
        content = await file.read()
        b64_data = base64.b64encode(content).decode("utf-8")
    elif image_b64:
        b64_data = image_b64
    else:
        # If no image provided, return the sample problem demo
        return {"ok": True, "data": SAMPLE_PHYSICS_NUMERICAL}

    user_nvidia = get_user_nvidia_key(request, nvidia_key)
    user_groq = get_user_groq_key(request, groq_key)

    report = await grade_solution_pipeline(
        image_b64=b64_data,
        question_text=question or "",
        user_nvidia_key=user_nvidia,
        user_groq_key=user_groq,
    )

    user = await get_current_user_optional(request)
    if user:
        await db.save_check_work_result(user["id"], report)

    return {"ok": True, "data": report}


@router.post("/batch")
async def check_work_batch(request: Request, body: BatchCheckRequest):
    """Processes up to 5 homework photos in batch mode."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    check_rate_limits(client_ip, is_batch=True)

    if len(body.images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images per batch upload.")

    user_nvidia = get_user_nvidia_key(request, body.nvidia_key)
    user_groq = get_user_groq_key(request, body.groq_key)

    reports = []
    for idx, img_b64 in enumerate(body.images):
        res = await grade_solution_pipeline(
            image_b64=img_b64,
            question_text=f"{body.question or 'Problem'} (Page {idx + 1})",
            user_nvidia_key=user_nvidia,
            user_groq_key=user_groq,
        )
        reports.append(res)

    user = await get_current_user_optional(request)
    if user:
        await db.save_check_work_result(user["id"], {"batch_reports": reports})

    return {"ok": True, "data": {"pages_processed": len(reports), "reports": reports}}


@router.get("/history")
async def get_check_work_history(request: Request):
    """Returns past check-work diagnostic results for signed-in users."""
    user = await get_current_user_optional(request)
    if not user:
        return {"ok": True, "data": []}
    history = await db.get_check_work_history(user["id"])
    return {"ok": True, "data": history}
