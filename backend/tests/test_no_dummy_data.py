"""
Quality Gate Test: Verify no dummy data, prebaked feeds, seeded comments,
fake likes, or fake bot names exist in active source directories.
"""

import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_SRC = ROOT_DIR / "frontend" / "src"


def test_no_demo_feed_directories():
    """Confirms demo-feeds directories are completely removed."""
    assert not (BACKEND_DIR / "data" / "demo-feeds").exists(), "backend/data/demo-feeds must not exist"
    assert not (ROOT_DIR / "frontend" / "public" / "demo-feeds").exists(), "frontend/public/demo-feeds must not exist"


def test_no_studybuddy_in_code():
    """Grep source code for STUDYBUDDY / StudyBuddy fake commenters."""
    for root, _, files in os.walk(FRONTEND_SRC):
        for f in files:
            if f.endswith((".js", ".jsx", ".ts", ".tsx")):
                file_path = Path(root) / f
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                assert "StudyBuddy" not in content, f"Found 'StudyBuddy' in {file_path}"
                assert "STUDYBUDDY" not in content, f"Found 'STUDYBUDDY' in {file_path}"


def test_no_seed_comment_in_frontend():
    """Confirms seed_comment was removed from CommentSheet and Post cards."""
    for root, _, files in os.walk(FRONTEND_SRC):
        for f in files:
            if f.endswith((".js", ".jsx", ".ts", ".tsx")):
                file_path = Path(root) / f
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                assert "seed_comment" not in content, f"Found 'seed_comment' in {file_path}"


def test_no_hardcoded_likes_24():
    """Grep backend schemas and frontend components for 'likes: 24'."""
    pattern = re.compile(r"likes[\"']?\s*:\s*24")
    # Backend
    for root, _, files in os.walk(BACKEND_DIR):
        if "tests" in root or ".pytest_cache" in root or "__pycache__" in root:
            continue
        for f in files:
            if f.endswith(".py"):
                file_path = Path(root) / f
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                assert not pattern.search(content), f"Found 'likes: 24' in {file_path}"

    # Frontend
    for root, _, files in os.walk(FRONTEND_SRC):
        for f in files:
            if f.endswith((".js", ".jsx", ".ts", ".tsx")):
                file_path = Path(root) / f
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                assert not pattern.search(content), f"Found 'likes: 24' in {file_path}"


def test_no_demo_keys_in_env():
    """Confirms DEMO_GROQ_KEY and DEMO_TAVILY_KEY do not exist in .env and .env.example."""
    for env_file in [ROOT_DIR / ".env.example", BACKEND_DIR / ".env.example", BACKEND_DIR / ".env"]:
        if env_file.exists():
            content = env_file.read_text(encoding="utf-8", errors="ignore")
            assert "DEMO_GROQ_KEY" not in content, f"Found DEMO_GROQ_KEY in {env_file}"
            assert "DEMO_TAVILY_KEY" not in content, f"Found DEMO_TAVILY_KEY in {env_file}"
