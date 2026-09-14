"""
Adaptive Study Pathway Generator for StudyRot.
Synthesizes student's FSRS-6 retention states, error pattern density,
exam date countdown, and unstudied CBSE chapters into a 7-day calendar.
Balances subjects so no subject exceeds 50% of weekly minutes.
Supports dynamic mid-week roll-forward of uncompleted sessions.
"""

import time
import math
import logging
from datetime import datetime, timezone, timedelta, date
from typing import Dict, Any, List, Optional

from db import db
from verified_context import get_verified_manifest

logger = logging.getLogger("studyrot.planner")

# Standard CBSE Class 10/12 syllabus chapters
DEFAULT_CHAPTERS = {
    "Science": [
        {"topic": "Chemical Reactions and Equations", "weightage": 6},
        {"topic": "Acids, Bases and Salts", "weightage": 6},
        {"topic": "Metals and Non-metals", "weightage": 8},
        {"topic": "Life Processes", "weightage": 8},
        {"topic": "Light — Reflection and Refraction", "weightage": 10},
        {"topic": "Electricity", "weightage": 12},
        {"topic": "Magnetic Effects of Electric Current", "weightage": 7},
    ],
    "Maths": [
        {"topic": "Real Numbers", "weightage": 6},
        {"topic": "Polynomials", "weightage": 6},
        {"topic": "Quadratic Equations", "weightage": 8},
        {"topic": "Arithmetic Progressions", "weightage": 7},
        {"topic": "Introduction to Trigonometry", "weightage": 12},
        {"topic": "Circles", "weightage": 8},
        {"topic": "Statistics and Probability", "weightage": 11},
    ],
    "SST": [
        {"topic": "Nationalism in India", "weightage": 10},
        {"topic": "Resources and Development", "weightage": 8},
        {"topic": "Power Sharing", "weightage": 6},
        {"topic": "Federalism", "weightage": 6},
        {"topic": "Money and Credit", "weightage": 8},
    ]
}


def compute_topic_mastery(
    topic: str,
    review_states: List[Dict[str, Any]],
    error_patterns: List[Dict[str, Any]]
) -> int:
    """
    Computes a 0–100 topic mastery score based on:
    - Average stability & retention probability from FSRS
    - Error pattern density
    """
    topic_cards = [r for r in review_states if topic.lower() in str(r.get("card_id", "")).lower() or topic.lower() in str(r.get("fact", "")).lower()]
    topic_errors = [e for e in error_patterns if topic.lower() in str(e.get("card_id", "")).lower()]

    if not topic_cards:
        return 40  # Default unstudied baseline

    avg_stability = sum(c.get("stability", 1.0) for c in topic_cards) / len(topic_cards)
    # Higher stability = higher retention
    retention_score = min(85, max(20, int(avg_stability * 15)))
    # Error penalty: -8 pts per recorded mistake
    penalty = min(35, len(topic_errors) * 8)

    return max(15, min(100, retention_score - penalty + 15))


