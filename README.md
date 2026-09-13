# StudyRot — NCERT Study Feeds & Classroom Battles

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Groq](https://img.shields.io/badge/LLM-Groq_Llama_3.3_70B-F55036?logo=groq&logoColor=white)](https://groq.com)
[![Tavily](https://img.shields.io/badge/Search-Tavily_AI-4F46E5)](https://tavily.com)
[![Pytest](https://img.shields.io/badge/Tests-11%2F11_Passing-success)](backend/tests)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Turn dense CBSE Class 8–12 NCERT textbooks into an addictive, swipeable feed with animated SVGs, timed board-exam MCQs, and real-time multiplayer classroom battles.**

---

## 1. Executive Summary

Students spend hours doomscrolling short-form video algorithms designed for distraction. **StudyRot** reclaims that habit loops by transforming dry NCERT chapters into a high-engagement, TikTok-style snap-scroll feed. Every swipe delivers structured CBSE curriculum concepts:
- **Zero Hallucinations**: Grounded via Tavily Search and verified NCERT curriculum knowledge bases.
- **Visual Retention**: Handcrafted, animated SVGs and ray diagrams for every scientific concept.
- **Active Recall**: Timed board-exam MCQs with Web Audio haptics and KaTeX LaTeX rendering.
- **Classroom Battles**: Real-time 6-digit PIN multiplayer arenas powered by server-authoritative WebSockets.
- **Privacy First**: BYO Groq/Tavily API keys encrypted at rest using AES-256-GCM authenticated encryption.

---

## 2. Live Demo & Video Links

- 🌐 **Live Web Application**: [VERCEL_LINK]
- 📺 **Full Video Walkthrough**: [YOUTUBE_LINK]
- 📑 **Hackathon Pitch Deck**: [`submission/pitch-deck.pdf`](submission/pitch-deck.pdf) (Slide source: [`submission/pitch-deck.md`](submission/pitch-deck.md))
- ⏱️ **Presentation Script**: [`submission/demo-script.md`](submission/demo-script.md)

---

## 3. Core Features

### 📱 Snap-Scroll Vertical Feed
- Strict `100dvh` full-height card viewport with CSS `scroll-snap-type: y mandatory` and `overscroll-behavior: contain`.
- IntersectionObserver-driven lazy rendering mounting only adjacent cards to guarantee 60fps scrolling on mobile devices.
- Keyboard navigation (Arrow Up / Arrow Down), dynamic vertical dot indicator, and top position pill.

### 📐 Animated SVG Ray Diagrams & Visual Models
- Pure vector graphics embedded per concept: Optics ray tracings with normal lines, Snell's law refraction, Ohm's law circuits, conic sections (parabolas, focus, directrix), and historical timelines.
- Clean inline SVG sanitization stripping `<script>`, external attributes, and malicious event handlers.

### ⏱️ Timed Board-Exam MCQs & Fullscreen Mode
- Configurable countdown timer (5s–60s) with 3px SVG animating progress bar and monospace countdown.
- High-contrast pure white default option styling with colored reveal states: Emerald green for correct answers, crimson red for wrong picks, and amber badges for missed correct choices.
- Web Audio API procedural sound triggers (`correct.mp3`, `wrong.mp3`, `tick.mp3`, `timeup.mp3`, `win.mp3`) with global header mute toggle.
- Distraction-free Fullscreen Quiz Modal with zero layout clipping, keyboard number hotkeys (1–4 / A–D), and KaTeX formula typesetting.

### ⚔️ Real-Time Classroom Battle Arena
- Multi-user live quiz competition with 6-digit PIN room codes.
- Server-authoritative 15-second question timers and speed-based scoring: $\text{Score} = 500 + \left(\frac{t_{\text{remaining}}}{15}\right) \times 500$.
- Dynamic host promotion if room creator disconnects, 10-message circular replay buffer for drop-in sync, and automatic 30-minute stale room cleanup.
- Solo Practice Mode with instant CBSE topper simulation bot players for zero-wait solo revision.

### 🔒 BYO Keys with AES-256-GCM Authenticated Encryption
- Bring-Your-Own Groq (`gsk_...`) and Tavily (`tvly-...`) API keys.
- Client keys are encrypted with authenticated AES-256-GCM using PBKDF2/SHA-256 derived keys before persistence in Supabase.
- Server health endpoint reports key presence safely without leaking secret values.

### 🧠 Verified NCERT Research Grounding
- 15 verified research topics spanning Science, Maths, and Social Science (SST) across Class 8, 10, and 12.
- Pre-baked 14-post offline topic feeds guaranteeing instant load times in Demo Mode without requiring an API key.
- Strict Jaccard word-overlap deduplication filtering out duplicate explanations between body copy and callout tips.

---

## 4. System Architecture

```
                                  STUDYROT ARCHITECTURE
                                  
   +-----------------------------------------------------------------------------------+
   |                                FRONTEND (React 18 + Vite)                         |
   |                                                                                   |
   |  [Header & Nav] <--------> [Sound Hook / Audio API] <--------> [Auth / Token]     |
   |         |                                                             |           |
   |         +-----------------------------+-------------------------------+           |
   |                                       |                                           |
   |        +------------------------------+------------------------------+            |
   |        |                              |                              |            |
   |  [SourcePanel.jsx]           [SnapFeed.jsx]              [BattleArena.jsx]        |
   |  • 1-Click NCERT Demos       • 100dvh Scroll Snap        • 6-Digit Room PIN       |
   |  • 3 Input Modes             • IntersectionObserver      • WebSocket Client       |
   |  • BYO Key Fields            • KaTeX Inline Math         • Speed Leaderboard      |
   |  • Vibe Tone Selector        • PostCard + SvgDiagram     • Champions Podium       |
   |                              • FullScreenQuiz Modal                               |
   +---------------------------------------+-------------------------------------------+
                                           | HTTP / REST & WebSockets
                                           v
   +-----------------------------------------------------------------------------------+
   |                                BACKEND (FastAPI + Python 3.12)                    |
   |                                                                                   |
   |  [Rate Limiter (SlowAPI)] ---> [Sanitizer & Validator] ---> [Auth & Token Check]  |
   |                                                                                   |
   |  +--------------------+   +---------------------+   +--------------------------+  |
   |  |   Core Endpoints   |   |   Crypto Engine     |   |    Battle Manager        |  |
   |  | • /api/generate    |   | • AES-256-GCM       |   | • 15s Authoritative Timer|  |
   |  | • /api/demo-gen    |   | • PBKDF2 Derivation |   | • Host Re-election       |  |
   |  | • /api/upload      |   | • Authenticated Tag |   | • Circular Replay Buffer |  |
   |  | • /api/research    |   +---------------------+   | • /ws/battle/{code}      |  |
   |  +---------+----------+                             +-------------+------------+  |
   |            |                                                      |               |
   +------------+------------------------------------------------------+---------------+
                |                                                      |
                v                                                      v
   +-------------------------+   +-----------------------+   +-------------------------+
   |   AI & Search Layer     |   | Verified Research     |   | Database & Persistence  |
   | • Groq (Llama 3.3 70B)  |   | • 15 Pre-baked Topics |   | • Supabase PostgreSQL   |
   | • Qwen 2.5 72B Fallback |   | • 6 Ready Demo Feeds  |   | • Row Level Security    |
   | • Tavily Search API     |   | • Class 8, 10, 12     |   | • In-Memory Dev Store   |
   +-------------------------+   +-----------------------+   +-------------------------+
```

---

## 5. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, Tailwind CSS |
| **Math Typesetting** | KaTeX 0.16 (`katex`, `react-katex`) with inline `$...$` & block `$$...$$` |
| **Audio & SFX** | Web Audio API, Howler.js (`use-sound`), Procedural Fallbacks |
| **Icons & Animation** | Lucide React, Canvas Confetti |
| **Backend Framework** | FastAPI, Starlette, Uvicorn, Python 3.12 |
| **AI LLM Inference** | Groq Cloud SDK (`llama-3.3-70b-versatile`, `qwen/qwen3.8-27b`) |
| **Grounding & Web Search** | Tavily Python SDK (`tavily-python`) |
| **Cryptography** | Cryptography library (`AES-256-GCM`, PBKDF2-HMAC-SHA256) |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Supabase Auth) |
| **Rate Limiting** | SlowAPI (Token bucket algorithm) |
| **Testing** | Pytest, Pytest-AsyncIO, Requests |

---

## 6. Syllabus Coverage & Verified Research

The repository includes a curated cache of 15 verified NCERT topics in `backend/data/research/` and 6 pre-baked feeds in `backend/data/demo-feeds/`:

| Subject | Class | Chapter & Topic | File Reference |
| :--- | :---: | :--- | :--- |
| **Science** | 10 | Light — Reflection & Refraction | `science-10-light.json` |
| **Science** | 10 | Electricity — Circuits & Ohm's Law | `science-10-electricity.json` |
| **Science** | 10 | Life Processes — Nutrition & Transport | `science-10-life-processes.json` |
| **Science** | 8 | Force and Pressure | `science-8-force-pressure.json` |
| **Science** | 12 | Electromagnetic Induction | `science-12-emi.json` |
| **Maths** | 12 | Parabola & Conic Sections | `maths-12-parabola.json` |
| **Maths** | 10 | Introduction to Trigonometry | `maths-10-trigonometry.json` |
| **Maths** | 10 | Quadratic Equations | `maths-10-quadratic.json` |
| **Maths** | 8 | Linear Equations in One Variable | `maths-8-linear-equations.json` |
| **Maths** | 12 | Integrals & Area Under Curves | `maths-12-integrals.json` |
| **SST** | 10 | Nationalism in India & Dandi March | `sst-10-nationalism-in-india.json` |
| **SST** | 10 | Resources and Development | `sst-10-resources-and-development.json` |
| **SST** | 10 | Power Sharing in Democracy | `sst-10-power-sharing.json` |
| **SST** | 8 | The Indian Constitution | `sst-8-indian-constitution.json` |
| **SST** | 12 | Kinship, Caste and Class | `sst-12-kinship-caste.json` |

---

## 7. Quick Start & Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+ (or Python 3.10+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/aditya/studyrot.git
cd "Study Rot"
```

### 2. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with your API keys:
```ini
PORT=8000
DEMO_MODE=true
RATE_LIMIT_DEMO=10/hour
GROQ_API_KEY=gsk_...
TAVILY_API_KEY=tvly-...
ENCRYPTION_MASTER_KEY=studyrot-super-secret-master-key-32-chars!
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJh...
```

### 3. Install Backend Dependencies & Start Server
```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` (Swagger UI at `/docs`).

### 4. Configure & Start Frontend
Open a new terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 8. Environment Variables Reference

| Variable | Required | Default | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `8000` | Port for FastAPI / Uvicorn server |
| `DEMO_MODE` | No | `true` | Enables 1-click curated NCERT demo generation |
| `RATE_LIMIT_DEMO` | No | `10/hour` | Rate limit for free demo generations per IP |
| `GROQ_API_KEY` | Recommended | `""` | Server-side Groq API key for dynamic generation |
| `TAVILY_API_KEY` | Optional | `""` | Tavily search API key for syllabus grounding |
| `ENCRYPTION_MASTER_KEY` | Recommended | Autogenerated | Salt/Key for AES-256-GCM BYO key encryption |
| `SUPABASE_URL` | Optional | `""` | Supabase instance URL for user persistence |
| `SUPABASE_ANON_KEY` | Optional | `""` | Supabase anonymous API key |
| `VITE_API_URL` | No | `http://localhost:8000` | Backend API base URL for frontend client |

---

## 9. Running Tests

### Backend Automated Test Suite (Pytest)
The test suite covers endpoints, security sanitization, quiz integrity, schema validation, crypto roundtrips, research cache, protected routes, and battle lifecycle.
```bash
cd backend
pytest tests/test_endpoints.py -v
```
**Result**: `11 passed in ~15s (100% pass rate)`.

### Frontend Build Verification
Verify production compilation, TypeScript/JSX checks, and KaTeX bundle assets:
```bash
cd frontend
npm run build
```

### Smoke Test Scripts
Verify running server endpoints:
- **Bash / Linux / macOS**:
  ```bash
  bash scripts/smoke.sh http://localhost:8000
  ```
- **Windows PowerShell**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/smoke.ps1 -HostUrl http://localhost:8000
  ```

---

## 10. Classroom Battle Mode Specifications

Classroom Battle is an interactive multiplayer battle arena designed for CBSE teachers and peer study groups:

1. **Room PIN**: 6-digit cryptographic PIN generated via random uniform integer distribution `[100000, 999999]`.
2. **Synchronized Timer**: 15.0-second server-authoritative clock with broadcast updates via WebSocket.
3. **Scoring Model**:
   $$\text{Points} = 500 + \text{round}\left(\frac{t_{\text{remaining}}}{15} \times 500\right)$$
   Speed rewards quick thinking while preserving a 500-point accuracy base.
4. **Resilience & State Recovery**:
   - 10-message circular replay buffer allows players with spotty Wi-Fi to reconnect without missing live state.
   - Host auto-promotion selects the next connected peer if the teacher or room creator disconnects.
   - Inactive rooms automatically garbage-collect after 30 minutes.

---

## 11. Content Deduplication & Validation Guarantee

To eliminate repetitive AI responses and inaccurate questions, StudyRot enforces three programmatic safety gates:

1. **Jaccard Word Similarity Gate**:
   Computes word intersection over union between `post.body` and `post.analogy`/`post.exam_tip`. If similarity $\ge 70\%$, the redundant callout is automatically suppressed in the UI.
2. **Exact MCQ Answer Validation**:
   Backend Pydantic validators verify that `quiz.answer` exactly equals one of the 4 entries in `quiz.options`, with no duplicate options allowed.
3. **KaTeX Formula Enforcement**:
   Mathematical formulas and chemical reactions are required to be formatted in LaTeX notation (`$...$` or `$$...$$`), rendering sharply via KaTeX fonts.

---

## 12. Security & Data Protection

- **Authenticated Encryption**: Keys stored in the database are encrypted using `AES-256-GCM` with a 96-bit nonce and 128-bit authentication tag. Plaintext keys never hit persistent logs or database rows.
- **XSS & SVG Sanitization**: All AI-generated and SVG diagrams pass through an SVG sanitizer that strips scripts, external URL loads, and malicious handler attributes (`onload`, `onerror`).
- **Safe Environment Inspection**: The `/api/health` route inspects keys via `get_keys_present()`, exposing boolean status flags rather than raw tokens.

---

## 13. API Endpoint Reference

| Method | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Public | System status, presence of Groq/Tavily keys |
| `GET` | `/api/research/topics` | Public | List of 15 verified NCERT cached topics |
| `POST` | `/api/demo-generate` | Public (Rate-limited) | 1-click generation from pre-baked topic cache |
| `POST` | `/api/generate` | BYO Key / Auth | Dynamic feed synthesis from Groq & Tavily |
| `POST` | `/api/upload` | BYO Key / Auth | Multipart chapter upload (PDF, DOCX, TXT) |
| `POST` | `/api/keys` | Optional | Save user Groq/Tavily keys (AES-256 encrypted) |
| `GET` | `/api/keys/status` | Optional | Query whether user has encrypted keys on file |
| `POST` | `/api/save-feed` | Optional | Save feed to user study library |
| `GET` | `/api/my-feeds` | Optional | Retrieve saved feeds |
| `DELETE`| `/api/feed/{id}` | Optional | Delete saved feed |
| `POST` | `/api/battle/create` | Public | Create classroom battle room |
| `POST` | `/api/battle/join` | Public | Validate room PIN and join arena |
| `WS` | `/ws/battle/{code}` | Public | Real-time WebSocket connection for battle arena |

---

## 14. Deployment

### Docker (Unified Container)
The multi-stage `Dockerfile` compiles the Vite frontend and serves both backend API and static SPA assets from a single container:
```bash
docker build -t studyrot:latest .
docker run -p 8000:8000 --env-file backend/.env studyrot:latest
```

### Railway
Deploy with one click using the included `railway.json`:
- Builder: Dockerfile
- Healthcheck: `/api/health`

### Render
Connect your repository and deploy with `render.yaml`:
- Blueprint type: Web Service (Docker)
- Port: `8000`

### Vercel
Deploy the frontend directly with `vercel.json`:
- Framework: Vite
- Build: `npm run build`
- Output: `dist`

---

## 15. Repository Structure

```
Study Rot/
├── backend/
│   ├── data/
│   │   ├── demo-feeds/         # 6 Pre-baked 14-post NCERT feeds
│   │   └── research/           # 15 Verified curriculum topics
│   ├── supabase/
│   │   └── migrations/         # PostgreSQL schema & RLS policies
│   ├── tests/
│   │   └── test_endpoints.py   # Comprehensive Pytest suite
│   ├── auth.py                 # Supabase JWT authentication
│   ├── battle.py               # WebSocket multiplayer battle state machine
│   ├── config.py               # Safe environment loader & key presence checker
│   ├── crypto.py               # AES-256-GCM key derivation & encryption
│   ├── db.py                   # Supabase client wrapper & memory store
│   ├── llm.py                  # Groq inference client & prompt orchestration
│   ├── main.py                 # FastAPI application & route controllers
│   ├── sanitizer.py            # SVG & text sanitization
│   ├── schemas.py              # Pydantic data contracts & validation
│   └── search.py               # Tavily NCERT grounding integration
├── frontend/
│   ├── public/
│   │   ├── demo-feeds/         # Pre-baked feeds for instant offline demo
│   │   └── sounds/             # Web Audio sound clips (tick, win, correct, etc.)
│   ├── src/
│   │   ├── components/
│   │   │   ├── battle/         # BattleLobby, Question, Reveal, Podium
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── FullScreenQuiz.jsx
│   │   │   ├── Header.jsx      # Two-row responsive non-overlapping header
│   │   │   ├── MathText.jsx    # KaTeX LaTeX renderer
│   │   │   ├── PostCard.jsx    # Feed card with animated diagram
│   │   │   ├── Quiz.jsx        # Timed MCQ with pure white option styling
│   │   │   ├── SnapFeed.jsx    # 100dvh snap-scroll container
│   │   │   └── SourcePanel.jsx # 560px card with 2-col quick demo cards
│   │   ├── pages/
│   │   │   ├── Battle.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Keys.jsx
│   │   │   └── Saved.jsx
│   │   ├── App.jsx             # React Router application root
│   │   ├── api.js              # API client with fallback cascade
│   │   ├── styles.css          # Design tokens & KaTeX font styles
│   │   └── sampleData.js       # Curated CBSE offline feed dataset
│   ├── package.json
│   └── vite.config.js
├── submission/
│   ├── demo-script.md          # 3-minute hackathon presentation script
│   ├── judging-notes.md        # Technical rubrics and evaluation checklist
│   ├── pitch-deck.md           # Presentation slide content
│   └── README.md               # Submission directory index
├── scripts/
│   ├── smoke.sh                # Bash smoke testing suite
│   └── smoke.ps1               # PowerShell smoke testing suite
├── Dockerfile                  # Multi-stage production container
├── railway.json                # Railway deployment manifest
├── render.yaml                 # Render blueprint manifest
├── vercel.json                 # Vercel deployment manifest
├── CONTRIBUTING.md             # Developer guidelines
├── DEVLOG.md                   # Engineering trajectory log
├── SUBMISSION_NOTES.md         # Final hackathon submission notes
└── LICENSE                     # MIT License
```

---

## 16. Contributing & Roadmap

We welcome contributions from educators, students, and open-source engineers:
- **Vernacular Languages**: Adding Hindi, Tamil, and Telugu NCERT translations.
- **Offline PWA**: Service worker caching for 100% offline bus/train study mode.
- **Teacher Dashboard**: Classroom assignment tracking and analytics.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines.

---

## 17. License & Acknowledgments

StudyRot is licensed under the [MIT License](LICENSE).

Developed for the **Nerdy AI Hackathon** ([hackathon.nerdy.com](https://hackathon.nerdy.com)). NCERT textbooks and curriculum guidelines are copyright National Council of Educational Research and Training, New Delhi, India.
