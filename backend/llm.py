"""Groq LLM generation client with exponential backoff, model fallback, and post schema validation."""

import json
import uuid
import asyncio
import logging
from typing import List, Dict, Any, Tuple
from groq import AsyncGroq
from schemas import Post, Quiz
from sanitizer import sanitize_svg
from prompts import STUDYROT_SYSTEM_PROMPT, FEW_SHOT_SVG_EXAMPLES

logger = logging.getLogger("studyrot.llm")

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"
CASCADE_MODELS = [PRIMARY_MODEL, FALLBACK_MODEL, "qwen/qwen3.8-27b", "openai/gpt-oss-120b"]


async def _call_groq_single_attempt(
    client: AsyncGroq,
    model: str,
    user_prompt: str,
    temperature: float = 0.7
) -> str:
    """Invokes Groq chat completion with JSON object format and a 25-second timeout."""
    async def _invoke():
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": STUDYROT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=6144,
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content or ""

    return await asyncio.wait_for(_invoke(), timeout=25.0)


async def call_groq_hardened(
    groq_key: str,
    user_prompt: str,
    request_id: str | None = None,
    temperature: float = 0.7
) -> Dict[str, Any]:
    """
    Executes a Groq call with retries on 429 backoff (1s, 2s, 4s) and fallback to 8b-instant on timeout.
    """
    req_id = request_id or str(uuid.uuid4())[:8]
    client = AsyncGroq(api_key=groq_key.strip())

    models = CASCADE_MODELS
    last_error: Exception | None = None

    for model in models:
        for attempt, delay in enumerate([0, 1, 2, 4]):
            if delay > 0:
                logger.info("[%s] Backoff retry attempt %d after %ds for %s", req_id, attempt, delay, model)
                await asyncio.sleep(delay)
            try:
                raw_text = await _call_groq_single_attempt(client, model, user_prompt, temperature)
                if not raw_text.strip():
                    raise ValueError("Groq returned empty text payload")

                data = json.loads(raw_text)
                posts = data.get("posts")
                if not posts or not isinstance(posts, list):
                    for k, val in data.items():
                        if isinstance(val, list) and len(val) > 0:
                            posts = val
                            break

                if posts and isinstance(posts, list):
                    logger.info("[%s] Successfully generated %d raw posts via %s", req_id, len(posts), model)
                    return {"posts": posts}
                raise ValueError("JSON payload does not contain an array of posts")

            except asyncio.TimeoutError as te:
                logger.warning("[%s] Model %s timed out after 25s", req_id, model)
                last_error = te
                break  # Fall back directly to the next lighter model
            except Exception as e:
                err_str = str(e).lower()
                logger.warning("[%s] Attempt %d with model %s failed: %s", req_id, attempt, model, e)
                last_error = e
                if "429" in err_str or "rate limit" in err_str:
                    continue  # Retry with backoff
                # For non-rate-limit errors, advance to next model
                break

    raise RuntimeError(f"All Groq models and retries failed: {last_error}")


async def _supplement_quizzes(
    groq_key: str,
    topic_context: str,
    subject: str,
    grade: int
) -> List[Dict[str, Any]]:
    """Generates 2 supplementary quiz posts if the primary generation was deficient."""
    try:
        client = AsyncGroq(api_key=groq_key.strip())
        prompt = (
            f"Add 2 more NCERT CBSE Board-style MCQ quiz posts for Class {grade} {subject} on: {topic_context[:200]}.\n"
            "Return ONLY JSON format with a 'posts' array containing quiz posts with question, 4 options, verbatim answer, and explanation."
        )
        content = await _call_groq_single_attempt(client, FALLBACK_MODEL, prompt, temperature=0.5)
        parsed = json.loads(content)
        return parsed.get("posts", [])
    except Exception as e:
        logger.warning("Failed to supplement quizzes: %s", e)
        return []


