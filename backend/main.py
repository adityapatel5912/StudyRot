"""
StudyRot Backend API
FastAPI application with SlowAPI rate-limiting, strict schema validation,
AES-256-GCM encrypted API key storage, Supabase auth integration,
and real-time Classroom Battle WebSockets.
"""

import os
import sys
import io
import time
import json
import logging
from pathlib import Path

# Ensure backend directory is in sys.path for direct module imports (Docker / Render / Monorepo)
_backend_dir = str(Path(__file__).resolve().parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from typing import Optional, List, Any, Dict

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException,
    Header,
    Request,
    WebSocket,
    WebSocketDisconnect,
    Depends,
    status
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import asyncio
from config import (
    ENVIRONMENT,
    ALLOWED_ORIGINS,
    GROQ_API_KEY,
    TAVILY_API_KEY,
    get_keys_present,
    log_key_presence,
)
from schemas import (
    GenerateRequest,
    DemoGenerateRequest,
    SaveFeedRequest,
    SaveKeysRequest,
    CreateCommentRequest,
    BattleCreateRequest,
    BattleJoinRequest,
    Post,
    Quiz,
)
from sanitizer import sanitize_svg
from search import search_tavily_cached
from verified_context import get_verified_ncert_context, get_verified_manifest
from llm import generate_hardened_feed, validate_and_sanitize_posts
from battle import battle_manager, clean_nickname
from prompts import STUDYROT_SYSTEM_PROMPT, FEW_SHOT_SVG_EXAMPLES
from crypto import encrypt_api_key, decrypt_api_key
from auth import get_current_user_required, get_current_user_optional
from db import db, shared_feed_store
from routes.feeds import router as feeds_router
from routes.review import router as review_router
from routes.battle import router as battle_router
from routes.stt import router as stt_router
from routes.tts import router as tts_router
from routes.doubt import router as doubt_router
from routes.talk import router as talk_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("studyrot.api")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="StudyRot Hardened API", version="1.0.0")
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feeds_router)
app.include_router(review_router)
app.include_router(battle_router)
app.include_router(stt_router)
app.include_router(tts_router)
app.include_router(doubt_router)
app.include_router(talk_router)


async def periodic_expiry_cleanup():
    """Background task running every 6 hours to clean up expired shared feeds."""
    while True:
        try:
            await asyncio.sleep(6 * 3600)
            await shared_feed_store.cleanup_expired()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning("Periodic cleanup error: %s", e)


@app.on_event("startup")
async def startup_event():
    log_key_presence()
    asyncio.create_task(periodic_expiry_cleanup())


@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "ok": False,
            "error": "Rate limit reached. Please wait before retrying or use your own API key.",
            "code": "RATE_LIMIT_EXCEEDED"
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "ok": False,
            "error": exc.detail,
            "detail": exc.detail,
            "code": "HTTP_ERROR"
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "ok": False,
            "error": "Internal server error occurred. Please try again.",
            "code": "INTERNAL_ERROR"
        }
    )


# ==========================================
# PUBLIC ENDPOINTS
# ==========================================

@app.get("/api/health")
async def health_check():
    """Returns service health status, environment mode, and keys presence booleans (never values)."""
    return {
        "ok": True,
        "data": {
            "status": "healthy",
            "service": "StudyRot",
            "env": ENVIRONMENT,
            "keys_present": get_keys_present()
        }
    }


@app.get("/api/research/topics")
async def list_research_topics():
    """Returns the pre-verified CBSE NCERT research topics manifest."""
    manifest = get_verified_manifest()
    return {"ok": True, "data": manifest}


