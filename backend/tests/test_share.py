"""
Unit & integration tests for Feature 1: Share feeds, unique short codes,
and deep link persistence.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from fastapi.testclient import TestClient
from main import app
from utils.codes import generate_short_code, ALPHABET
from db import InMemorySharedFeedStore, shared_feed_store

client = TestClient(app)


def test_unique_short_codes_1000():
    """Generates 1000 short codes and validates entropy and uniqueness."""
    codes = set()
    for _ in range(1000):
        code = generate_short_code(6)
        assert len(code) == 6
        # Assert no ambiguous characters O, 0, I, 1
        for ch in code:
            assert ch in ALPHABET
            assert ch not in "O0I1"
        codes.add(code)
    # Collision probability across 1000 codes in ~1B space is < 0.001
    assert len(codes) >= 995


def test_share_and_get_deep_link():
    """Tests POST /api/feeds/share and GET /api/feeds/shared/{code}."""
    sample_posts = [
        {
            "type": "key_point",
            "title": "Law of Reflection",
            "body": "The angle of incidence is equal to the angle of reflection ($i = r$).",
            "diagram": "<svg><circle cx='10' cy='10' r='5'/></svg>",
            "grade": 10,
            "subject": "Science",
            "engagement": {"likes": 0, "comments": []},
        },
        {
            "type": "formula",
            "title": "Mirror Formula: $1/f = 1/v + 1/u$",
            "body": "$1/f = 1/v + 1/u$",
            "grade": 10,
            "subject": "Science",
            "engagement": {"likes": 0, "comments": []},
        },
    ]

    res = client.post("/api/feeds/share", json={
        "subject": "Science",
        "grade": 10,
        "topic": "Light — Reflection and Refraction",
        "vibe": "Instagram",
        "posts": sample_posts,
    })
    assert res.status_code == 200
    data = res.json()["data"]
    code = data["short_code"]
    assert len(code) == 6
    assert f"/s/{code}" in data["feed_url"]

    # Verify each post got assigned stable ID: {code}-{index}
    assert data["posts"][0]["id"] == f"{code}-0"
    assert data["posts"][1]["id"] == f"{code}-1"

    # Now fetch via GET
    get_res = client.get(f"/api/feeds/shared/{code}")
    assert get_res.status_code == 200
    g_data = get_res.json()["data"]
    assert g_data["short_code"] == code
    assert len(g_data["posts"]) == 2
    assert g_data["posts"][0]["title"] == "Law of Reflection"
    assert g_data["view_count"] >= 1


def test_share_xss_sanitization():
    """Confirms SVG diagrams with malicious payloads are sanitized on share/read."""
    malicious_posts = [
        {
            "type": "key_point",
            "title": "XSS Test",
            "body": "Testing SVG safety",
            "diagram": "<svg><script>alert('pwned')</script><circle cx='10' cy='10' r='5'/></svg>",
            "grade": 10,
            "subject": "Science",
        }
    ]
    res = client.post("/api/feeds/share", json={
        "subject": "Science",
        "grade": 10,
        "posts": malicious_posts,
    })
    assert res.status_code == 200
    code = res.json()["data"]["short_code"]

    get_res = client.get(f"/api/feeds/shared/{code}")
    assert get_res.status_code == 200
    diagram = get_res.json()["data"]["posts"][0]["diagram"]
    assert "<script>" not in diagram


def test_share_content_moderation():
    """Banned words must trigger 400 Bad Request."""
    bad_posts = [
        {
            "type": "key_point",
            "title": "Phishing and Malware Guide",
            "body": "How to exploit school networks with malware",
            "grade": 10,
            "subject": "Science",
        }
    ]
    res = client.post("/api/feeds/share", json={
        "subject": "Science",
        "grade": 10,
        "topic": "hack exam",
        "posts": bad_posts,
    })
    assert res.status_code == 400
    assert "CONTENT_REJECTED" in res.json()["detail"]


def test_shared_feed_not_found_404():
    """Random non-existent feed code returns 404."""
    res = client.get("/api/feeds/shared/ZZZZZZ")
    assert res.status_code == 404
    assert "FEED_NOT_FOUND" in res.json()["detail"]


@pytest.mark.asyncio
async def test_in_memory_store_fallback():
    """Tests InMemorySharedFeedStore creation, retrieval, and cleanup."""
    mem_store = InMemorySharedFeedStore()
    res = await mem_store.create(
        subject="Science",
        grade=10,
        topic="Electricity",
        vibe="Instagram",
        posts=[{"title": "Ohm's Law"}],
    )
    code = res["short_code"]
    feed = await mem_store.get(code)
    assert feed is not None
    assert feed["topic"] == "Electricity"
    assert feed["view_count"] == 1
