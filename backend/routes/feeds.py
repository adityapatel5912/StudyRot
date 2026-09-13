"""
Shared feeds route handlers with strict abuse prevention,
content moderation, rate limiting, and deep linking support.
"""

import os
import json
import time
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from db import shared_feed_store
from sanitizer import sanitize_svg

logger = logging.getLogger("studyrot.feeds")
share_audit_logger = logging.getLogger("studyrot.share_audit")

# Setup share audit logger to write to share_audit.log
_audit_file = Path(__file__).resolve().parent.parent / "share_audit.log"
_fh = logging.FileHandler(_audit_file, encoding="utf-8")
_fh.setFormatter(logging.Formatter("%(asctime)s - %(message)s"))
share_audit_logger.addHandler(_fh)
share_audit_logger.setLevel(logging.INFO)

# Load banned words list
_BANNED_WORDS_FILE = Path(__file__).resolve().parent.parent / "data" / "banned_words.txt"
_BANNED_WORDS = set()
if _BANNED_WORDS_FILE.exists():
    with open(_BANNED_WORDS_FILE, "r", encoding="utf-8") as f:
        _BANNED_WORDS = set(line.strip().lower() for line in f if line.strip())

router = APIRouter(prefix="/api/feeds", tags=["feeds"])


def get_client_ip(request: Request) -> str:
    """Extracts client IP safely without trusting spoofed proxy headers blindly."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Take the leftmost untrusted IP
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def contains_banned_words(text: str) -> bool:
    if not text or not _BANNED_WORDS:
        return False
    lower = text.lower()
    for word in _BANNED_WORDS:
        if word in lower:
            return True
    return False


def sanitize_post_payload(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sanitizes SVG diagrams and ensures string fields are clean."""
    cleaned = []
    for p in posts:
        post_copy = dict(p)
        if post_copy.get("diagram"):
            post_copy["diagram"] = sanitize_svg(post_copy["diagram"])
        # Ensure likes start at real count (or 0)
        eng = post_copy.get("engagement") or {}
        post_copy["engagement"] = {
            "likes": int(eng.get("likes") or 0),
            "comments": eng.get("comments") or [],
        }
        cleaned.append(post_copy)
    return cleaned


class ShareFeedPayload(BaseModel):
    subject: str = "Science"
    grade: int = 10
    topic: Optional[str] = "CBSE Chapter"
    vibe: Optional[str] = "Instagram"
    posts: List[Dict[str, Any]] = Field(..., max_length=25)


@router.post("/share")
async def share_feed(request: Request, body: ShareFeedPayload):
    """Creates a permanent shareable deep link for a generated feed."""
    ip = get_client_ip(request)

    # Input validation: check max payload size (< 200KB)
    raw_body = json.dumps(body.model_dump())
    if len(raw_body.encode("utf-8")) > 200 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Payload exceeds maximum limit of 200KB.",
        )

    # Content moderation
    if contains_banned_words(body.topic or "") or any(
        contains_banned_words(p.get("title", "")) or contains_banned_words(p.get("body", ""))
        for p in body.posts
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content violates safety policy: CONTENT_REJECTED",
        )

    sanitized_posts = sanitize_post_payload(body.posts)

    try:
        created = await shared_feed_store.create(
            subject=body.subject,
            grade=body.grade,
            topic=body.topic or "CBSE Chapter",
            vibe=body.vibe or "Instagram",
            posts=sanitized_posts,
            ip=ip,
        )
    except Exception as e:
        logger.error("Failed to create shared feed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate unique share code. Try again.",
        )

    # Audit log
    share_audit_logger.info("ACTION=SHARE_CREATED IP=%s CODE=%s TOPIC=%s POST_COUNT=%d",
                             ip, created["short_code"], body.topic, len(body.posts))

    return {
        "ok": True,
        "data": {
            "short_code": created["short_code"],
            "feed_url": created["feed_url"],
            "expires_at": created["expires_at"],
            "posts": created["posts"],
        },
    }


@router.get("/shared/{short_code}")
async def get_shared_feed(request: Request, short_code: str):
    """Retrieves shared feed by 6-char short code."""
    cleaned_code = short_code.strip().upper()
    feed = await shared_feed_store.get(cleaned_code)
    if not feed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FEED_NOT_FOUND: This feed has expired or doesn't exist.",
        )

    # Sanitize diagrams on read for safety
    posts = feed.get("posts") or []
    for p in posts:
        if p.get("diagram"):
            p["diagram"] = sanitize_svg(p["diagram"])

    return {
        "ok": True,
        "data": {
            "short_code": feed.get("short_code"),
            "subject": feed.get("subject"),
            "grade": feed.get("grade"),
            "topic": feed.get("topic"),
            "vibe": feed.get("vibe"),
            "posts": posts,
            "view_count": feed.get("view_count", 0),
            "created_at": feed.get("created_at"),
            "expires_at": feed.get("expires_at"),
        },
    }