@app.post("/api/demo-generate")
@limiter.limit("3/hour")
async def demo_generate(request: Request, body: DemoGenerateRequest):
    """
    Guest feed generation with strict 3 req/hour per IP limit.
    Only generates genuine live content using Groq and NCERT context.
    Never falls back to pre-baked demo JSONs.
    """
    topic_query = (body.topic or body.text or "Light — Reflection and Refraction").strip()
    groq_key = GROQ_API_KEY
    tavily_key = TAVILY_API_KEY

    if not groq_key:
        return JSONResponse(
            status_code=500,
            content={
                "ok": False,
                "error": "Generation failed. Try again.",
                "code": "GENERATION_FAILED"
            }
        )

    # Check verified NCERT archive first
    verified_ctx, is_verified = get_verified_ncert_context(body.subject, body.grade, topic_query)

    search_ctx = ""
    grounded = is_verified
    if not is_verified and tavily_key:
        search_ctx, grounded = await search_tavily_cached(tavily_key, body.grade, body.subject, topic_query)

    prompt = (
        f"TASK: Generate 14-18 scrollable StudyRot feed posts for CBSE students.\n"
        f"VIBE: {body.vibe}\nSUBJECT: {body.subject}\nGRADE: Class {body.grade}\n"
        f"SOURCE MATERIAL:\n{topic_query}\n"
    )
    if verified_ctx:
        prompt += f"\n{verified_ctx}\n"
    elif search_ctx:
        prompt += f"\nSEARCH CONTEXT:\n{search_ctx}\n"
    prompt += f"\n{FEW_SHOT_SVG_EXAMPLES}\n"

    try:
        posts = await generate_hardened_feed(
            groq_key=groq_key,
            user_prompt=prompt,
            subject=body.subject,
            grade=body.grade,
            topic_summary=topic_query[:100]
        )
        # Auto-persist generated feed
        client_ip = request.client.host if request.client else "127.0.0.1"
        shared_res = await shared_feed_store.create(
            subject=body.subject,
            grade=body.grade,
            topic=topic_query,
            vibe=body.vibe,
            posts=posts,
            ip=client_ip,
        )
        return {
            "ok": True,
            "data": {
                "posts": shared_res["posts"],
                "feed_code": shared_res["short_code"],
                "feed_url": shared_res["feed_url"],
                "grounded": grounded,
            }
        }
    except Exception as e:
        logger.error("Live generation failed: %s", e)
        return JSONResponse(
            status_code=500,
            content={
                "ok": False,
                "error": "Generation failed. Try again.",
                "code": "GENERATION_FAILED"
            }
        )


@app.post("/api/generate")
@limiter.limit("20/hour")
async def generate_feed(request: Request, body: GenerateRequest):
    """
    Standard generation endpoint requiring BYO Groq Key or fallback to server key.
    Auto-saves feed and returns short code + deep link.
    """
    user_groq = (body.groq_key or "").strip() or GROQ_API_KEY
    if not user_groq or user_groq.upper() == "DEMO":
        return JSONResponse(
            status_code=400,
            content={
                "ok": False,
                "error": "Groq API Key is required for generation. Please provide a key in Settings.",
                "code": "KEY_REQUIRED"
            }
        )

    user_tavily = (body.tavily_key or "").strip() or TAVILY_API_KEY

    verified_ctx, is_verified = get_verified_ncert_context(body.subject, body.grade, body.text[:120])

    search_ctx = ""
    grounded = is_verified
    if not is_verified and user_tavily and (body.is_topic or len(body.text) < 500):
        search_ctx, grounded = await search_tavily_cached(
            user_tavily, body.grade, body.subject, body.text[:120]
        )

    prompt = (
        f"TASK: Generate 14-18 scrollable StudyRot feed posts for CBSE students.\n"
        f"VIBE: {body.vibe}\nSUBJECT: {body.subject}\nGRADE: Class {body.grade}\n"
        f"SOURCE MATERIAL:\n{body.text}\n"
    )
    if verified_ctx:
        prompt += f"\n{verified_ctx}\n"
    elif search_ctx:
        prompt += f"\nSEARCH CONTEXT:\n{search_ctx}\n"
    prompt += f"\n{FEW_SHOT_SVG_EXAMPLES}\n"

    try:
        posts = await generate_hardened_feed(
            groq_key=user_groq,
            user_prompt=prompt,
            subject=body.subject,
            grade=body.grade,
            topic_summary=body.text[:100]
        )
        client_ip = request.client.host if request.client else "127.0.0.1"
        shared_res = await shared_feed_store.create(
            subject=body.subject,
            grade=body.grade,
            topic=body.text[:100],
            vibe=body.vibe,
            posts=posts,
            ip=client_ip,
        )
        return {
            "ok": True,
            "data": {
                "posts": shared_res["posts"],
                "feed_code": shared_res["short_code"],
                "feed_url": shared_res["feed_url"],
                "grounded": grounded,
            }
        }
    except Exception as e:
        logger.error("Failed to generate feed: %s", e)
        return JSONResponse(
            status_code=500,
            content={"ok": False, "error": f"Generation failed: {str(e)}", "code": "GENERATION_ERROR"}
        )


