"""
Key resolution and BYOK (Bring-Your-Own-Key) enforcement module.
Guarantees that developer/server environment variables (GROQ_API_KEY, NVIDIA_API_KEY, etc.)
are never consumed by end-user requests.
Only platform-designated voice infrastructure keys (AssemblyAI for STT and OpenRouter for Fish Audio TTS)
are used by the system for voice operations.
"""

import logging
from typing import Optional
from fastapi import Request

logger = logging.getLogger("studyrot.auth_keys")


def get_user_groq_key(request: Optional[Request] = None, body_key: Optional[str] = None) -> Optional[str]:
    """
    Extracts the user's personal Groq API key from request headers, body, or cookies.
    NEVER falls back to server GROQ_API_KEY.
    """
    if body_key and body_key.strip():
        k = body_key.strip()
        if k.upper() != "DEMO":
            return k

    if request:
        # Check custom header
        header_key = request.headers.get("X-Groq-Key") or request.headers.get("x-groq-key")
        if header_key and header_key.strip():
            k = header_key.strip()
            if k.upper() != "DEMO":
                return k

        # Check authorization bearer if it looks like a groq key (gsk_...)
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer gsk_"):
            return auth_header[7:].strip()

    return None


def get_user_nvidia_key(request: Optional[Request] = None, body_key: Optional[str] = None) -> Optional[str]:
    """
    Extracts the user's personal NVIDIA NIM API key from request headers or body.
    NEVER falls back to server NVIDIA_API_KEY.
    """
    if body_key and body_key.strip():
        k = body_key.strip()
        if k.upper() != "DEMO":
            return k

    if request:
        header_key = request.headers.get("X-Nvidia-Key") or request.headers.get("x-nvidia-key")
        if header_key and header_key.strip():
            k = header_key.strip()
            if k.upper() != "DEMO":
                return k

        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer nvapi-"):
            return auth_header[7:].strip()

    return None


def get_user_tavily_key(request: Optional[Request] = None, body_key: Optional[str] = None) -> Optional[str]:
    """
    Extracts the user's personal Tavily API key.
    NEVER falls back to server TAVILY_API_KEY.
    """
    if body_key and body_key.strip():
        k = body_key.strip()
        if k.upper() != "DEMO":
            return k

    if request:
        header_key = request.headers.get("X-Tavily-Key") or request.headers.get("x-tavily-key")
        if header_key and header_key.strip():
            k = header_key.strip()
            if k.upper() != "DEMO":
                return k

    return None
