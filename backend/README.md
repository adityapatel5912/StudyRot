# StudyRot — Backend API Service

FastAPI backend providing NCERT chapter synthesis via Groq and Tavily, AES-256-GCM encrypted BYO key persistence, verified curriculum topic caching, and real-time multiplayer WebSocket classroom battles.

---

## 1. Quick Start

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --reload --port 8000
```

Interactive OpenAPI docs will be available at `http://localhost:8000/docs`.

---

## 2. Environment Configuration

Edit `.env`:
```ini
PORT=8000
DEMO_MODE=true
RATE_LIMIT_DEMO=10/hour
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly-...
ENCRYPTION_MASTER_KEY=your-32-char-master-encryption-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJh...
```

---

## 3. Automated Pytest Suite

Run all automated unit and integration tests:
```bash
pytest tests/test_endpoints.py -v
```

Test coverage includes:
- System health and safe key presence detection
- SVG XSS sanitization and strip validation
- MCQ option exclusivity and exact answer integrity
- Pydantic Post and Feed schema contracts
- Rate limiting and 401 KEY_REQUIRED error envelopes
- AES-256-GCM encryption/decryption roundtrips
- 15 verified research topic caches
- Dev mock token and protected route authentication
- WebSocket classroom battle state lifecycle and scoring

---

## 4. Key Modules

- `main.py`: FastAPI routes, middleware, lifespan hooks, and static asset mounts.
- `battle.py`: `BattleRoom` and `BattleManager` handling authoritative timers and WebSocket broadcasts.
- `llm.py`: Groq Cloud integration with model fallback cascade (`llama-3.3-70b-versatile`, `qwen/qwen3.8-27b`).
- `crypto.py`: AES-256-GCM cipher with PBKDF2-HMAC-SHA256 key derivation.
- `db.py`: Supabase database client with local in-memory fallback.
- `schemas.py`: Pydantic models for feeds, posts, quizzes, and battle payloads.
- `sanitizer.py`: Clean SVG XML tag and event handler sanitization.
- `search.py`: Tavily search API client for syllabus fact grounding.