@app.post("/api/upload")
@limiter.limit("20/hour")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    groq_key: str = Form(""),
    tavily_key: Optional[str] = Form(None),
    vibe: str = Form("Instagram"),
    subject: str = Form("Science"),
    grade: int = Form(10),
):
    """Uploads document (txt/pdf/docx), parses it into StudyRot feed, and auto-saves share link."""
    effective_groq = groq_key.strip() or GROQ_API_KEY
    if not effective_groq:
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Groq API Key required for document upload processing.", "code": "KEY_REQUIRED"}
        )

    content_bytes = await file.read()
    if not content_bytes:
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Uploaded file is empty.", "code": "EMPTY_FILE"}
        )

    extracted_text = ""
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            for page in reader.pages[:15]:
                extracted_text += (page.extract_text() or "") + "\n"
        except Exception as e:
            logger.warning("PDF extraction failed: %s", e)
    elif filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content_bytes))
            extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception as e:
            logger.warning("DOCX extraction failed: %s", e)

    if not extracted_text.strip():
        extracted_text = content_bytes.decode("utf-8", errors="ignore")

    clean_text = extracted_text.strip()[:8000]
    if not clean_text:
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Could not extract readable text from document.", "code": "PARSE_ERROR"}
        )

    prompt = (
        f"TASK: Generate 14-18 scrollable StudyRot feed posts for CBSE students.\n"
        f"VIBE: {vibe}\nSUBJECT: {subject}\nGRADE: Class {grade}\n"
        f"DOCUMENT EXTRACT:\n{clean_text}\n\n{FEW_SHOT_SVG_EXAMPLES}\n"
    )

    try:
        posts = await generate_hardened_feed(
            groq_key=effective_groq,
            user_prompt=prompt,
            subject=subject,
            grade=grade,
            topic_summary=clean_text[:100]
        )
        client_ip = request.client.host if request.client else "127.0.0.1"
        shared_res = await shared_feed_store.create(
            subject=subject,
            grade=grade,
            topic=clean_text[:80],
            vibe=vibe,
            posts=posts,
            ip=client_ip,
        )
        return {
            "ok": True,
            "data": {
                "posts": shared_res["posts"],
                "feed_code": shared_res["short_code"],
                "feed_url": shared_res["feed_url"],
                "chars": len(clean_text),
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"ok": False, "error": f"Failed to parse document: {str(e)}", "code": "GENERATION_ERROR"}
        )


# ==========================================
# AUTHENTICATED / USER PERSISTENCE ENDPOINTS
# ==========================================

@app.post("/api/keys")
async def save_user_keys(body: SaveKeysRequest, current_user: Dict[str, Any] = Depends(get_current_user_required)):
    """Saves user's Groq and Tavily keys encrypted at rest using AES-256-GCM."""
    user_id = current_user["id"]
    enc_groq = encrypt_api_key(body.groq_key.strip()) if body.groq_key else ""
    enc_tavily = encrypt_api_key(body.tavily_key.strip()) if body.tavily_key else ""

    await db.save_user_keys(user_id, enc_groq, enc_tavily)
    return {"ok": True, "data": {"status": "keys_saved"}}


