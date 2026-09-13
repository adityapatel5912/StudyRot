"""
STT Router for StudyRot.
Exposes AssemblyAI Universal-3.5 Pro transcription API.
"""

from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
import stt

router = APIRouter(prefix="/api/stt", tags=["stt"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/sync")
@limiter.limit("60/hour")
async def transcribe_sync(
    request: Request,
    audio: UploadFile = File(...),
    subject: str = Form("Science"),
    grade: int = Form(10),
    topic: str = Form(""),
):
    """
    Transcribes audio recording up to 60 seconds with AssemblyAI Universal-3.5 Pro.
    Supports native Hinglish code-switching and CBSE vocabulary guidance.
    """
    audio_bytes = await audio.read()
    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")

    context_prompt = stt.build_stt_prompt(subject, grade, topic)
    transcript_text = await stt.transcribe_short(audio_bytes, context_prompt=context_prompt)

    return {
        "ok": True,
        "data": {
            "transcript": transcript_text,
            "subject": subject,
            "grade": grade,
        },
    }
