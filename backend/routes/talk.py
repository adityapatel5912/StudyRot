"""
Talk Mode WebSocket Router for StudyRot.
Enables full-duplex conversational voice tutoring with live audio chunk streaming,
AssemblyAI Universal-3.5 Pro transcription, Groq LLaMA 3.3 70B reasoning,
and sentence-by-sentence Fish Audio S2.1 Pro TTS audio streaming.
"""

import base64
import json
import logging
import re
from typing import Dict, Any, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from config import GROQ_API_KEY
import stt
import tts
from groq import AsyncGroq

logger = logging.getLogger("studyrot.talk")

router = APIRouter(tags=["talk"])


def _split_into_sentences(text: str) -> List[str]:
    """Splits response text into natural sentence chunks for low-latency streaming TTS."""
    # Split on periods, question marks, or exclamation points followed by whitespace
    chunks = re.split(r"(?<=[.?!])\s+", text.strip())
    # Merge tiny chunks (< 10 chars) with previous
    results: List[str] = []
    for c in chunks:
        c = c.strip()
        if not c:
            continue
        if results and len(c) < 15:
            results[-1] += " " + c
        else:
            results.append(c)
    return results or [text]


@router.websocket("/ws/talk")
async def talk_websocket_endpoint(websocket: WebSocket):
    """
    Real-time bidirectional WebSocket connection for StudyRot Talk Mode.
    Accepts audio chunks or text queries and streams back transcripts,
    concise pedagogical answers, and synthesized TTS audio chunks.
    """
    await websocket.accept()
    logger.info("Talk Mode WebSocket client connected.")

    audio_buffer = bytearray()

    try:
        while True:
            raw_msg = await websocket.receive_text()
            try:
                msg = json.loads(raw_msg)
            except Exception:
                continue

            msg_type = msg.get("type")

            if msg_type == "audio_chunk":
                chunk_b64 = msg.get("data", "")
                if chunk_b64:
                    try:
                        audio_buffer.extend(base64.b64decode(chunk_b64))
                    except Exception as err:
                        logger.warning("Failed to decode audio chunk: %s", err)

            elif msg_type in ("end_utterance", "text_query"):
                user_text = ""
                subject = msg.get("subject", "Science")
                grade = msg.get("grade", 10)
                topic = msg.get("topic", "")
                post_context = msg.get("post_context", "")
                voice = msg.get("voice", "teacher")

                if msg_type == "end_utterance":
                    if not audio_buffer or len(audio_buffer) < 200:
                        await websocket.send_json({
                            "type": "error",
                            "message": "No voice recording detected. Please hold the mic and speak."
                        })
                        audio_buffer.clear()
                        continue

                    # Transcribe with AssemblyAI
                    prompt_ctx = stt.build_stt_prompt(subject, grade, topic)
                    try:
                        user_text = await stt.transcribe_short(bytes(audio_buffer), context_prompt=prompt_ctx)
                    except Exception as e:
                        logger.warning("STT transcription error in Talk Mode: %s", e)
                        await websocket.send_json({
                            "type": "error",
                            "message": "Voice transcription service unavailable. You can type your doubt instead."
                        })
                        audio_buffer.clear()
                        continue
                    finally:
                        audio_buffer.clear()

                else:  # text_query
                    user_text = msg.get("text", "").strip()

                if not user_text:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Empty query received."
                    })
                    continue

                # Echo transcript to client
                await websocket.send_json({
                    "type": "transcript",
                    "text": user_text,
                })

                # Construct StudyRot Tutor system prompt
                sys_prompt = (
                    "You are StudyRot Tutor, a warm, concise, and elite CBSE AI tutor. "
                    f"The student is in Class {grade} studying {subject}. "
                )
                if post_context:
                    sys_prompt += f"They are currently looking at this post:\n{post_context}\n"

                sys_prompt += (
                    "Rules:\n"
                    "1. Always identify as StudyRot Tutor.\n"
                    "2. Keep answers concise (under 60 words).\n"
                    "3. Format all math and formulas with clean LaTeX ($...$).\n"
                    "4. Speak naturally in clear English or conversational Hinglish.\n"
                    "5. Address the student directly and encouragingly."
                )

                # Generate concise conversational response
                ai_answer = ""
                if GROQ_API_KEY:
                    try:
                        groq_client = AsyncGroq(api_key=GROQ_API_KEY)
                        resp = await groq_client.chat.completions.create(
                            model="llama-3.3-70b-versatile",
                            messages=[
                                {"role": "system", "content": sys_prompt},
                                {"role": "user", "content": user_text},
                            ],
                            max_tokens=220,
                            temperature=0.3,
                        )
                        ai_answer = resp.choices[0].message.content or ""
                    except Exception as err:
                        logger.warning("Groq generation error in talk mode: %s", err)

                if not ai_answer:
                    ai_answer = (
                        f"StudyRot Tutor here! For {subject} Class {grade}, remember to apply standard NCERT definitions "
                        "and Cartesian sign conventions. Let me know if you'd like a step-by-step diagram or formula breakdown!"
                    )

                # Send text response
                await websocket.send_json({
                    "type": "response_text",
                    "text": ai_answer,
                })

                # Synthesize and stream sentence audio chunks
                sentences = _split_into_sentences(ai_answer)
                for idx, sent in enumerate(sentences):
                    try:
                        audio_data = await tts.synthesize_speech(sent, voice=voice)
                        if audio_data:
                            await websocket.send_json({
                                "type": "response_audio",
                                "data": base64.b64encode(audio_data).decode("utf-8"),
                                "chunk_idx": idx,
                                "sentence": sent,
                            })
                    except Exception as err:
                        logger.debug("TTS sentence synthesis skipped: %s", err)
                        # Client will use Web Speech API fallback if response_audio is missing

                await websocket.send_json({
                    "type": "done",
                })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info("Talk Mode WebSocket client disconnected.")
    except Exception as e:
        logger.error("Unhandled error in Talk Mode WebSocket: %s", e)
