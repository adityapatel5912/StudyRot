"""Tavily search service with domain deduplication, TTL caching, and graceful degradation."""

import time
import asyncio
import logging
from urllib.parse import urlparse
from typing import Tuple, Dict, Any

logger = logging.getLogger("studyrot.search")

# In-memory cache with 6-hour TTL: key -> (timestamp, context_str)
_TAVILY_CACHE: Dict[str, Tuple[float, str]] = {}
CACHE_TTL_SEC = 6 * 3600


def _extract_domain(url: str) -> str:
    try:
        parsed = urlparse(url)
        return parsed.netloc.lower()
    except Exception:
        return ""


async def search_tavily_cached(
    api_key: str | None,
    grade: int,
    subject: str,
    topic: str
) -> Tuple[str, bool]:
    """
    Executes a 2-pass search on Tavily with domain deduplication and 6-hour caching.
    Returns (context_text, grounded_flag).
    """
    if not api_key or not api_key.strip():
        return "", False

    cache_key = f"{subject.lower()}:{grade}:{topic.strip().lower()[:80]}"
    now = time.time()

    # Check cache
    if cache_key in _TAVILY_CACHE:
        ts, cached_ctx = _TAVILY_CACHE[cache_key]
        if now - ts < CACHE_TTL_SEC:
            logger.info("Tavily search hit cache for key: %s", cache_key)
            return cached_ctx, True

    async def _execute_search() -> str:
        from tavily import AsyncTavilyClient
        client = AsyncTavilyClient(api_key=api_key.strip())

        query1 = f"CBSE Class {grade} {subject} {topic} NCERT chapter syllabus"
        query2 = f"{topic} real world applications India examples common mistakes"

        res1_task = client.search(query=query1, search_depth="advanced", max_results=5)
        res2_task = client.search(query=query2, search_depth="advanced", max_results=5)

        res1, res2 = await asyncio.gather(res1_task, res2_task, return_exceptions=True)

        seen_domains = set()
        ncert_snippets = []
        rw_snippets = []

        if isinstance(res1, dict):
            for r in res1.get("results", []):
                domain = _extract_domain(r.get("url", ""))
                if domain and domain in seen_domains:
                    continue
                if domain:
                    seen_domains.add(domain)
                snippet = (r.get("content") or "")[:600]
                ncert_snippets.append(f"- {r.get('title', 'NCERT Context')}: {snippet}")
                if len(ncert_snippets) >= 3:
                    break

        if isinstance(res2, dict):
            for r in res2.get("results", []):
                domain = _extract_domain(r.get("url", ""))
                if domain and domain in seen_domains:
                    continue
                if domain:
                    seen_domains.add(domain)
                snippet = (r.get("content") or "")[:600]
                rw_snippets.append(f"- {r.get('title', 'Application')}: {snippet}")
                if len(rw_snippets) >= 3:
                    break

        blocks = []
        if ncert_snippets:
            blocks.append("## NCERT SYLLABUS CONTEXT\n" + "\n".join(ncert_snippets))
        if rw_snippets:
            blocks.append("## REAL-WORLD & INDIAN CONTEXT\n" + "\n".join(rw_snippets))

        return "\n\n".join(blocks)

    try:
        # Cap total search time at 8 seconds
        context = await asyncio.wait_for(_execute_search(), timeout=8.0)
        if context.strip():
            _TAVILY_CACHE[cache_key] = (now, context)
            return context, True
        return "", False
    except asyncio.TimeoutError:
        logger.warning("Tavily search timed out after 8s for query: %s", topic)
        return "", False
    except Exception as e:
        logger.warning("Tavily search error: %s", e)
        return "", False
