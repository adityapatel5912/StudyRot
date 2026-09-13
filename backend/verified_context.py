"""
Helper to load pre-verified NCERT research context into runtime generation prompts.
Grounds prompts in official CBSE/NCERT facts, formulas, definitions, and misconceptions.
"""

import os
import json
import logging
from pathlib import Path
from typing import Optional, Tuple, Dict, Any

logger = logging.getLogger("studyrot.verified_context")

BACKEND_DIR = Path(__file__).resolve().parent
RESEARCH_DIR = BACKEND_DIR / "data" / "research"
INDEX_FILE = RESEARCH_DIR / "index.json"
MANIFEST_FILE = RESEARCH_DIR / "manifest.json"


def get_verified_manifest() -> Dict[str, Any]:
    """Returns the verified topics manifest."""
    if MANIFEST_FILE.exists():
        try:
            with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning("Failed to read manifest.json: %s", e)
    return {"version": "2025-26", "topics": []}


def get_verified_ncert_context(subject: str, grade: int, topic: str) -> Tuple[str, bool]:
    """
    Looks up pre-verified NCERT research output for a topic.
    Returns (formatted_context_block, is_verified).
    """
    if not INDEX_FILE.exists():
        return "", False

    try:
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            index_data = json.load(f)
    except Exception as e:
        logger.warning("Failed to read research index.json: %s", e)
        return "", False

    normalized_subject = subject.strip().lower()
    normalized_topic = topic.strip().lower()

    target_file = None

    # Pass 1: exact key match
    for key, rel_path in index_data.items():
        parts = key.split(":")
        if len(parts) >= 3:
            k_subj, k_grade, k_topic = parts[0].strip().lower(), int(parts[1]), parts[2].strip().lower()
            if k_subj == normalized_subject and k_grade == grade and k_topic == normalized_topic:
                target_file = RESEARCH_DIR / rel_path
                break

    # Pass 2: fuzzy substring match
    if not target_file:
        for key, rel_path in index_data.items():
            parts = key.split(":")
            if len(parts) >= 3:
                k_subj, k_grade, k_topic = parts[0].strip().lower(), int(parts[1]), parts[2].strip().lower()
                if k_subj == normalized_subject and (k_grade == grade or abs(k_grade - grade) <= 2):
                    if (
                        normalized_topic in k_topic
                        or k_topic in normalized_topic
                        or any(w in k_topic for w in normalized_topic.split() if len(w) > 3)
                    ):
                        target_file = RESEARCH_DIR / rel_path
                        break

    if not target_file or not target_file.exists():
        return "", False

    try:
        with open(target_file, "r", encoding="utf-8") as f:
            doc = json.load(f)

        facts = doc.get("facts", [])[:12]
        formulas = doc.get("formulas", [])[:6]
        misconceptions = doc.get("common_misconceptions", [])[:4]
        definitions = doc.get("definitions", [])[:4]
        board_questions = doc.get("board_questions", [])[:3]

        lines = [
            "## VERIFIED NCERT CONTEXT (OFFICIAL CBSE ARCHIVE)",
            "FACT ACCURACY RULE: You must anchor concepts and questions to the verified facts below."
        ]

        if facts:
            lines.append("\nVerified Principles & Statements:")
            for fact in facts:
                statement = fact.get("statement", "")
                src = fact.get("source", "NCERT Syllabus")
                lines.append(f"- {statement} [Source: {src}]")

        if formulas:
            lines.append("\nVerified Formulas & LaTeX:")
            for form in formulas:
                name = form.get("name", "")
                latex = form.get("latex", "")
                lines.append(f"- {name}: ${latex}$")

        if definitions:
            lines.append("\nTextbook Accurate Definitions:")
            for d in definitions:
                lines.append(f"- {d.get('term')}: {d.get('definition')}")

        if misconceptions:
            lines.append("\nCommon Board Exam Traps & Misconceptions:")
            for m in misconceptions:
                trap = m.get("misconception", "")
                truth = m.get("truth", "")
                lines.append(f"- Mistake: {trap} -> Truth: {truth}")

        if board_questions:
            lines.append("\nOfficial CBSE Sample Questions:")
            for bq in board_questions:
                lines.append(f"- Q: {bq.get('question')} -> A: {bq.get('answer')}")

        return "\n".join(lines), True
    except Exception as e:
        logger.warning("Failed to load verified topic file %s: %s", target_file, e)
        return "", False
