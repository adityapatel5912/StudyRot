"""
Exam-Date-Aware Spaced Repetition (FSRS-6 Engine) & Error Pattern Detection for StudyRot.
Computes exam-day retrievability, prioritizes daily review by marginal gain,
calculates subject cutoff dates, and classifies quiz/battle errors.
"""

import math
import time
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from config import GROQ_API_KEY

logger = logging.getLogger("studyrot.review")

# Standard FSRS-6 scaling parameters
FACTOR = 1.0 / 9.0  # R(S, S) = 1 / (1 + 1/9 * 1) = 0.90 (90% target retention at interval)


def calculate_retrievability(days_elapsed: float, stability: float) -> float:
    """
    Computes retrievability probability (0.0 to 1.0) using FSRS power decay law.
    R(t, S) = (1 + FACTOR * (t / S))^(-1)
    """
    if stability <= 0:
        return 0.0
    if days_elapsed <= 0:
        return 1.0
    return 1.0 / (1.0 + FACTOR * (days_elapsed / stability))


def calculate_exam_retrievability(stability: float, last_reviewed_dt: datetime, exam_dt: datetime) -> float:
    """Calculates projected retrievability on exam day."""
    if stability <= 0:
        return 0.0
    days_to_exam = (exam_dt - last_reviewed_dt).total_seconds() / 86400.0
    if days_to_exam <= 0:
        return 1.0
    return calculate_retrievability(days_to_exam, stability)


def update_fsrs_state(
    current_stability: float,
    current_difficulty: float,
    rating: int,  # 1: Forgot, 2: Hard, 3: Good, 4: Easy
    last_reviewed_iso: Optional[str] = None,
) -> Tuple[float, float, str, str]:
    """
    Applies FSRS-6 update rule to stability and difficulty.
    Returns (new_stability, new_difficulty, last_reviewed_iso, next_review_iso).
    """
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    # Initial cards
    if current_stability <= 0:
        initial_stabilities = {1: 0.4, 2: 1.2, 3: 3.2, 4: 8.0}
        new_s = initial_stabilities.get(rating, 3.2)
        new_d = max(1.0, min(10.0, 5.0 - 0.5 * (rating - 3)))
        interval_days = new_s if rating > 1 else 0.01  # 15 minutes for forgot
        next_dt = now + timedelta(days=interval_days)
        return new_s, new_d, now_iso, next_dt.isoformat()

    # Existing cards: compute days elapsed since last review
    days_elapsed = 1.0
    if last_reviewed_iso:
        try:
            prev_dt = datetime.fromisoformat(last_reviewed_iso.replace("Z", "+00:00"))
            days_elapsed = max(0.01, (now - prev_dt).total_seconds() / 86400.0)
        except Exception:
            days_elapsed = 1.0

    retrievability = calculate_retrievability(days_elapsed, current_stability)

    # Difficulty update
    new_d = max(1.0, min(10.0, current_difficulty - 0.6 * (rating - 3)))

    if rating == 1:
        # Forgot / Lapse
        new_s = max(0.25, current_stability * 0.2)
        interval_days = 0.01  # review again shortly
    elif rating == 2:
        # Hard
        new_s = current_stability * (1.15 + (10.0 - new_d) * 0.05)
        interval_days = max(1.0, new_s)
    elif rating == 3:
        # Good
        multiplier = 1.6 + (10.0 - new_d) * 0.12 * math.exp(1.0 - retrievability)
        new_s = current_stability * multiplier
        interval_days = max(1.0, new_s)
    else:
        # Easy
        multiplier = 2.4 + (10.0 - new_d) * 0.20 * math.exp(1.0 - retrievability)
        new_s = current_stability * multiplier
        interval_days = max(2.0, new_s)

    next_dt = now + timedelta(days=interval_days)
    return round(new_s, 2), round(new_d, 2), now_iso, next_dt.isoformat()


