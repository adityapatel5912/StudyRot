"""
TTS Router for StudyRot.
Exposes Fish Audio S2.1 Pro text-to-speech audio streaming and voice presets.
"""

from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Request, Response, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
import tts

router = APIRouter(prefix="/api/tts", tags=["tts"])
limiter = Limiter(key_func=get_remote_address)


class TTSRequestPayload(BaseModel):
    text: str
    voice: Optional[str] = "teacher"


@router.get("/voices")
async def list_voices():
    """Lists available voice profiles (Teacher, Buddy, Narrator)."""
    return {
        "ok": True,
        "data": {
            "voices": tts.get_voice_presets()
        }
    }


@router.post("")
@limiter.limit("100/hour")
async def generate_speech(request: Request, body: TTSRequestPayload):
    """
    Synthesizes speech audio (MP3) from educational text or LaTeX formulas.
    Cached for 1 hour; rate-limited to 100/hour per IP.
    """
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")

    audio_bytes = await tts.synthesize_speech(body.text, voice=body.voice or "teacher")

    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Content-Disposition": "inline; filename=studyrot_speech.mp3",
        },
    )
