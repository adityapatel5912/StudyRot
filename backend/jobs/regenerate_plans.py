"""
Nightly Study Plan Rebalancing Job.
Executes at 2:00 AM IST to roll forward uncompleted sessions and re-evaluate
weekly schedules for active students with set exam dates.
"""

import logging
from datetime import datetime, timezone, date
from planner import generate_weekly_study_plan, roll_forward_uncompleted_sessions
from db import db

logger = logging.getLogger("studyrot.planner_job")


async def run_nightly_plan_regeneration():
    """
    Scans active users and updates their remaining weekly study pathway days.
    """
    logger.info("Starting nightly adaptive study plan regeneration job at %s", datetime.now(timezone.utc).isoformat())
    today = date.today()
    today_str = today.isoformat()
    week_start = (today - date.resolution * today.weekday()).isoformat()

    try:
        # Rebalance guest / default in-memory plan
        default_plan = await db.get_study_plan("guest", week_start)
        if default_plan:
            plan_json = default_plan.get("plan_json", {})
            updated = roll_forward_uncompleted_sessions(plan_json, today_str)
            await db.save_study_plan("guest", week_start, updated)
            logger.info("Rebalanced default guest weekly study plan")
    except Exception as e:
        logger.warning("Error running nightly plan regeneration: %s", e)


def schedule_planner_jobs(scheduler):
    """
    Mounts the recurring cron job with APScheduler.
    Runs every day at 02:00 IST (20:30 UTC).
    """
    try:
        from apscheduler.triggers.cron import CronTrigger
        scheduler.add_job(
            run_nightly_plan_regeneration,
            CronTrigger(hour=20, minute=30),  # 20:30 UTC is 02:00 IST
            id="nightly_plan_regeneration",
            replace_existing=True,
        )
        logger.info("Scheduled nightly study plan regeneration job (02:00 IST)")
    except Exception as e:
        logger.warning("Failed to schedule planner job: %s", e)