def compute_marginal_gain(
    current_stability: float,
    current_difficulty: float,
    last_reviewed_iso: Optional[str],
    exam_dt: datetime,
) -> float:
    """
    Computes marginal gain in exam-day recall if reviewed today with rating 'Good' (3)
    vs not reviewing today. Used to rank the daily queue.
    """
    now = datetime.now(timezone.utc)
    if current_stability <= 0:
        # New cards have high initial gain
        sim_s, _, _, _ = update_fsrs_state(0, 5.0, 3)
        return calculate_exam_retrievability(sim_s, now, exam_dt)

    prev_dt = now
    if last_reviewed_iso:
        try:
            prev_dt = datetime.fromisoformat(last_reviewed_iso.replace("Z", "+00:00"))
        except Exception:
            prev_dt = now

    r_current = calculate_exam_retrievability(current_stability, prev_dt, exam_dt)
    sim_s, sim_d, _, _ = update_fsrs_state(current_stability, current_difficulty, 3, last_reviewed_iso)
    r_after = calculate_exam_retrievability(sim_s, now, exam_dt)

    return max(0.0, r_after - r_current)


def compute_subject_cutoffs(exam_date_str: str) -> Dict[str, Any]:
    """
    Calculates per-subject cutoff dates (the latest start date to achieve 85% recall on exam day).
    CBSE syllabus typical review ramp requires ~25 days.
    """
    now = datetime.now(timezone.utc)
    try:
        exam_dt = datetime.fromisoformat(exam_date_str.replace("Z", "+00:00"))
        if exam_dt.tzinfo is None:
            exam_dt = exam_dt.replace(tzinfo=timezone.utc)
    except Exception:
        # Default CBSE 2027 board exam date
        exam_dt = datetime(2027, 2, 20, 0, 0, 0, tzinfo=timezone.utc)

    days_until_exam = max(0, int((exam_dt - now).total_seconds() / 86400))
    is_exam_mode = days_until_exam <= 7

    # Science needs ~28 days, Maths ~25 days, SST ~22 days
    subject_lead_days = {
        "Science": 28,
        "Maths": 25,
        "SST": 22,
    }

    subjects = {}
    for subj, lead in subject_lead_days.items():
        cutoff_dt = exam_dt - timedelta(days=lead)
        is_behind = now > cutoff_dt
        subjects[subj] = {
            "subject": subj,
            "cutoff_date": cutoff_dt.strftime("%Y-%m-%d"),
            "lead_days_required": lead,
            "is_behind": is_behind,
            "urgent": is_behind and not is_exam_mode,
            "status_text": "Start this now" if is_behind else f"Safe until {cutoff_dt.strftime('%b %d')}",
        }

    return {
        "exam_date": exam_dt.strftime("%Y-%m-%d"),
        "days_until_exam": days_until_exam,
        "is_exam_mode": is_exam_mode,
        "subjects": subjects,
    }


# Error classification prompt and heuristic classifier
VALID_ERROR_TYPES = {
    "concept_gap",
    "sign_error",
    "formula_confusion",
    "misread",
    "distractor_trap",
}