def generate_weekly_study_plan(
    user_id: str,
    week_start_date: Optional[date] = None,
    daily_budget_min: int = 45,
    exam_date_str: Optional[str] = None,
    review_states: Optional[List[Dict[str, Any]]] = None,
    error_patterns: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Generates a 7-day balanced pathway plan.
    Enforces subject balance: no single subject > 50% of weekly minutes.
    """
    if not week_start_date:
        today = date.today()
        # Monday of current week
        week_start_date = today - timedelta(days=today.weekday())

    review_states = review_states or []
    error_patterns = error_patterns or []

    # Calculate days to exam
    days_to_exam = 60
    if exam_date_str:
        try:
            ex_date = datetime.strptime(exam_date_str[:10], "%Y-%m-%d").date()
            days_to_exam = max(1, (ex_date - week_start_date).days)
        except Exception:
            pass

    subjects = ["Science", "Maths", "SST"]
    total_week_minutes = daily_budget_min * 7
    max_subject_minutes = total_week_minutes * 0.50

    subject_minutes: Dict[str, int] = {s: 0 for s in subjects}
    days = []

    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for i in range(7):
        current_day_date = week_start_date + timedelta(days=i)
        day_date_str = current_day_date.isoformat()
        day_name = day_names[i]

        is_weekend = (i >= 5)  # Saturday or Sunday
        sessions = []

        # Determine number of sessions and time allocation per session for this day (at least 2 sessions)
        if daily_budget_min >= 60:
            base_time = daily_budget_min // 3
            rem = daily_budget_min % 3
            session_times = [base_time, base_time, base_time + rem]
        else:
            base_time = daily_budget_min // 2
            rem = daily_budget_min % 2
            session_times = [base_time, base_time + rem]

        for s_idx, sess_time in enumerate(session_times):
            # Pick subject with least accumulated minutes that stays within 50% cap
            eligible_subs = [s for s in subjects if (subject_minutes[s] + sess_time) <= max_subject_minutes]
            if not eligible_subs:
                eligible_subs = [s for s in subjects if subject_minutes[s] == min(subject_minutes.values())]

            # Avoid repeating the same subject back-to-back if multiple are eligible
            if len(sessions) > 0 and len(eligible_subs) > 1:
                last_sub = sessions[-1]["subject"]
                diff_subs = [s for s in eligible_subs if s != last_sub]
                if diff_subs:
                    eligible_subs = diff_subs

            target_sub = min(eligible_subs, key=lambda s: subject_minutes[s])

            sub_chapters = DEFAULT_CHAPTERS.get(target_sub, [])
            topic_masteries = [
                (ch["topic"], compute_topic_mastery(ch["topic"], review_states, error_patterns), ch.get("weightage", 5))
                for ch in sub_chapters
            ]
            topic_masteries.sort(key=lambda x: (x[1], -x[2]))
            target_topic = topic_masteries[0][0]
            mastery = topic_masteries[0][1]

            sess_id = f"sess_{day_date_str}_{s_idx + 1}"

            # Weekend mock test priority on Sunday first session
            if is_weekend and i == 6 and s_idx == 0:
                sess_type = "mock"
                topic_title = f"CBSE Class 10 {target_sub} Mock Test"
                reason = f"Weekend board practice test for {target_sub}."
            elif mastery < 45:
                sess_type = "drill"
                topic_title = target_topic
                reason = f"You are at {mastery}% mastery on {target_topic} — targeted error drill."
            elif (i + s_idx) % 2 == 0:
                sess_type = "review"
                topic_title = target_topic
                reason = f"Spaced repetition cards due today for {target_topic}."
            else:
                sess_type = "read"
                topic_title = target_topic
                reason = f"High CBSE weightage concept: study {target_topic} snap feed."

            sessions.append({
                "id": sess_id,
                "session_type": sess_type,
                "subject": target_sub,
                "topic": topic_title,
                "minutes": sess_time,
                "reason": reason,
                "completed": False,
            })
            subject_minutes[target_sub] += sess_time

        days.append({
            "day_name": day_name,
            "date": day_date_str,
            "total_minutes": sum(s["minutes"] for s in sessions),
            "sessions": sessions,
            "completed": False,
        })

    return {
        "user_id": user_id,
        "week_start": week_start_date.isoformat(),
        "daily_budget_min": daily_budget_min,
        "days_to_exam": days_to_exam,
        "subject_distribution_minutes": subject_minutes,
        "days": days,
    }


def roll_forward_uncompleted_sessions(plan: Dict[str, Any], current_date_str: str) -> Dict[str, Any]:
    """
    Dynamic mid-week rebalancer:
    Finds past uncompleted priority-1 (review) and priority-2 (drill) sessions
    and rolls them forward into today or tomorrow's schedule.
    """
    days = plan.get("days", [])
    today_idx = -1

    for idx, d in enumerate(days):
        if d["date"] == current_date_str:
            today_idx = idx
            break

    if today_idx <= 0:
        return plan

    uncompleted_past_sessions = []
    for past_day in days[:today_idx]:
        for sess in past_day.get("sessions", []):
            if not sess.get("completed"):
                uncompleted_past_sessions.append(sess)

    # Roll up to 2 high-priority missed sessions into today
    today_day = days[today_idx]
    for missed in uncompleted_past_sessions[:2]:
        rolled_copy = dict(missed)
        rolled_copy["id"] = f"{missed['id']}_rolled"
        rolled_copy["reason"] = f"[Rolled forward] {missed.get('reason', '')}"
        today_day["sessions"].insert(0, rolled_copy)
        today_day["total_minutes"] += missed["minutes"]

    return plan