@app.get("/api/keys/status")
async def get_keys_status(current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    """Returns boolean flags indicating if the user has stored encrypted API keys."""
    if not current_user:
        return {"ok": True, "data": {"has_groq": False, "has_tavily": False}}

    user_id = current_user["id"]
    record = await db.get_user_keys(user_id)
    return {
        "ok": True,
        "data": {
            "has_groq": bool(record and record.get("encrypted_groq")),
            "has_tavily": bool(record and record.get("encrypted_tavily")),
        }
    }


@app.post("/api/feeds")
@app.post("/api/save-feed")
async def save_feed(body: SaveFeedRequest, current_user: Dict[str, Any] = Depends(get_current_user_required)):
    """Saves a feed under the authenticated user's account."""
    user_id = current_user["id"]
    feed_id = await db.save_feed(
        user_id=user_id,
        feed_data=body.feed,
        title=body.title or "NCERT Study Feed",
        subject=body.subject or "Science",
        grade=body.grade or 10,
        vibe=body.vibe or "Instagram"
    )
    return {"ok": True, "data": {"status": "saved", "feed_id": feed_id}}


@app.get("/api/feeds")
@app.get("/api/my-feeds")
async def get_my_feeds(current_user: Dict[str, Any] = Depends(get_current_user_required)):
    """Lists all feeds saved by the authenticated user."""
    user_id = current_user["id"]
    feeds = await db.get_user_feeds(user_id)
    return {"ok": True, "data": {"feeds": feeds}}


@app.delete("/api/feeds/{feed_id}")
@app.delete("/api/feed/{feed_id}")
async def delete_feed(feed_id: str, current_user: Dict[str, Any] = Depends(get_current_user_required)):
    """Deletes a saved feed owned by the user."""
    user_id = current_user["id"]
    await db.delete_feed(user_id, feed_id)
    return {"ok": True, "data": {"status": "deleted", "feed_id": feed_id}}


@app.post("/api/likes/{post_id}")
async def toggle_like(post_id: str, current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    """Likes or unlikes a post. Persists to database for signed-in users."""
    user_id = current_user["id"] if current_user else "guest_user"
    res = await db.toggle_like(user_id, post_id)
    return {"ok": True, "data": res}


@app.post("/api/comments")
async def create_comment(body: CreateCommentRequest, current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)):
    """Creates a new comment on a post."""
    user_id = current_user["id"] if current_user else "guest_user"
    comment = await db.add_comment(user_id, body.post_id, body.body)
    return {"ok": True, "data": comment}


@app.get("/api/comments/{post_id}")
async def list_comments(post_id: str):
    """Lists comments for a given post."""
    comments = await db.get_comments(post_id)
    return {"ok": True, "data": {"comments": comments}}


# ==========================================
# CLASSROOM BATTLE MODE (REST & WEBSOCKETS)
# ==========================================

@app.post("/api/battle/create")
@limiter.limit("5/hour")
async def create_battle_room(
    request: Request,
    body: BattleCreateRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """Creates a real-time Classroom Battle room from any feed or topic."""
    host_id = current_user["id"] if current_user else f"host_{int(time.time() * 1000)}"

    questions: List[Dict[str, Any]] = []
    if body.feed and isinstance(body.feed, dict):
        posts = body.feed.get("posts", [])
        for p in posts:
            if p.get("quiz") and isinstance(p["quiz"], dict):
                questions.append(p["quiz"])

    room = battle_manager.create_room(
        host_id=host_id,
        topic=body.topic or "CBSE Chapter Quiz",
        subject=body.subject or "Science",
        grade=body.grade or 10,
        questions=questions
    )

    return {
        "ok": True,
        "data": {
            "room_code": room.code,
            "host_token": host_id,
            "room": room.get_public_state()
        }
    }


@app.post("/api/battle/join")
@limiter.limit("20/hour")
async def join_battle(request: Request, body: BattleJoinRequest):
    """Joins an active battle lobby using a 6-character room code."""
    room = battle_manager.get_room(body.room_code)
    if not room:
        return JSONResponse(
            status_code=404,
            content={"ok": False, "error": f"Room '{body.room_code}' not found.", "code": "ROOM_NOT_FOUND"}
        )

    if len(room.players) >= 30:
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Room is at maximum capacity (30 players).", "code": "ROOM_FULL"}
        )

    if room.state != "lobby":
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Battle already in progress.", "code": "BATTLE_IN_PROGRESS"}
        )

    clean_name = clean_nickname(body.nickname)
    player_id = f"p_{int(time.time() * 1000)}_{clean_name.lower()[:6]}"

    room.players[player_id] = {
        "id": player_id,
        "nickname": clean_name,
        "score": 0,
        "streak": 0,
        "connected": True,
        "answers": {},
    }

    return {"ok": True, "data": {"player_id": player_id, "room": room.get_public_state()}}


@app.get("/api/battle/{code}")
@app.get("/api/battle/{code}/status")
async def get_battle_status(code: str):
    """Retrieves current public state of a battle room."""
    room = battle_manager.get_room(code)
    if not room:
        return JSONResponse(
            status_code=404,
            content={"ok": False, "error": f"Battle room '{code}' not found.", "code": "ROOM_NOT_FOUND"}
        )
    return {"ok": True, "data": {"room": room.get_public_state()}}


