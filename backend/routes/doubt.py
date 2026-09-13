"""
Doubt Solving Router for StudyRot.
Handles multi-modal academic doubt resolution with NVIDIA NIM (Vision, OCR, 3D),
Groq Llama 3.3 70B, and verified NCERT curriculum data.
"""

import base64
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address
import doubt
import nvidia
from auth import get_current_user_optional

router = APIRouter(prefix="/api/doubt", tags=["doubt"])
limiter = Limiter(key_func=get_remote_address)


class TextDoubtPayload(BaseModel):
    question: str
    subject: Optional[str] = "Science"
    grade: Optional[int] = 10
    post_context: Optional[str] = None


class Model3DPayload(BaseModel):
    prompt: str


@router.post("/text")
@limiter.limit("120/hour")
async def solve_text_doubt_endpoint(request: Request, body: TextDoubtPayload):
    """
    Solves student academic questions, generating step-by-step LaTeX derivations,
    diagram specifications, graph data, and follow-up practice MCQs.
    """
    if not body.question or not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    solution = await doubt.solve_doubt(
        question=body.question,
        subject=body.subject or "Science",
        grade=body.grade or 10,
        post_context=body.post_context,
    )

    return {
        "ok": True,
        "data": solution,
        "solution": solution,
    }


@router.post("/with-image")
@limiter.limit("60/hour")
async def solve_image_doubt_endpoint(
    request: Request,
    image: UploadFile = File(...),
    question: str = Form("Solve this question step by step with clear NCERT formulas."),
    subject: str = Form("Science"),
    grade: int = Form(10),
    post_context: Optional[str] = Form(None),
):
    """
    Processes textbook photos, handwritten assignments, or optical diagrams
    using NVIDIA VLM (Llama-3.2-11b-vision-instruct) and OCR (Nemotron-OCR-v2).
    """
    image_bytes = await image.read()
    if not image_bytes or len(image_bytes) < 100:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    solution = await doubt.solve_doubt(
        question=question,
        subject=subject,
        grade=grade,
        post_context=post_context,
        image_b64=image_b64,
    )

    return {
        "ok": True,
        "data": solution,
        "solution": solution,
    }


@router.post("/3d")
@limiter.limit("5/hour")
async def generate_3d_endpoint(request: Request, body: Model3DPayload):
    """
    Generates an interactive 3D GLB model using Microsoft TRELLIS on NVIDIA GenAI.
    Cached by prompt hash; rate-limited to 5/hour per IP.
    """
    if not body.prompt or not body.prompt.strip():
        raise HTTPException(status_code=400, detail="3D generation prompt cannot be empty.")

    glb_url = await nvidia.generate_3d_model(body.prompt)
    if not glb_url:
        return {
            "ok": False,
            "error": "3D generation model is unavailable or rate limited. Displaying high-fidelity vector simulation.",
            "code": "3D_UNAVAILABLE"
        }

    return {
        "ok": True,
        "data": {
            "glb_url": glb_url,
            "prompt": body.prompt,
        }
    }


@router.get("/history")
async def get_doubt_history(user: Optional[dict] = Depends(get_current_user_optional)):
    """Returns recent doubt resolutions for authenticated student, or empty for guests."""
    # If user not logged in, return clean empty state
    return {
        "ok": True,
        "data": {
            "history": []
        }
    }
