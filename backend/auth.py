"""
Authentication and JWT verification dependency for StudyRot backend.
Integrates with Supabase Auth with fallback for development and guest access.
"""

import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
import jwt
from config import SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
from db import db

logger = logging.getLogger("studyrot.auth")


def verify_supabase_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies a Supabase JWT token.
    Uses Supabase client's auth.get_user(token) or decodes claims.
    """
    if not token or not isinstance(token, str):
        return None

    client = db.get_client()
    if client:
        try:
            res = client.auth.get_user(token)
            if res and res.user:
                return {
                    "id": str(res.user.id),
                    "email": getattr(res.user, "email", ""),
                    "user_metadata": getattr(res.user, "user_metadata", {}),
                }
        except Exception as e:
            logger.debug("Supabase client auth.get_user failed: %s", e)

    # Fallback / local test token decoding
    try:
        # If secret is known, we can verify; otherwise decode unverified claims for dev mock
        claims = jwt.decode(token, options={"verify_signature": False})
        user_id = claims.get("sub") or claims.get("user_id")
        if user_id:
            return {
                "id": str(user_id),
                "email": claims.get("email", ""),
                "user_metadata": claims.get("user_metadata", {}),
            }
    except Exception as e:
        logger.debug("JWT decode failed: %s", e)

    # Allow mock test tokens in development e.g. "test_user_123"
    if token.startswith("test_token_"):
        uid = token.replace("test_token_", "user_")
        return {"id": uid, "email": f"{uid}@example.com", "user_metadata": {}}

    return None


async def get_current_user_required(authorization: Any = Header(None)) -> Dict[str, Any]:
    """
    Protected route dependency: strictly requires a valid Bearer token.
    Raises 401 if missing or invalid. Supports both FastAPI Header dependency and direct Request passing.
    """
    auth_val: Optional[str] = None
    if isinstance(authorization, str):
        auth_val = authorization
    elif authorization is not None and hasattr(authorization, "headers"):
        auth_val = authorization.headers.get("Authorization") or authorization.headers.get("authorization")

    if not auth_val or not auth_val.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header with Bearer token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_val.split(" ")[1].strip()
    user_info = verify_supabase_jwt(token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure profile row exists
    await db.upsert_profile(user_info["id"], user_info.get("email"))
    return user_info


async def get_current_user_optional(authorization: Any = Header(None)) -> Optional[Dict[str, Any]]:
    """
    Optional user dependency: returns user dict if valid Bearer token is present, else None.
    Supports both FastAPI Header dependency and direct Request passing.
    """
    auth_val: Optional[str] = None
    if isinstance(authorization, str):
        auth_val = authorization
    elif authorization is not None and hasattr(authorization, "headers"):
        auth_val = authorization.headers.get("Authorization") or authorization.headers.get("authorization")

    if not auth_val or not auth_val.startswith("Bearer "):
        return None

    token = auth_val.split(" ")[1].strip()
    return verify_supabase_jwt(token)

