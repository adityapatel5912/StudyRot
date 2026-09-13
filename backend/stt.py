"""
AssemblyAI Universal-3.5 Pro Speech-to-Text Module for StudyRot.
Provides high-accuracy transcription with native Hinglish code-switching
and CBSE curriculum contextual vocabulary prompting.
"""

import logging
import asyncio
import httpx
from fastapi import HTTPException
from config import ASSEMBLYAI_API_KEY

logger = logging.getLogger("studyrot.stt")

ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2"


def build_stt_prompt(subject: str = "Science", grade: int = 10, topic: str = "") -> str:
    """Builds curriculum-aware contextual prompt for AssemblyAI Universal-3.5 Pro."""
    base_terms = [
        "refraction", "reflection", "concave mirror", "convex lens", "focal length",
        "principal axis", "sign convention", "magnification", "Snell's law", "dioptre",
        "resistors in series", "parallel", "Ohm's law", "potential difference", "ampere",
        "photosynthesis", "chlorophyll", "mitochondria", "quadratic formula", "discriminant",
        "trigonometry", "sin theta", "cos theta", "tan theta", "hypotenuse", "Satyagraha"
    ]
    topic_clean = topic.strip() if topic else "CBSE Curriculum"
    return (
        f"This is a CBSE Class {grade} {subject} academic tutoring session on {topic_clean}. "
        f"Key domain terms: {', '.join(base_terms[:18])}."
    )


async def transcribe_short(audio_bytes: bytes, context_prompt: str = "") -> str:
    """
    Transcribes a short voice query using AssemblyAI Universal-3.5 Pro.
    Returns transcript text with native Hinglish and English code-switching.
    """
    if not ASSEMBLYAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Speech-to-Text service is not configured (missing ASSEMBLYAI_API_KEY)."
        )

    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(
            status_code=400,
            detail="Audio recording is empty or too short."
        )

    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        # Step 1: Upload raw audio bytes to AssemblyAI storage
        try:
            upload_resp = await client.post(
                f"{ASSEMBLYAI_BASE_URL}/upload",
                headers={**headers, "content-type": "application/octet-stream"},
                content=audio_bytes,
            )
            if upload_resp.status_code != 200:
                logger.error("AssemblyAI audio upload failed (%d): %s", upload_resp.status_code, upload_resp.text)
                raise HTTPException(status_code=502, detail="Failed to upload audio to STT service.")

            upload_url = upload_resp.json().get("upload_url")
            if not upload_url:
                raise HTTPException(status_code=502, detail="Invalid STT upload response.")
        except httpx.RequestError as e:
            logger.error("AssemblyAI network upload error: %s", e)
            raise HTTPException(status_code=504, detail="STT service connection timed out.")

        # Step 2: Submit transcription job with Universal-3.5 Pro model
        transcript_payload = {
            "audio_url": upload_url,
            "speech_models": ["universal-3-5-pro"],
        }
        if context_prompt:
            transcript_payload["prompt"] = context_prompt[:1500]

        try:
            init_resp = await client.post(
                f"{ASSEMBLYAI_BASE_URL}/transcript",
                headers={**headers, "content-type": "application/json"},
                json=transcript_payload,
            )
            # If universal-3-5-pro name format is rejected, retry with fallback
            if init_resp.status_code != 200 and "speech_models" in init_resp.text:
                transcript_payload.pop("speech_models", None)
                init_resp = await client.post(
                    f"{ASSEMBLYAI_BASE_URL}/transcript",
                    headers={**headers, "content-type": "application/json"},
                    json=transcript_payload,
                )

            if init_resp.status_code not in (200, 201):
                logger.error("AssemblyAI transcript init failed (%d): %s", init_resp.status_code, init_resp.text)
                raise HTTPException(status_code=502, detail=f"Failed to initiate transcription: {init_resp.text}")

            transcript_id = init_resp.json().get("id")
            if not transcript_id:
                raise HTTPException(status_code=502, detail="No transcript ID returned from STT service.")
        except httpx.RequestError as e:
            logger.error("AssemblyAI transcript request error: %s", e)
            raise HTTPException(status_code=504, detail="STT service connection timed out.")

        # Step 3: Poll for completion (short voice clips finish in 1-4 seconds)
        poll_url = f"{ASSEMBLYAI_BASE_URL}/transcript/{transcript_id}"
        for _ in range(25):  # Max 25 iterations * 0.5s = 12.5 seconds
            await asyncio.sleep(0.5)
            try:
                poll_resp = await client.get(poll_url, headers=headers)
                if poll_resp.status_code == 200:
                    data = poll_resp.json()
                    status = data.get("status")
                    if status == "completed":
                        return data.get("text", "").strip()
                    elif status == "error":
                        error_msg = data.get("error", "Unknown STT processing error")
                        logger.error("AssemblyAI transcript error: %s", error_msg)
                        raise HTTPException(status_code=500, detail=f"Transcription error: {error_msg}")
            except httpx.RequestError:
                continue

        raise HTTPException(status_code=504, detail="Transcription took too long to complete. Please try again.")