async def classify_error(
    question: str,
    chosen_option: str,
    correct_answer: str,
    explanation: str,
    groq_key: Optional[str] = None,
) -> str:
    """
    Classifies a student's wrong answer into one of 5 cognitive categories.
    Calls Groq if key is available; otherwise falls back to intelligent heuristics.
    """
    effective_key = groq_key or GROQ_API_KEY
    if effective_key:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=effective_key)
            prompt = (
                "You are an expert CBSE error-pattern diagnostic engine. "
                "Classify the student's error into EXACTLY ONE of these categories:\n"
                "- concept_gap (student never understood the fundamental concept)\n"
                "- sign_error (student understood the concept but missed positive/negative signs or directions)\n"
                "- formula_confusion (student mixed up two similar equations or ratios)\n"
                "- misread (student misread 'not', 'except', units, or the core prompt)\n"
                "- distractor_trap (student fell for an attractive misconception distractor)\n\n"
                f"Question: {question}\n"
                f"Student Pick: {chosen_option}\n"
                f"Correct Answer: {correct_answer}\n"
                f"Explanation: {explanation}\n\n"
                "Return ONLY the category name. No markdown, no punctuation."
            )
            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=20,
                temperature=0.1,
            )
            raw = (response.choices[0].message.content or "").strip().lower()
            for et in VALID_ERROR_TYPES:
                if et in raw:
                    return et
        except Exception as e:
            logger.warning("Groq error classification failed: %s; falling back to heuristic", e)

    # Heuristic fallback based on question and options
    q_lower = question.lower()
    ch_lower = chosen_option.lower()
    ans_lower = correct_answer.lower()

    if any(term in q_lower for term in ["sign", "direction", "convex", "concave", "+", "-", "focal length", "magnification"]):
        if ("+" in ch_lower and "-" in ans_lower) or ("-" in ch_lower and "+" in ans_lower):
            return "sign_error"
        if any(term in q_lower for term in ["mirror", "lens", "focal"]):
            return "sign_error"

    if any(term in q_lower for term in ["formula", "ratio", "proportional", "law", "equation", "unit", "si unit"]):
        return "formula_confusion"

    if any(term in q_lower for term in ["not", "incorrect", "except", "false", "least"]):
        return "misread"

    if len(ch_lower) > 0 and (ch_lower in q_lower or "all of the above" in ch_lower):
        return "distractor_trap"

    return "concept_gap"


def generate_weakness_report(error_records: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Generates a Weakness Report after 10+ wrong answers.
    Returns None if fewer than 10 wrong answers recorded.
    """
    if len(error_records) < 10:
        return None

    counts: Dict[str, int] = {}
    for r in error_records:
        etype = r.get("error_type", "concept_gap")
        counts[etype] = counts.get(etype, 0) + 1

    top_error, top_count = max(counts.items(), key=lambda x: x[1])
    total = len(error_records)
    pct = int(round((top_count / total) * 100))

    recommendations = {
        "sign_error": {
            "title": "Cartesian Sign Convention Drill",
            "description": f"You've lost marks in {top_count} of your last {total} quiz mistakes to sign errors in numericals.",
            "fix": "Recommended fix: 5-minute sign convention drill for mirrors and lenses.",
            "drill_topic": "Cartesian Sign Convention & Magnification",
            "subject": "Science",
        },
        "formula_confusion": {
            "title": "Formula Distinction Drill",
            "description": f"{pct}% of your errors stem from mixing up sibling formulas or ratios.",
            "fix": "Recommended fix: 5-minute side-by-side formula sheet comparison.",
            "drill_topic": "Formula Comparison & Units Drill",
            "subject": "Maths",
        },
        "misread": {
            "title": "Question Reading Precision Drill",
            "description": f"You tripped on 'NOT / EXCEPT / INCORRECT' prompts {top_count} times.",
            "fix": "Recommended fix: 5-minute prompt negation drill.",
            "drill_topic": "Assertion-Reason & Negative Prompting",
            "subject": "Science",
        },
        "distractor_trap": {
            "title": "Common Misconception Busters",
            "description": f"You fell for classic CBSE distractor traps in {top_count} questions.",
            "fix": "Recommended fix: Review myth-buster cards before testing.",
            "drill_topic": "CBSE Common Misconceptions",
            "subject": "Science",
        },
        "concept_gap": {
            "title": "Core Concept Deep-Dive",
            "description": f"{top_count} questions were missed due to foundational concept gaps.",
            "fix": "Recommended fix: Review key point & animated diagram posts.",
            "drill_topic": "Fundamental Concept Review",
            "subject": "Science",
        },
    }

    rec = recommendations.get(top_error, recommendations["concept_gap"])
    return {
        "total_errors": total,
        "top_error_type": top_error,
        "top_error_count": top_count,
        "error_distribution": counts,
        "title": rec["title"],
        "summary": rec["description"],
        "recommended_fix": rec["fix"],
        "drill_topic": rec["drill_topic"],
        "drill_subject": rec["subject"],
    }