def validate_and_sanitize_posts(
    raw_posts: List[Dict[str, Any]],
    default_subject: str = "Science",
    default_grade: int = 10
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Validates posts using Pydantic Post model and sanitizes SVGs.
    Returns (validated_posts, failed_count).
    """
    validated: List[Dict[str, Any]] = []
    failed_count = 0

    for raw in raw_posts:
        if not isinstance(raw, dict):
            failed_count += 1
            continue

        raw["subject"] = raw.get("subject") or default_subject
        raw["grade"] = int(raw.get("grade") or default_grade)
        if not raw.get("hashtags"):
            raw["hashtags"] = [f"#{raw['subject']}", f"#Class{raw['grade']}"]

        # SVG Sanitization
        raw["diagram"] = sanitize_svg(raw.get("diagram"))

        # Quiz Answer Integrity
        raw_quiz = raw.get("quiz")
        if raw_quiz and isinstance(raw_quiz, dict):
            try:
                # Validate quiz object
                q_model = Quiz(**raw_quiz)
                raw["quiz"] = q_model.model_dump()
            except Exception as q_err:
                logger.warning("Quiz validation failed; converting post or dropping quiz: %s", q_err)
                raw["quiz"] = None
                if raw.get("type") == "quiz":
                    raw["type"] = "key_point"

        try:
            post_model = Post(**raw)
            clean_dict = post_model.model_dump()
            validated.append(clean_dict)
        except Exception as p_err:
            logger.warning("Post schema validation rejected post '%s': %s", raw.get("title"), p_err)
            failed_count += 1

    return validated, failed_count


async def generate_hardened_feed(
    groq_key: str,
    user_prompt: str,
    subject: str = "Science",
    grade: int = 10,
    topic_summary: str = ""
) -> List[Dict[str, Any]]:
    """
    Orchestrates full generation, validation, re-try on high failure rate, and quiz deficiency fix.
    """
    req_id = str(uuid.uuid4())[:8]

    # Attempt 1
    groq_res = await call_groq_hardened(groq_key, user_prompt, request_id=req_id, temperature=0.7)
    posts, failed_count = validate_and_sanitize_posts(groq_res.get("posts", []), subject, grade)

    # If > 3 posts fail, regenerate whole batch once with temperature=0.4
    if failed_count > 3 or len(posts) < 8:
        logger.warning("[%s] High failure rate (%d failed, %d valid); regenerating at temp 0.4", req_id, failed_count, len(posts))
        groq_res = await call_groq_hardened(groq_key, user_prompt, request_id=req_id, temperature=0.4)
        posts, _ = validate_and_sanitize_posts(groq_res.get("posts", []), subject, grade)

    # Check quiz count (must have at least 4 quizzes)
    quizzes = [p for p in posts if p.get("type") == "quiz" and p.get("quiz")]
    if len(quizzes) < 4:
        logger.info("[%s] Deficient quizzes (%d found, 4 required); requesting supplementary quizzes", req_id, len(quizzes))
        extra_raw = await _supplement_quizzes(groq_key, topic_summary or user_prompt, subject, grade)
        extra_validated, _ = validate_and_sanitize_posts(extra_raw, subject, grade)
        posts.extend(extra_validated)

    # Enforce minimum post count (14-18)
    if len(posts) < 14:
        logger.info("[%s] Feed has %d posts; supplementing to reach target 14-18", req_id, len(posts))
        from pathlib import Path
        demo_dir = Path(__file__).resolve().parent / "data" / "demo-feeds"
        search_terms = f"{subject} {grade} {topic_summary}".lower()
        matched_file = None
        if demo_dir.exists():
            for f in demo_dir.glob("*.json"):
                stem = f.stem.replace("-", " ").lower()
                if any(w in search_terms for w in stem.split() if len(w) > 3):
                    matched_file = f
                    break
            if not matched_file:
                matched_file = next(demo_dir.glob("*.json"), None)
            if matched_file and matched_file.exists():
                try:
                    with open(matched_file, "r", encoding="utf-8") as f_in:
                        supp_posts = json.load(f_in)
                    existing_titles = set(p.get("title", "").strip().lower() for p in posts)
                    for sp in supp_posts:
                        if len(posts) >= 14:
                            break
                        if sp.get("title", "").strip().lower() not in existing_titles:
                            posts.append(sp)
                            existing_titles.add(sp.get("title", "").strip().lower())
                except Exception as err:
                    logger.warning("Failed to supplement from prebaked: %s", err)

    return posts[:18]
