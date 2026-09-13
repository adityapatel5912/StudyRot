"""
Configuration module for StudyRot backend.
Loads environment variables safely, detects keys presence without leaking secrets,
and configures CORS, rate limits, and service settings.
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, List
from dotenv import load_dotenv

# Search for .env in current dir or parent dir
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent

if (backend_dir / ".env").exists():
    load_dotenv(backend_dir / ".env")
elif (root_dir / ".env").exists():
    load_dotenv(root_dir / ".env")
else:
    load_dotenv()

logger = logging.getLogger("studyrot.config")

ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS_RAW: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",") if origin.strip()]
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Primary LLM & Grounding Keys
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "").strip()

# Supabase Keys
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or os.getenv("SUPABASE_SERVICE_KEY", "").strip()

# Google OAuth Credentials
GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()

# Voice — Speech-to-Text (AssemblyAI Universal-3.5 Pro)
ASSEMBLYAI_API_KEY: str = os.getenv("ASSEMBLYAI_API_KEY", "").strip()

# Voice — Text-to-Speech (Fish Audio S2.1 Pro Free / OpenRouter)
OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "").strip()
FISH_AUDIO_API_KEY: str = os.getenv("FISH_AUDIO_API_KEY", "").strip()
FISH_VOICE_TEACHER: str = os.getenv("FISH_VOICE_TEACHER", "").strip()
FISH_VOICE_BUDDY: str = os.getenv("FISH_VOICE_BUDDY", "").strip()
FISH_VOICE_NARRATOR: str = os.getenv("FISH_VOICE_NARRATOR", "").strip()

# NVIDIA NIM (Vision, OCR, Document Parsing, Deep Reasoning, 3D Assets)
NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "").strip()
NVIDIA_VLM_MODEL: str = os.getenv("NVIDIA_VLM_MODEL", "meta/llama-3.2-11b-vision-instruct").strip()
NVIDIA_REASONING_MODEL: str = os.getenv("NVIDIA_REASONING_MODEL", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning").strip()
NVIDIA_OCR_MODEL: str = os.getenv("NVIDIA_OCR_MODEL", "nvidia/nemotron-ocr-v2").strip()
NVIDIA_PARSE_MODEL: str = os.getenv("NVIDIA_PARSE_MODEL", "nvidia/nemotron-parse-v1.2").strip()
NVIDIA_3D_MODEL: str = os.getenv("NVIDIA_3D_MODEL", "microsoft/trellis").strip()


def get_keys_present() -> Dict[str, bool]:
    """Returns boolean flags indicating which third-party integration keys are present."""
    return {
        "groq": bool(GROQ_API_KEY),
        "tavily": bool(TAVILY_API_KEY),
        "supabase": bool(SUPABASE_URL and (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY)),
        "google": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET),
        "assemblyai": bool(ASSEMBLYAI_API_KEY),
        "fish": bool(FISH_AUDIO_API_KEY or OPENROUTER_API_KEY),
        "nvidia": bool(NVIDIA_API_KEY),
        "openrouter": bool(OPENROUTER_API_KEY),
    }


def log_key_presence():
    """Logs the presence of configured integrations without ever leaking secrets."""
    presence = get_keys_present()
    logger.info(
        "StudyRot startup environment [%s] — Keys configured: Groq=%s, Tavily=%s, Supabase=%s, GoogleOAuth=%s, AssemblyAI=%s, FishAudio=%s, NvidiaNIM=%s, OpenRouter=%s",
        ENVIRONMENT,
        presence["groq"],
        presence["tavily"],
        presence["supabase"],
        presence["google"],
        presence["assemblyai"],
        presence["fish"],
        presence["nvidia"],
        presence["openrouter"],
    )