@app.websocket("/ws/battle/{code}")
async def battle_websocket_endpoint(websocket: WebSocket, code: str):
    """Real-time bidirectional WebSocket connection for battle players and host."""
    await websocket.accept()
    room = battle_manager.get_room(code)
    if not room:
        await websocket.send_json({"type": "error", "error": "Room not found."})
        await websocket.close(code=1008)
        return

    player_id = None
    try:
        # Handshake
        init_data = await websocket.receive_json()
        player_id = init_data.get("player_id")
        nickname = clean_nickname(init_data.get("nickname", "Student"))

        if not player_id or player_id not in room.players:
            player_id = player_id or f"p_{int(time.time() * 1000)}"
            is_host = (len(room.players) == 0) or (init_data.get("is_host", False))
            if is_host and not room.host_id:
                room.host_id = player_id
            room.players[player_id] = {
                "id": player_id,
                "nickname": nickname,
                "score": 0,
                "streak": 0,
                "connected": True,
                "answers": {},
            }

        room.players[player_id]["connected"] = True
        room.connections[player_id] = websocket

        # Welcome message with initial room state and replay buffer
        await websocket.send_json({
            "type": "lobby",
            "player_id": player_id,
            "room": room.get_public_state()
        })

        await battle_manager.broadcast(room, "lobby", {"event": "player_joined", "player_id": player_id})

        # Main message loop
        while True:
            msg = await websocket.receive_json()
            msg_type = msg.get("type") or msg.get("action")

            if msg_type in ["start", "START_GAME"]:
                if player_id == room.host_id and room.state == "lobby":
                    await battle_manager.start_question(room, 0)

            elif msg_type in ["answer", "SUBMIT_ANSWER"]:
                option = msg.get("option", "")
                if not option and "option_idx" in msg and room.current_q_idx < len(room.questions):
                    idx = int(msg["option_idx"])
                    opts = room.questions[room.current_q_idx].get("options", [])
                    if 0 <= idx < len(opts):
                        option = opts[idx]
                await battle_manager.submit_answer(room, player_id, option)

            elif msg_type in ["next", "NEXT_QUESTION"]:
                if player_id == room.host_id and room.state == "reveal":
                    await battle_manager.advance_or_finish(room)

            elif msg_type in ["ready", "PING"]:
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("Player %s disconnected from battle %s", player_id, code)
        if player_id and player_id in room.players:
            room.players[player_id]["connected"] = False
            room.connections.pop(player_id, None)

            # Host promotion if host disconnects
            if player_id == room.host_id:
                active_players = [p for p in room.players.values() if p.get("connected")]
                if active_players:
                    room.host_id = active_players[0]["id"]
                    logger.info("Host promoted to %s in room %s", room.host_id, code)

            await battle_manager.broadcast(room, "lobby", {"event": "player_left", "player_id": player_id})
    except Exception as e:
        logger.error("WebSocket error in room %s: %s", code, e)
        if player_id and player_id in room.connections:
            room.connections.pop(player_id, None)


# ==========================================
# STATIC ASSETS / SPA SERVING (PRODUCTION)
# ==========================================
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

_frontend_candidates = [
    Path(__file__).resolve().parent.parent / "frontend" / "dist",
    Path(__file__).resolve().parent / "dist",
    Path(__file__).resolve().parent / "frontend" / "dist",
]

_frontend_dist = next((p for p in _frontend_candidates if p.exists() and (p / "index.html").exists()), None)

if _frontend_dist:
    logger.info("Serving frontend SPA from %s", _frontend_dist)
    if (_frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(_frontend_dist / "assets")), name="spa_assets")
    if (_frontend_dist / "sounds").exists():
        app.mount("/sounds", StaticFiles(directory=str(_frontend_dist / "sounds")), name="spa_sounds")

    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        # Don't intercept API or WebSocket paths
        if full_path.startswith("api") or full_path.startswith("ws"):
            return JSONResponse(status_code=404, content={"ok": False, "error": "Not Found", "code": "NOT_FOUND"})
        file_path = _frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(_frontend_dist / "index.html")
