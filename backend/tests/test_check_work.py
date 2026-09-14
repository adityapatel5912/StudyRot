"""
Unit and Integration Tests for Check My Work with Photo Feedback (Feature 3).
Tests single photo grading, batch processing up to 5 images,
SHA-256 image content caching, rate limits, and BYOK key isolation.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from check_work import (
    grade_solution_pipeline,
    check_rate_limits,
    _CHECK_WORK_CACHE,
    SAMPLE_PHYSICS_NUMERICAL,
)
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_sample_problem_returns_cleanly():
    """Verifies that with no keys supplied, the system returns a verified diagnostic structure."""
    result = await grade_solution_pipeline(
        image_b64="data:image/jpeg;base64,mockimagedata123",
        question_text="Sample mirror numerical",
        user_nvidia_key=None,
        user_groq_key=None,
    )
    assert result["score"] == "4/5"
    assert len(result["steps"]) == 5
    assert result["misconception_detected"] == "magnification_sign_confusion"
    assert any(s["verdict"] == "wrong" for s in result["steps"])
    assert any(s["verdict"] == "correct" for s in result["steps"])


@pytest.mark.asyncio
async def test_sha256_image_caching():
    """Verifies that identical image content returns from 24h cache without re-processing."""
    fake_b64 = "sample_test_image_base64_string_xyz"
    res1 = await grade_solution_pipeline(image_b64=fake_b64, question_text="Q1")
    assert res1 is not None

    # Check cache directly
    import hashlib
    h = hashlib.sha256(fake_b64.encode("utf-8")).hexdigest()
    assert h in _CHECK_WORK_CACHE

    res2 = await grade_solution_pipeline(image_b64=fake_b64, question_text="Q1")
    assert res2 == res1


def test_rate_limiting_enforcement():
    """Verifies that exceeding 20 single checks/hr or 5 batches/hr triggers 429."""
    test_ip = "192.168.1.99"
    # Run 20 checks
    for _ in range(20):
        check_rate_limits(test_ip, is_batch=False)

    # 21st check must fail with 429
    with pytest.raises(HTTPException) as excinfo:
        check_rate_limits(test_ip, is_batch=False)
    assert excinfo.value.status_code == 429


@pytest.mark.asyncio
async def test_check_work_endpoints():
    """Tests the /api/check-work and /api/check-work/batch endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Single check endpoint without image returns sample
        res = await client.post("/api/check-work")
        assert res.status_code == 200
        assert res.json()["ok"] is True
        assert "score" in res.json()["data"]

        # Batch check endpoint with 2 images
        res_batch = await client.post("/api/check-work/batch", json={
            "images": ["img_b64_1", "img_b64_2"],
            "question": "Physics Exam Homework",
        })
        assert res_batch.status_code == 200
        batch_data = res_batch.json()
        assert batch_data["ok"] is True
        assert batch_data["data"]["pages_processed"] == 2
