"""
Text-to-Speech (TTS) Module for StudyRot.
Integrates Fish Audio S2.1 Pro Free via OpenRouter or Fish Audio API,
with LaTeX-to-speech phonetic transformation and LRU audio caching.
"""

import os
import time
import hashlib
import logging
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException
from config import (
    OPENROUTER_API_KEY,
    FISH_AUDIO_API_KEY,
    FISH_VOICE_TEACHER,
    FISH_VOICE_BUDDY,
    FISH_VOICE_NARRATOR,
)
from tts_latex import latex_to_spoken

logger = logging.getLogger("studyrot.tts")

FISH_TTS_URL = "https://api.fish.audio/v1/tts"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# In-memory LRU cache: cache_key -> (timestamp, audio_bytes)
_TTS_CACHE: Dict[str, tuple[float, bytes]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour
MAX_CACHE_SIZE = 250


def get_voice_presets() -> Dict[str, Dict[str, str]]:
    """Returns available voice profiles with names and descriptions."""
    return {
        "teacher": {
            "name": "Teacher",
            "description": "Calm, clear, and reassuring NCERT tutor for structured explanations.",
            "reference_id": FISH_VOICE_TEACHER,
            "speed": "1.0",
        },
        "buddy": {
            "name": "Study Buddy",
            "description": "Energetic, fast-paced peer tutor for quick doubt resolution and drills.",
            "reference_id": FISH_VOICE_BUDDY,
            "speed": "1.1",
        },
        "narrator": {
            "name": "Narrator",
            "description": "Deliberate and articulate cadence for formulas, laws, and definitions.",
            "reference_id": FISH_VOICE_NARRATOR,
            "speed": "0.95",
        },
    }


def _get_cache(key: str) -> Optional[bytes]:
    now = time.time()
    if key in _TTS_CACHE:
        ts, data = _TTS_CACHE[key]
        if now - ts < CACHE_TTL_SECONDS:
            return data
        else:
            del _TTS_CACHE[key]
    return None


def _set_cache(key: str, data: bytes):
    now = time.time()
    if len(_TTS_CACHE) >= MAX_CACHE_SIZE:
        # Evict oldest entry
        oldest_key = min(_TTS_CACHE.keys(), key=lambda k: _TTS_CACHE[k][0])
        del _TTS_CACHE[oldest_key]
    _TTS_CACHE[key] = (now, data)


async def synthesize_speech(text: str, voice: str = "teacher") -> bytes:
    """
    Synthesizes speech from text using Fish Audio S2.1 Pro Free.
    Pre-processes all LaTeX formulas to natural spoken wording and checks cache.
    """
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Convert LaTeX formulas ($...$ or \frac{}{}) into spoken phonetics
    spoken_text = latex_to_spoken(text)

    # Check cache
    cache_key = hashlib.sha256(f"{voice}:{spoken_text}".encode("utf-8")).hexdigest()
    cached_audio = _get_cache(cache_key)
    if cached_audio:
        logger.debug("Returning cached TTS audio for '%s'", spoken_text[:30])
        return cached_audio

    # Check available API keys
    api_key = FISH_AUDIO_API_KEY or OPENROUTER_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="TTS service is not configured (missing FISH_AUDIO_API_KEY or OPENROUTER_API_KEY)."
        )

    presets = get_voice_presets()
    voice_info = presets.get(voice.lower(), presets["teacher"])
    voice_ref = voice_info["reference_id"] or None

    # Call Fish Audio API
    if FISH_AUDIO_API_KEY:
        headers = {
            "Authorization": f"Bearer {FISH_AUDIO_API_KEY}",
            "Content-Type": "application/json",
            "model": "s2.1-pro-free",
        }
        payload: Dict[str, Any] = {
            "text": spoken_text,
            "format": "mp3",
            "sample_rate": 44100,
            "mp3_bitrate": 128,
            "latency": "normal",
            "prosody": {"speed": float(voice_info.get("speed", 1.0)), "volume": 0, "normalize_loudness": True},
        }
        if voice_ref:
            payload["reference_id"] = voice_ref

        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                resp = await client.post(FISH_TTS_URL, headers=headers, json=payload)
                if resp.status_code == 200 and len(resp.content) > 100:
                    _set_cache(cache_key, resp.content)
                    return resp.content
                logger.warning("Fish Audio native TTS returned status %d: %s", resp.status_code, resp.text[:200])
            except httpx.RequestError as err:
                logger.warning("Fish Audio request error: %s", err)

    # Fallback to OpenRouter with fish-audio/s2.1-pro-free:free
    if OPENROUTER_API_KEY:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://studyrot.vercel.app",
            "X-Title": "StudyRot CBSE Tutor",
        }
        payload = {
            "model": "fish-audio/s2.1-pro-free:free",
            "messages": [{"role": "user", "content": spoken_text}],
            "modalities": ["audio"],
            "audio": {"voice": voice_ref or "alloy", "format": "mp3"},
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                resp = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
                if resp.status_code == 200:
                    res_json = resp.json()
                    # Extract audio if returned in choices
                    audio_b64 = res_json.get("choices", [{}])[0].get("message", {}).get("audio", {}).get("data")
                    if audio_b64:
                        import base64
                        audio_bytes = base64.b64decode(audio_b64)
                        _set_cache(cache_key, audio_bytes)
                        return audio_bytes
            except Exception as e:
                logger.warning("OpenRouter TTS call failed: %s", e)

    raise HTTPException(
        status_code=502,
        detail="TTS audio generation failed from providers. Please try again."
    )
