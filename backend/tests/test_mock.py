"""
Unit and Integration Tests for Full Mock Test Mode (Feature 1).
Tests template loading, paper assembly marks consistency,
difficulty distribution, auto-grading against CBSE marking schemes,
FSRS review queue synchronization, and REST endpoints.
"""

import sys
from pathlib import Path
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from mock import (
    get_available_templates,
    assemble_mock_paper,
    grade_mock_submission,
    balance_difficulty,
)


@pytest.mark.asyncio
async def test_mock_templates_loaded():
    """Verifies that templates for Class 10 and 12 are loaded correctly."""
    templates = get_available_templates()
    assert len(templates) >= 3
    subjects = [t["subject"] for t in templates]
    assert "Science" in subjects
    assert "Maths" in subjects
    assert "SST" in subjects

    sci_template = next(t for t in templates if t["subject"] == "Science" and t["grade"] == 10)
    assert sci_template["total_marks"] == 80
    assert sci_template["duration_min"] == 180
    assert len(sci_template["sections"]) == 5


@pytest.mark.asyncio
async def test_paper_assembly_and_difficulty():
    """Verifies that paper marks sum to 80 and difficulty balancing executes."""
    paper = assemble_mock_paper("Science", 10)
    assert paper["subject"] == "Science"
    assert paper["grade"] == 10
    assert paper["total_marks"] == 80
    assert len(paper["sections"]) == 5

    # Check question counts
    sec_a = next(s for s in paper["sections"] if s["id"] == "A")
    assert len(sec_a["questions"]) == 20
    assert sec_a["marks_per_q"] == 1

    # Verify difficulty balancing function
    sample_pool = [
        {"id": f"q_{i}", "concept_complexity": "easy" if i < 40 else "medium" if i < 80 else "hard"}
        for i in range(100)
    ]
    balanced = balance_difficulty(sample_pool, 20)
    assert len(balanced) == 20
    easy_count = sum(1 for q in balanced if q.get("concept_complexity") == "easy")
    med_count = sum(1 for q in balanced if q.get("concept_complexity") == "medium")
    # Target: ~8 easy (40%), ~8 med (40%), ~4 hard (20%)
    assert 6 <= easy_count <= 10
    assert 6 <= med_count <= 10


@pytest.mark.asyncio
async def test_auto_grader_and_fsrs_sync():
    """Tests auto-grader with MCQs, rubric-graded SA, and FSRS queue updates."""
    paper = {
        "title": "Test Mock",
        "subject": "Science",
        "grade": 10,
        "total_marks": 5,
        "sections": [
            {
                "id": "A",
                "name": "Section A",
                "total_marks": 2,
                "questions": [
                    {
                        "id": "q1",
                        "q_number": 1,
                        "type": "MCQ",
                        "marks": 1,
                        "chapter": "Light",
                        "question": "Convex mirror produces:",
                        "correct_answer": "Virtual and erect",
                        "marking_scheme": "1 mark for Virtual and erect",
                    },
                    {
                        "id": "q2",
                        "q_number": 2,
                        "type": "MCQ",
                        "marks": 1,
                        "chapter": "Electricity",
                        "question": "Ohm's law formula:",
                        "correct_answer": "V = IR",
                        "marking_scheme": "1 mark for V = IR",
                    }
                ]
            },
            {
                "id": "B",
                "name": "Section B",
                "total_marks": 3,
                "questions": [
                    {
                        "id": "q3",
                        "q_number": 3,
                        "type": "SA1",
                        "marks": 3,
                        "chapter": "Light",
                        "question": "State mirror formula and define variables.",
                        "correct_answer": "1/v + 1/u = 1/f where v is image distance, u is object distance, f is focal length",
                        "marking_scheme": "1/v + 1/u = 1/f object distance image distance focal length",
                    }
                ]
            }
        ]
    }

    answers = {
        "q1": "Virtual and erect",  # Correct MCQ
        "q2": "P = VI",            # Wrong MCQ
        "q3": "The mirror formula is 1/v + 1/u = 1/f with object distance and focal length",  # Partial/Good SA
    }

    report = await grade_mock_submission(paper, answers, duration_sec=120)
    assert report["total_score"] >= 2
    assert report["max_marks"] == 5
    assert report["percentage"] > 0
    assert report["grade"] in ["A1", "A2", "B1", "B2", "C1", "C2", "D", "E (Needs Improvement)"]
    assert report["fsrs_updates_count"] == 3
    assert "section_breakdown" in report


@pytest.mark.asyncio
async def test_mock_endpoints_flow():
    """Tests the full API flow: create paper, autosave, submit, and history."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create Paper
        res = await client.post("/api/mock/create", json={"subject": "Science", "grade": 10})
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        mock_id = data["data"]["mock_id"]
        paper = data["data"]["paper"]
        assert paper["total_marks"] == 80

        # 2. Autosave
        res_save = await client.post(
            f"/api/mock/{mock_id}/autosave",
            json={"answers": {"1": "Option A"}, "duration_sec": 30}
        )
        assert res_save.status_code == 200

        # 3. Submit
        res_sub = await client.post(
            f"/api/mock/{mock_id}/submit",
            json={"answers": {"1": "3Fe + 4H2O -> Fe3O4 + 4H2"}, "duration_sec": 120}
        )
        assert res_sub.status_code == 200
        sub_data = res_sub.json()
        assert sub_data["ok"] is True
        assert "total_score" in sub_data["data"]

        # 4. Get Paper State
        res_get = await client.get(f"/api/mock/{mock_id}")
        assert res_get.status_code == 200
        assert res_get.json()["data"]["status"] == "completed"
