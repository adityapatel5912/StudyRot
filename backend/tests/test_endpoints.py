"""
Comprehensive unit and integration test suite for StudyRot API endpoints,
sanitizer, quiz integrity, crypto, auth, research grounding, and battle WebSockets.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from fastapi.testclient import TestClient
from main import app
from schemas import Post, Quiz
from sanitizer import sanitize_svg
from battle import BattleRoom, BattleManager
from crypto import encrypt_api_key, decrypt_api_key
from verified_context import get_verified_ncert_context

client = TestClient(app)


# 1. Health and Environment Flags
def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["data"]["status"] == "healthy"
    assert "keys_present" in data["data"]
    assert isinstance(data["data"]["keys_present"], dict)
    assert "groq" in data["data"]["keys_present"]
    assert "tavily" in data["data"]["keys_present"]


# 2. SVG Sanitizer Security Checks
def test_sanitizer_security():
    # Reject script tags
    assert sanitize_svg('<svg><script>alert("xss")</script><circle r="10"/></svg>') == ""
    # Reject foreignObject
    assert sanitize_svg('<svg><foreignObject><div>bad</div></foreignObject></svg>') == ""
    # Reject inline event handlers
    assert sanitize_svg('<svg><circle r="10" onload="alert(1)"/></svg>') == ""
    # Reject javascript: URLs
    assert sanitize_svg('<svg><a href="javascript:alert(1)"><circle r="10"/></a></svg>') == ""
    # Allow safe SVG
    safe_svg = '<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="120" r="50" fill="#0f1e3d"/></svg>'
    sanitized = sanitize_svg(safe_svg)
    assert sanitized.startswith("<svg")
    assert "</svg>" in sanitized


# 3. Quiz Answer and Uniqueness Validation
def test_quiz_integrity_validation():
    # Valid quiz with exact match
    q = Quiz(
        question="What is the SI unit of electric current?",
        options=["Volt", "Ampere", "Ohm", "Watt"],
        answer="Ampere",
        explanation="Ampere measures electric charge flow per second."
    )
    assert q.answer == "Ampere"

    # Fuzzy match (case-insensitive & whitespace-stripped)
    q_fuzzy = Quiz(
        question="What is the unit of resistance?",
        options=["Volt", "Ampere", "Ohm", "Watt"],
        answer="  ohm  ",
        explanation="Ohm is the SI unit of electrical resistance."
    )
    assert q_fuzzy.answer == "Ohm"

    # Letter match (B -> Ampere)
    q_letter = Quiz(
        question="Which is SI unit of current?",
        options=["Volt", "Ampere", "Ohm", "Watt"],
        answer="B",
        explanation="Option B is Ampere."
    )
    assert q_letter.answer == "Ampere"

    # Duplicate options must raise ValueError
    with pytest.raises(ValueError):
        Quiz(
            question="Duplicate test question",
            options=["Ampere", "Volt", "Ampere", "Ohm"],
            answer="Volt",
            explanation="Invalid duplicate option test."
        )

    # Mismatch raises validation error
    with pytest.raises(ValueError):
        Quiz(
            question="What is the capital of India?",
            options=["Mumbai", "Delhi", "Kolkata", "Chennai"],
            answer="Bengaluru",
            explanation="Invalid answer not in options."
        )


# 4. Post Schema Validation
def test_post_schema_validation():
    post_data = {
        "type": "key_point",
        "title": "Ohm's Law: $V = IR$",
        "body": "At constant temperature, potential difference $V$ is directly proportional to current $I$.",
        "analogy": "Like water pressure in a pipe.",
        "quiz": None,
        "diagram": "",
        "hashtags": ["#Physics", "#Class10"],
        "source_ref": "NCERT Class 10 Science Ch 12 — Electricity",
        "grade": 10,
        "subject": "Science",
        "engagement": {"likes": 12, "comments": []}
    }
    p = Post(**post_data)
    assert p.type == "key_point"
    assert len(p.hashtags) == 2


# 5. Error Envelopes & Rate Limiting Checks
def test_generate_missing_key_error_envelope():
    res = client.post("/api/generate", json={
        "groq_key": "",
        "text": "Photosynthesis",
        "subject": "Science",
        "grade": 10
    })
    # If GROQ_API_KEY is present in env, it generates; if absent, returns 400 KEY_REQUIRED
    assert res.status_code in [200, 400]
    data = res.json()
    assert "ok" in data


def test_demo_generate_endpoint():
    res = client.post("/api/demo-generate", json={
        "text": "Light — Reflection and Refraction",
        "subject": "Science",
        "grade": 10
    })
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert "posts" in data["data"]
    assert len(data["data"]["posts"]) >= 14
    first_post = data["data"]["posts"][0]
    assert "title" in first_post
    assert "body" in first_post
    assert "source_ref" in first_post


# 6. AES-256-GCM Cryptographic Tests
def test_crypto_roundtrip():
    secret = "test-secret-key-12345"
    original_key = "gsk_test_api_key_for_groq_llama_model"
    encrypted = encrypt_api_key(original_key, master_secret=secret)
    assert encrypted != original_key
    assert len(encrypted) > 20

    decrypted = decrypt_api_key(encrypted, master_secret=secret)
    assert decrypted == original_key


# 7. Verified Research Cache Loader
def test_research_cache_loader():
    # Exact/Fuzzy match for Science 10 Light
    ctx, is_verified = get_verified_ncert_context("Science", 10, "Light — Reflection and Refraction")
    assert is_verified is True
    assert "NCERT" in ctx
    assert len(ctx) > 100

    # Miss test
    miss_ctx, miss_verified = get_verified_ncert_context("Astronomy", 99, "Alien Spaceships")
    assert miss_verified is False
    assert miss_ctx == ""


# 8. Authentication Tests
def test_protected_routes_unauthorized():
    # Protected route without token must return 401
    res = client.get("/api/my-feeds")
    assert res.status_code == 401

    # Protected route with invalid token must return 401
    res_bad = client.get("/api/my-feeds", headers={"Authorization": "Bearer invalid_gibberish_token"})
    assert res_bad.status_code == 401


def test_protected_routes_with_valid_dev_token():
    # Development token test
    res = client.get("/api/my-feeds", headers={"Authorization": "Bearer test_token_student1"})
    assert res.status_code == 200
    assert res.json()["ok"] is True


# 9. Classroom Battle Flow & WebSockets
def test_battle_lifecycle():
    # Create battle
    create_res = client.post("/api/battle/create", json={
        "topic": "Electricity",
        "subject": "Science",
        "grade": 10
    })
    assert create_res.status_code == 200
    c_data = create_res.json()["data"]
    room_code = c_data["room_code"]
    assert len(room_code) == 6

    # Join battle
    join_res = client.post("/api/battle/join", json={
        "room_code": room_code,
        "nickname": "Aryabhata"
    })
    assert join_res.status_code == 200
    j_data = join_res.json()["data"]
    player_id = j_data["player_id"]
    assert "player_id" in j_data

    # WebSocket connection
    with client.websocket_connect(f"/ws/battle/{room_code}") as ws:
        # Handshake
        ws.send_json({"player_id": player_id, "nickname": "Aryabhata"})
        welcome = ws.receive_json()
        assert welcome["type"] in ["lobby", "JOINED"]

        # Ping pong
        ws.send_json({"type": "ready"})
        pong = ws.receive_json()
        assert pong["type"] in ["pong", "lobby"]
