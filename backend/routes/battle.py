"""
Solo Battle vs AI Bots route handlers.
Provides deterministic, seeded bot battles with speed-based scoring,
staggered bot reveal timing, commentary, and final podium generation.
"""

import time
import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status

from utils.codes import generate_short_code
from solo_battle import create_solo_battle, get_or_clean_battle
from verified_context import get_verified_ncert_context

logger = logging.getLogger("studyrot.routes.battle")
router = APIRouter(prefix="/api/battle/solo", tags=["solo-battle"])


class SoloBattleCreatePayload(BaseModel):
    feed_id: Optional[str] = None
    difficulty: str = "medium"  # easy | medium | hard
    questions: Optional[List[Dict[str, Any]]] = None
    topic: Optional[str] = "Light — Reflection and Refraction"
    subject: Optional[str] = "Science"
    grade: Optional[int] = 10


class SoloBattleSubmitPayload(BaseModel):
    battle_id: str
    question_idx: int
    option_idx: Optional[int] = None
    time_ms: int = 5000


@router.post("/create")
async def create_battle(body: SoloBattleCreatePayload):
    """Initializes a 1-player battle against 3 bots."""
    battle_id = f"sb_{generate_short_code()}"

    questions = body.questions or []
    # If questions not supplied, extract from verified context
    if not questions:
        v_ctx, _ = get_verified_ncert_context(body.subject or "Science", body.grade or 10, body.topic or "")
        # Standard curated fallback questions for solo battle demo
        questions = [
            {
                "question": "Which mirror is preferred as a rear-view mirror in vehicles?",
                "options": ["Convex mirror", "Concave mirror", "Plane mirror", "Cylindrical mirror"],
                "answer": "Convex mirror",
                "explanation": "Convex mirrors always give an erect, diminished image and have a wider field of view.",
            },
            {
                "question": "What is the SI unit of power of a lens?",
                "options": ["Dioptre", "Watt", "Metre", "Candela"],
                "answer": "Dioptre",
                "explanation": "The SI unit of lens power is dioptre (D), defined as P = 1 / f (in metres).",
            },
            {
                "question": "Light travels fastest through which of the following media?",
                "options": ["Vacuum", "Water", "Glass", "Diamond"],
                "answer": "Vacuum",
                "explanation": "Light has its maximum speed c = 3 x 10^8 m/s in vacuum.",
            },
            {
                "question": "Where should an object be placed in front of a convex lens to get a real image of the same size?",
                "options": ["At twice the focal length (2F1)", "At principal focus (F1)", "At infinity", "Between optical centre and focus"],
                "answer": "At twice the focal length (2F1)",
                "explanation": "An object at 2F1 produces an inverted, real image of the same size at 2F2.",
            },
            {
                "question": "What is the sign of focal length for a concave lens according to Cartesian sign convention?",
                "options": ["Negative", "Positive", "Zero", "Variable"],
                "answer": "Negative",
                "explanation": "By convention, focal length of concave lens is always taken as negative.",
            },
            {
                "question": "What phenomenon causes the twinkling of stars in the night sky?",
                "options": ["Atmospheric refraction", "Total internal reflection", "Dispersion of light", "Scattering by dust"],
                "answer": "Atmospheric refraction",
                "explanation": "Continuous variations in atmospheric optical density cause starlight to refract continuously.",
            },
            {
                "question": "What is the relation between radius of curvature (R) and focal length (f) for spherical mirrors?",
                "options": ["R = 2f", "f = 2R", "R = f / 2", "R = f^2"],
                "answer": "R = 2f",
                "explanation": "For small apertures, radius of curvature is twice the focal length (R = 2f).",
            },
            {
                "question": "A ray of light passing through the optical centre of a lens emerges:",
                "options": ["Without any deviation", "Parallel to principal axis", "Through the focus", "Reflected back"],
                "answer": "Without any deviation",
                "explanation": "Rays passing through optical centre O suffer negligible deviation.",
            },
        ]

    session = create_solo_battle(battle_id, body.difficulty, questions)
    return {
        "ok": True,
        "data": session.get_public_lobby(),
    }


@router.post("/submit")
async def submit_round(body: SoloBattleSubmitPayload):
    """Submits round answer and simulates bot answers."""
    session = get_or_clean_battle(body.battle_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BATTLE_NOT_FOUND: Battle has expired or is invalid.",
        )

    try:
        result = session.submit_user_answer(
            question_idx=body.question_idx,
            option_idx=body.option_idx,
            time_ms=body.time_ms,
        )
        return {"ok": True, "data": result}
    except Exception as e:
        logger.error("Failed to submit round: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{battle_id}")
async def get_battle_summary(battle_id: str):
    """Retrieves final summary and podium for solo battle."""
    session = get_or_clean_battle(battle_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BATTLE_NOT_FOUND: Battle has expired.",
        )

    summary = session.get_final_summary()
    return {"ok": True, "data": summary}
