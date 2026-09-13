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

# Primary Keys
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "").strip()
DEMO_GROQ_KEY: str = os.getenv("DEMO_GROQ_KEY", "").strip() or GROQ_API_KEY
DEMO_TAVILY_KEY: str = os.getenv("DEMO_TAVILY_KEY", "").strip() or TAVILY_API_KEY

# Supabase Keys
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or os.getenv("SUPABASE_SERVICE_KEY", "").strip()

# Google OAuth Credentials
GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()


def get_keys_present() -> Dict[str, bool]:
    """Returns boolean flags indicating which third-party integration keys are present."""
    return {
        "groq": bool(GROQ_API_KEY or DEMO_GROQ_KEY),
        "tavily": bool(TAVILY_API_KEY or DEMO_TAVILY_KEY),
        "supabase": bool(SUPABASE_URL and (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY)),
        "google": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET),
    }


def log_key_presence():
    """Logs the presence of configured integrations without ever leaking secrets."""
    presence = get_keys_present()
    logger.info(
        "StudyRot startup environment [%s] — Keys configured: Groq=%s, Tavily=%s, Supabase=%s, GoogleOAuth=%s",
        ENVIRONMENT,
        presence["groq"],
        presence["tavily"],
        presence["supabase"],
        presence["google"],
    )
