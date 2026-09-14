"""
Study Room API and WebSocket Routes for StudyRot.
Handles room creation, room state inspection, chat history,
and live bidirectional WebSockets for collaborative learning.
"""

import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, HTTPException
from pydantic import BaseModel, Field

from study_room import room_manager, clean_room_nickname
from db import db
from auth_keys import get_user_groq_key

logger = logging.getLogger("studyrot.room_routes")

router = APIRouter(prefix="/api/room", tags=["study_room"])


class RoomCreateRequest(BaseModel):
    host_nickname: str = Field("Host", description="Nickname of room creator")
    topic: str = Field(..., description="Topic or chapter name")
    subject: str = Field("Science", description="Subject name")
    grade: int = Field(10, description="Grade level")
    max_players: int = Field(8, ge=2, le=8, description="Maximum players")


@router.post("/create")
async def create_study_room(body: RoomCreateRequest):
    """Creates a new study room and returns the 6-character room code."""
    room = room_manager.create_room(
        host_nickname=body.host_nickname,
        topic=body.topic,
        subject=body.subject,
        grade=body.grade,
        max_players=body.max_players,
    )
    return {
        "ok": True,
        "data": room.get_public_state(),
    }


@router.get("/{code}")
async def get_study_room(code: str):
    """Retrieves current public state of a study room."""
    room = room_manager.get_room(code)
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found or expired")
    return {
        "ok": True,
        "data": room.get_public_state(),
    }


@router.get("/{code}/chat")
async def get_study_room_chat(code: str):
    """Retrieves past 24h chat messages for this room."""
    chats = await db.get_room_chats(code.strip().upper(), limit=50)
    return {
        "ok": True,
        "data": chats,
    }


# WebSocket endpoint for real-time room communication
@router.websocket("/ws/{code}")
async def study_room_websocket(websocket: WebSocket, code: str):
    """
    Bidirectional WebSocket connection for study rooms:
    Handles sync scrolling, moderated group chat, @ai tutor triggers,
    and 3-question synchronous Group Quizzes with 20s timers.
    """
    await websocket.accept()
    room = room_manager.get_room(code)
    if not room:
        await websocket.send_text(json.dumps({"type": "error", "message": "Room not found or expired"}))
        await websocket.close()
        return

    player_id = f"p_{id(websocket)}"
    joined = False

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                continue

            msg_type = msg.get("type")

            # 1. Join
            if msg_type == "join":
                nickname = msg.get("nickname") or "Student"
                try:
                    p_info = await room.add_player(player_id, nickname, websocket)
                    joined = True
                    await websocket.send_text(json.dumps({
                        "type": "room_state",
                        "player_id": player_id,
                        **room.get_public_state(),
                    }))
                except ValueError as e:
                    await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
                    await websocket.close()
                    return

            # 2. Scroll (Sync Mode)
            elif msg_type == "scroll":
                if room.mode == "sync" and player_id == room.host_id:
                    post_index = int(msg.get("post_index", 0))
                    room.current_post_index = post_index
                    await room.broadcast({"type": "scroll", "post_index": post_index}, exclude_player=player_id)

            # 3. Mode Change
            elif msg_type == "mode_change":
                if player_id == room.host_id:
                    new_mode = "sync" if msg.get("mode") == "sync" else "free"
                    room.mode = new_mode
                    await room.broadcast({"type": "mode_change", "mode": new_mode})

            # 4. Chat
            elif msg_type == "chat":
                text = msg.get("text", "")
                groq_key = msg.get("groq_key")
                await room.handle_chat(player_id, text, user_groq_key=groq_key)

            # 5. Start Group Quiz
            elif msg_type == "start_group_quiz":
                if player_id == room.host_id:
                    await room.start_group_quiz()

            # 6. Group Quiz Answer
            elif msg_type == "group_quiz_answer":
                q_idx = int(msg.get("q_idx", 0))
                opt_idx = int(msg.get("option_idx", -1))
                room.record_quiz_answer(player_id, q_idx, opt_idx)

            # 7. Kick Player (Host only)
            elif msg_type == "kick_player":
                if player_id == room.host_id:
                    target_id = msg.get("target_id")
                    if target_id and target_id in room.players:
                        target_ws = room.players[target_id].get("ws")
                        if target_ws:
                            try:
                                await target_ws.send_text(json.dumps({
                                    "type": "error",
                                    "message": "You were removed from the study room by the host."
                                }))
                                await target_ws.close()
                            except Exception:
                                pass
                        await room.remove_player(target_id)

            # 8. Leave
            elif msg_type == "leave":
                break

    except WebSocketDisconnect:
        logger.info("WebSocket disconnect for player %s in room %s", player_id, code)
    except Exception as e:
        logger.warning("Error in study room WebSocket: %s", e)
    finally:
        if joined:
            await room.remove_player(player_id)
