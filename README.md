# StudyRot — NCERT Study Feeds, Spaced Repetition & Classroom Battles

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Groq](https://img.shields.io/badge/LLM-Groq_Llama_3.3_70B-F55036?logo=groq&logoColor=white)](https://groq.com)
[![Tavily](https://img.shields.io/badge/Search-Tavily_AI-4F46E5)](https://tavily.com)
[![Pytest](https://img.shields.io/badge/Tests-33%2F33_Passing-success)](backend/tests)
[![Playwright](https://img.shields.io/badge/E2E-Playwright_Passing-green)](scratch)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Turn dense CBSE Class 8–12 NCERT textbooks into an addictive, swipeable study feed with animated vector diagrams, timed board-exam MCQs, FSRS-6 exam-date-aware spaced repetition, and real-time multiplayer & solo AI bot battles.**

---

## 1. Executive Summary

Students spend hours doomscrolling short-form video algorithms designed for distraction. **StudyRot** reclaims those cognitive habit loops by transforming dry NCERT chapters into a high-engagement, TikTok-style snap-scroll feed. Every swipe delivers structured CBSE curriculum concepts:
- **Zero Dummy Data Guarantee**: Real user data only. Likes start at 0 and increment only on real taps; comments start empty; bot players are transparently labeled with `Bot ` prefixes and 🤖 BOT badges.
- **Working Share & Deep Links**: Every generated feed receives a collision-resistant 6-character short code (`/s/:shortCode`) with instant deep linking to specific cards (`/s/:shortCode/:index`), view counters, content moderation, and 30-day TTL cleanup.
- **Exam-Date-Aware Spaced Repetition (FSRS-6)**: Pure-Python Free Spaced Repetition Scheduler v6 engine ($R(t) = (1 + \frac{1}{9}\frac{t}{S})^{-1}$) calibrated to board exam dates, prioritizing cards with the highest marginal retrievability gain and providing LLM-driven error pattern diagnosis.
- **Solo Battle Arena vs AI Bots**: Challenge 3 simulated bot opponents (`Bot Aditya`, `Bot Priya`, `Bot Rohan`) across Easy, Medium, and Hard difficulty curves with 15s timers, millisecond speed scoring, live commentary, and champion podiums.
- **Visual Retention**: Handcrafted, animated SVGs and ray diagrams for every scientific concept.
- **Active Recall**: Timed board-exam MCQs with Web Audio haptics and KaTeX LaTeX rendering.
- **Privacy First**: BYO Groq/Tavily API keys encrypted at rest using AES-256-GCM authenticated encryption.

---

## 2. Live Demo & Links

- 🌐 **Live Web Application**: [https://study-rot-red.vercel.app/](https://study-rot-red.vercel.app/)
- 📺 **Full Video Walkthrough**: [YOUTUBE_LINK]
- 📑 **Hackathon Pitch Deck**: [`submission/pitch-deck.pdf`](submission/pitch-deck.pdf) (Slide source: [`submission/pitch-deck.md`](submission/pitch-deck.md))
- ⏱️ **Presentation Script**: [`submission/demo-script.md`](submission/demo-script.md)

---

## 3. Core Features

### 📱 Snap-Scroll Vertical Feed
- Strict `100dvh` full-height card viewport with CSS `scroll-snap-type: y mandatory` and `overscroll-behavior: contain`.
- IntersectionObserver-driven lazy rendering mounting only adjacent cards to guarantee 60fps scrolling on mobile devices.
- Keyboard navigation (Arrow Up / Arrow Down), dynamic vertical dot indicator, and top position pill.
- **Restore Previous Feed**: Returns users to their active study feed upon reopening the browser.

### 🔗 Working Share & Deep Links
- **Unique Short Codes**: 6-character short codes using uppercase alphanumeric characters excluding ambiguous glyphs (`0`, `O`, `1`, `I`), guaranteeing over 1 billion combinations.
- **Card-Level Deep Linking**: Links support direct navigation to individual cards (`/s/:shortCode/:index`), auto-scrolling to the target card with an arriving glowing indicator ring.
- **Auto-Persist**: Every generation request (`/api/generate`, `/api/demo-generate`, `/api/upload`) automatically registers a shareable link.
- **Content Moderation & Sanitization**: Banned words filter and strict SVG sanitizer stripping script tags and event handlers.
- **Rate-Limiting & Lifecycle**: Rate-limited to 3 shares/hour for guests and 20/hour for signed-in users. Shared feeds expire after 30 days and are automatically cleaned up by a periodic background task.

### 🧠 Exam-Date-Aware Spaced Repetition (FSRS-6)
- **FSRS-6 Scheduler**: Pure-Python implementation of the state-of-the-art Free Spaced Repetition Scheduler formula:
  $$R(t, S) = \left(1 + \frac{1}{9} \frac{t}{S}\right)^{-1}$$
- **Exam Date Calibration**: Onboarding prompt captures the student's board exam date. Queue ordering is prioritized by marginal retrievability gain:
  $$\Delta R = R_{\text{after}} - R(t)$$
  ensuring students review the concepts that yield maximum retention on exam day.
- **Cutoff Dates**: Automatically calculates and displays the exact date after which new concepts will decay below 70% before the exam.
- **Error Pattern Classifier & Weakness Diagnostic**: When a student gets 10+ questions wrong, an automated diagnostic report groups mistakes by root cause (Formula confusion, Sign convention errors, Conceptual misapplication, or Careless reading) with targeted remediation advice.

### ⚔️ Solo Battle vs AI Bots & Classroom Arena
- **Solo Battle vs AI Bots**: Test CBSE speed and mastery against 3 simulated opponents in real time.
- **Transparent Bot Identity**: Bot players are clearly labeled with `Bot ` prefixes (e.g., `Bot Aditya`, `Bot Priya`, `Bot Rohan`) and a distinct 🤖 BOT badge.
- **Speed Scoring**: Millisecond-accurate scoring model:
  $$\text{Points} = 1000 - \left(\frac{\text{time\_ms}}{15000}\right) \times 500$$
  yielding 500–1000 points for correct answers and 0 for wrong answers or timeouts.
- **Dynamic Difficulty**: Easy (55% accuracy, 8–12s delay), Medium (75% accuracy, 4–7s delay), and Hard (90% accuracy, 2–5s delay).
- **Staggered Reveals & Live Commentary**: Bots submit answers with realistic delays, triggering live standings updates, emoji reactions (🔥/💀), and victory podiums.
- **Classroom Multiplayer Arena**: 6-digit PIN room codes with server-authoritative WebSocket clocks, circular replay buffers, and dynamic host promotion.

### 🎭 Ephemeral Sandbox Demos & Guided Tour
- **Zero Dummy Data**: No hardcoded likes, pre-baked demo feed directories, or seeded comments exist in the codebase.
- **Sandbox State Isolation**: Guests can try all core features (Feed, Daily Review, Solo Battle) in an ephemeral sandbox without modifying real user accounts. Sandbox feeds clearly display a warning banner, and share actions are gracefully restricted.
- **Interactive 5-Step Guided Tour**: Spotlight tour explaining the Feed, Quizzes, Animated Diagrams, Exam-Date Review, and Solo Battles, complete with explicit demo card labels ("DEMO POST — your own feed will look like this").

### 📐 Animated SVG Diagrams & LaTeX Formulas
- Embedded vector graphics: Optics ray tracings with normal lines, Snell's law refraction, Ohm's law circuits, conic sections (parabolas, focus, directrix), and historical timelines.
- KaTeX mathematical and chemical typesetting supporting inline `$...$` and display `$$...$$` notations.

### 🔒 BYO Keys with AES-256-GCM Authenticated Encryption
- Bring-Your-Own Groq (`gsk_...`) and Tavily (`tvly-...`) API keys.
- Client keys are encrypted with authenticated AES-256-GCM using PBKDF2/SHA-256 derived keys before persistence in Supabase.

---

## 4. System Architecture

```
                                  STUDYROT ARCHITECTURE
                                  
   +-----------------------------------------------------------------------------------+
   |                                FRONTEND (React 18 + Vite)                         |
   |                                                                                   |
   |  [Header & Nav] <--------> [Sound Hook / Howler] <-------> [Review & Sandbox Ctx] |
   |         |                                                             |           |
   |         +-----------------------------+-------------------------------+           |
   |                                       |                                           |
   |        +------------------------------+------------------------------+            |
   |        |                              |                              |            |
   |  [SourcePanel.jsx]           [SnapFeed.jsx]              [SoloBattleArena.jsx]    |
   |  • 3 Input Modes             • 100dvh Scroll Snap        • Labeled Bot Opponents  |
   |  • BYO Key Encrypted Fields  • Arrival Glow Indicator    • Speed Scoring Model    |
   |  • Guided Tour Launcher      • 0 Initial Likes           • Live Standings Table   |
   |  • Feed Sandbox Trigger      • Empty State Comments      • Victory Podium         |
   |                              • Share Deep Link Modal                              |
   +---------------------------------------+-------------------------------------------+
                                           | HTTP / REST & WebSockets
                                           v
   +-----------------------------------------------------------------------------------+
   |                                BACKEND (FastAPI + Python 3.12)                    |
   |                                                                                   |
   |  [Rate Limiter (SlowAPI)] ---> [Sanitizer & Moderator] ---> [Auth & Token Check]  |
   |                                                                                   |
   |  +--------------------+   +---------------------+   +--------------------------+  |
   |  |   Core Endpoints   |   |   FSRS-6 Engine     |   |   Solo Battle Engine     |  |
   |  | • /api/generate    |   | • Retrievability R  |   | • Seeded Bot Simulation  |  |
   |  | • /api/demo-gen    |   | • Marginal Gain Sort|   | • Speed Scoring (1000)   |  |
   |  | • /api/upload      |   | • Cutoff Dates      |   | • Realistic Latency      |  |
   |  | • /api/s/:code     |   | • Weakness Report   |   | • Emoji Reactions        |  |
   |  +---------+----------+   +----------+----------+   +-------------+------------+  |
   |            |                         |                            |               |
   +------------+-------------------------+----------------------------+---------------+
                |                         |                            |
                v                         v                            v
   +-------------------------+   +-----------------------+   +-------------------------+
   |   AI & Search Layer     |   | Verified Research     |   | Database & Persistence  |
   | • Groq (Llama 3.3 70B)  |   | • 15 Curriculum Topics|   | • Supabase PostgreSQL   |
   | • Qwen 2.5 72B Fallback |   | • Grounded Context    |   | • Shared Feeds (30d TTL)|
   | • Tavily Search API     |   | • Banned Words Filter |   | • In-Memory Fallback    |
   +-------------------------+   +-----------------------+   +-------------------------+
```

---

## 5. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, Tailwind CSS |
| **Math Typesetting** | KaTeX 0.16 (`katex`, `react-katex`) with inline `$...$` & block `$$...$$` |
| **Audio & SFX** | Web Audio API, Howler.js (`howler`), Procedural Audio Fallbacks |
| **Icons & Animation** | Lucide React, Canvas Confetti |
| **Backend Framework** | FastAPI, Starlette, Uvicorn, Python 3.12 |
| **Spaced Repetition** | Pure Python FSRS-6 scheduler engine |
| **AI LLM Inference** | Groq Cloud SDK (`llama-3.3-70b-versatile`, `qwen/qwen3.8-27b`) |
| **Grounding & Web Search** | Tavily Python SDK (`tavily-python`) |
| **Cryptography** | Python Cryptography library (`AES-256-GCM`, PBKDF2-HMAC-SHA256) |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Supabase Auth) |
| **Rate Limiting** | SlowAPI (Token bucket algorithm) |
| **Testing** | Pytest, Pytest-AsyncIO, Playwright E2E |

---

## 6. Real User Data Policy

StudyRot strictly enforces a **Real User Data Only** principle:
1. **Zero Dummy Feeds**: No static or pre-baked demo feeds are used in place of real generation. All content is generated dynamically or accessed through verified curriculum research.
2. **True Engagement Counters**: Likes start strictly at 0 and only increment on verified user taps. Feed view counts start at 0 and only increment on real web requests.
3. **Empty Comments State**: No synthetic "StudyBuddy" or AI-seeded comments exist. Comment sheets display: *"No comments yet. Be the first."*
4. **Transparent Bot Identity**: AI opponents in Solo Battle are named with `Bot ` prefixes and display a 🤖 BOT badge so students always know they are practicing against AI simulations.
5. **State-Isolated Sandboxes**: Guest exploration takes place in ephemeral sandboxes that never pollute user account databases.

---

## 7. Quick Start & Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
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
Edit `backend/.env` with your configuration:
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
py -3.12 -m pip install -r requirements.txt
py -3.12 -m uvicorn main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` (Swagger UI at `/docs`).

### 4. Configure & Start Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 8. Running Tests

### Backend Test Suite (33/33 Pytest Tests)
The comprehensive test suite covers all endpoints, security sanitization, quiz integrity, dummy data absence, FSRS-6 spaced repetition, share links, and solo bot battle mechanics:
```bash
py -3.12 -m pytest backend/tests -v
```
**Result**: `33 passed in ~7s (100% pass rate)`.

Test modules include:
- `backend/tests/test_endpoints.py`: Core endpoints, error envelopes, crypto roundtrips, and WebSocket battle.
- `backend/tests/test_no_dummy_data.py`: Validates zero prebaked demo feed directories, zero seeded comments, zero fake like counts, and clean environment flags.
- `backend/tests/test_share.py`: Short code entropy, deep link routing, XSS sanitization, content moderation, and store fallbacks.
- `backend/tests/test_review.py`: FSRS-6 retrievability decay, stability updates, cutoff calculations, LLM error classifier, and weakness report generation.
- `backend/tests/test_solo_battle.py`: Speed scoring formula, bot naming and badge labeling, deterministic simulation, and battle API flow.

### End-to-End Browser Testing (Playwright)
Full automated browser test verifying Home empty states, guided tour modal, sandbox feed, solo battle arena with labeled bots, and spaced repetition review flow:
```bash
py -3.12 scratch/test_e2e_browser.py
```
**Result**: `ALL E2E PLAYWRIGHT TESTS PASSED SUCCESSFULLY`.

### Frontend Production Build Verification
Verify production compilation and bundle budgets:
```bash
cd frontend
npm run build
```
**Result**: `✓ built in ~8s. Gzipped JS bundle is 249 kB (well under 500 kB budget)`.

---

## 9. API Endpoint Reference

| Method | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Public | System status and key presence flags |
| `GET` | `/api/research/topics` | Public | Curated list of 15 verified NCERT topics |
| `POST` | `/api/demo-generate` | Public (Rate-limited) | 1-click generation with auto-generated share link |
| `POST` | `/api/generate` | BYO Key / Auth | Dynamic feed synthesis from Groq & Tavily |
| `POST` | `/api/upload` | BYO Key / Auth | Multipart chapter upload (PDF, DOCX, TXT) |
| `GET` | `/api/s/{short_code}` | Public | Retrieve shared feed by 6-character short code |
| `GET` | `/api/review/queue` | Optional | Get personalized FSRS-6 review queue |
| `POST` | `/api/review/rate` | Optional | Record FSRS rating (1=Forgot, 2=Hard, 3=Good, 4=Easy) |
| `POST` | `/api/review/exam-date`| Optional | Set student's board exam date for calibration |
| `GET` | `/api/review/weakness` | Optional | Generate weakness diagnosis after 10+ wrong answers |
| `POST` | `/api/battle/solo/create` | Public | Initialize 1-player battle session against 3 bots |
| `POST` | `/api/battle/solo/submit` | Public | Submit answer with millisecond speed scoring |
| `GET` | `/api/battle/solo/summary/{id}` | Public | Fetch final leaderboard and champion podium |
| `POST` | `/api/battle/create` | Public | Create multiplayer classroom room |
| `POST` | `/api/battle/join` | Public | Validate room PIN and join arena |
| `WS` | `/ws/battle/{code}` | Public | WebSocket for real-time multiplayer battle arena |

---

## 10. Repository Structure

```
Study Rot/
├── backend/
│   ├── data/
│   │   ├── banned_words.txt    # Content moderation filter
│   │   └── research/           # 15 Verified curriculum topics
│   ├── routes/
│   │   ├── battle.py           # Solo battle API endpoints
│   │   ├── feeds.py            # Shared feeds API endpoints
│   │   └── review.py           # FSRS-6 spaced repetition endpoints
│   ├── supabase/
│   │   └── migrations/         # PostgreSQL schema, shared_feeds & review tables
│   ├── tests/
│   │   ├── test_endpoints.py   # Core API & crypto test suite
│   │   ├── test_no_dummy_data.py # Dummy data elimination suite
│   │   ├── test_review.py      # FSRS-6 algorithm & cutoff tests
│   │   ├── test_share.py       # Deep linking & moderation tests
│   │   └── test_solo_battle.py # Bot simulation & speed scoring tests
│   ├── utils/
│   │   └── codes.py            # 6-character short code generator
│   ├── auth.py                 # Supabase JWT authentication
│   ├── battle.py               # WebSocket multiplayer battle state machine
│   ├── config.py               # Safe environment loader
│   ├── crypto.py               # AES-256-GCM BYO key encryption
│   ├── db.py                   # Supabase & in-memory shared feed stores
│   ├── llm.py                  # Groq inference client & prompt orchestration
│   ├── main.py                 # FastAPI application & lifespan background cleanup
│   ├── review.py               # Pure-Python FSRS-6 engine & error classifier
│   ├── sanitizer.py            # SVG & text sanitization
│   ├── schemas.py              # Pydantic data contracts
│   ├── search.py               # Tavily NCERT grounding integration
│   └── solo_battle.py          # Seeded bot simulation & speed scoring
├── frontend/
│   ├── public/
│   │   └── sounds/             # Web Audio sound clips (tick, win, correct, etc.)
│   ├── src/
│   │   ├── components/
│   │   │   ├── BattlePodium.jsx
│   │   │   ├── BattleSummary.jsx
│   │   │   ├── BotBadge.jsx    # 🤖 BOT identity chip
│   │   │   ├── CommentSheet.jsx # Clean empty state comments
│   │   │   ├── DailyReviewCard.jsx # Exam-date aware daily review card
│   │   │   ├── DemoBanner.jsx  # Ephemeral sandbox banner
│   │   │   ├── EmptyState.jsx  # Actionable empty state card
│   │   │   ├── ExamDatePrompt.jsx # Exam date selector modal
│   │   │   ├── FullScreenQuiz.jsx
│   │   │   ├── Header.jsx      # Non-overlapping responsive header
│   │   │   ├── InteractionBar.jsx # Native share & like triggers
│   │   │   ├── MathText.jsx    # KaTeX LaTeX renderer
│   │   │   ├── PostCard.jsx    # Feed card with animated diagram
│   │   │   ├── Quiz.jsx        # Timed MCQ card
│   │   │   ├── ReviewCard.jsx  # FSRS flashcard with 4-button ratings
│   │   │   ├── SnapFeed.jsx    # 100dvh snap feed with arrival glow ring
│   │   │   ├── SoloBattleArena.jsx # Question arena with 15s timer
│   │   │   ├── SoloBattleLobby.jsx # Matchup lobby with 3 labeled bots
│   │   │   ├── SourcePanel.jsx # Input configuration panel
│   │   │   ├── Tour.jsx        # 5-step guided spotlight tour
│   │   │   └── WeaknessReport.jsx # 10+ error diagnostic report
│   │   ├── contexts/
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── ReviewProvider.jsx
│   │   │   ├── SandboxProvider.jsx # Ephemeral sandbox state isolation
│   │   │   └── ToastProvider.jsx
│   │   ├── hooks/
│   │   │   ├── useReviewQueue.js
│   │   │   ├── useSoloBattle.js
│   │   │   └── useTour.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Review.jsx      # Spaced repetition review flow
│   │   │   ├── SharedFeed.jsx  # /s/:shortCode deep link route
│   │   │   └── SoloBattle.jsx  # /battle/solo arena route
│   │   ├── utils/
│   │   │   └── emptyStates.js  # Centralized empty state copy
│   │   ├── App.jsx             # React Router root
│   │   ├── api.js              # Client API wrapper
│   │   └── styles.css          # Design tokens, arrival rings, KaTeX
│   ├── package.json
│   └── vite.config.js
├── submission/
│   ├── demo-script.md          # 3-minute hackathon presentation script
│   ├── judging-notes.md        # Technical rubrics and evaluation checklist
│   ├── pitch-deck.md           # Presentation slide content
│   └── README.md               # Submission directory index
├── Dockerfile                  # Multi-stage production container
├── DEVLOG.md                   # Engineering trajectory log
├── SUBMISSION_NOTES.md         # Final hackathon submission notes
└── LICENSE                     # MIT License
```

---

## 11. License & Acknowledgments

StudyRot is licensed under the [MIT License](LICENSE).

Developed for the **Nerdy AI Hackathon** ([hackathon.nerdy.com](https://hackathon.nerdy.com)). NCERT textbooks and curriculum guidelines are copyright National Council of Educational Research and Training, New Delhi, India.
