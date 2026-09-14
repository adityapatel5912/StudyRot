# StudyRot — NCERT Study Feeds, Voice Tutor, Spaced Repetition & Classroom Battles

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Groq](https://img.shields.io/badge/LLM-Groq_Llama_3.3_70B-F55036?logo=groq&logoColor=white)](https://groq.com)
[![AssemblyAI](https://img.shields.io/badge/STT-AssemblyAI_Universal_3.5_Pro-0066FF)](https://www.assemblyai.com)
[![FishAudio](https://img.shields.io/badge/TTS-Fish_Audio_S2.1_Pro-black)](https://fish.audio)
[![NVIDIA](https://img.shields.io/badge/Vision_&_3D-NVIDIA_NIM_TRELLIS-76B900?logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![Pytest](https://img.shields.io/badge/Tests-59%2F59_Passing-success)](backend/tests)
[![Playwright](https://img.shields.io/badge/E2E-Playwright_Passing-green)](scratch)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Turn dense CBSE Class 8–12 NCERT textbooks into an addictive, swipeable study feed with animated vector diagrams, timed board-exam MCQs, FSRS-6 exam-date-aware spaced repetition, a real-time Voice & 3D Doubt Solver, and multiplayer & solo AI bot battles.**

---

## 1. Strategic Positioning & The Four Pillars

StudyRot does NOT build flashcards or mind maps. Our architectural moat rests on four pillars:
1. **Retention Science** — Pure Python FSRS-6 Free Spaced Repetition calibrated to the student's exact board exam date ($R(t) = (1 + \frac{1}{9}\frac{t}{S})^{-1}$), prioritizing cards by marginal retrievability gain.
2. **Voice-First Multi-Modal Doubt Solving** — Speak doubts in Hinglish or English via AssemblyAI Universal-3.5 Pro; receive spoken voice explanations via Fish Audio S2.1 Pro with LaTeX formula-to-speech conversion.
3. **Multi-Modal Learning & 3D Simulations** — Interactive ray optics, projectile trajectories, unit circles, pure SVG graphing (zero external charting dependencies, 270 kB gzipped bundle), and NVIDIA NIM VLM/OCR/TRELLIS integration.
4. **Competitive Classroom Battles** — Real-time multiplayer arenas and solo practice against 3 clearly labeled AI bots (`Bot Aditya`, `Bot Priya`, `Bot Rohan` with 🤖 BOT badges) with 15s clocks, millisecond speed scoring, and live standings.

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

### 🎙️ AI Voice & Multi-Modal Doubt-Solving Tutor
- **Strict Persona Identity**: Always responds and guides as the **"StudyRot Tutor"** for CBSE Class 8–12 Science, Maths, and Social Studies.
- **Speech-to-Text (STT)**: Built on **AssemblyAI Universal-3.5 Pro** with CBSE domain vocabulary prompting (`backend/stt.py`), handling accented English, Hinglish, and scientific terms.
- **Text-to-Speech (TTS)**: Built on **Fish Audio S2.1 Pro** via OpenRouter (`backend/tts.py`), featuring a specialized LaTeX-to-spoken-English converter (`backend/tts_latex.py`) translating equations into natural teacher cadence (e.g. $\frac{1}{v} + \frac{1}{u} = \frac{1}{f}$ $\to$ *"one over v plus one over u equals one over f"*), with seamless browser `window.speechSynthesis` fallback.
- **Interactive 3D Simulations & Concept Lab**: Instant prebuilt and dynamic simulations (`frontend/src/components/Simulation3D.jsx`) for Ray Optics ($u, v, f, m$ concave mirror), Projectile Motion ($\theta, u, H, R$), and Trigonometric Unit Circle ($\sin, \cos, \theta$).
- **Pure SVG Graph Renderer**: Zero external charting libraries; dynamically renders coordinate axes, tick marks, plotted curves, and hover coordinates in lightweight pure SVG (< 275 kB total bundle).
- **Multi-Modal Vision & OCR**: Accepts textbook photos, diagrams, and notes via **NVIDIA NIM** (Vision: `meta/llama-3.2-11b-vision-instruct`, OCR: `nvidia/nemotron-ocr-v2`, 3D: `microsoft/trellis`).
- **Step-by-Step Derivations & Board Traps**: Every solution breaks derivations into numbered steps with KaTeX equations, an explicit Final Answer card, Common CBSE Mistakes warnings, and follow-up practice MCQs.
- **Live Talk Mode**: Full-screen conversational voice interface (`frontend/src/components/TalkMode.jsx`) with a central 200px pulsing voice orb, live audio level analysis, and bidirectional streaming over WebSockets (`/ws/talk`).
- **Everywhere Integration**: Launch the tutor anywhere from the floating **Ask Tutor FAB**, the header "Voice Tutor" button, the post card "Ask Tutor about this" chip, or the quiz "Explain with 3D Simulation" action.

### 📝 Full Mock Test Mode (`/mock`)
- **Official CBSE Blueprints & Difficulty Balancing**: 11 paper templates covering Class 10 (Science, Maths, SST) and Class 12 (Physics, Chemistry, Maths, Biology, History, Political Science, Geography, Economics) adhering to a 40% Easy, 40% Medium, 20% Hard difficulty distribution.
- **Authentic PYQ Seed Bank**: 3 years of authentic CBSE Board Previous Year Questions (2022–2024) with official marking scheme rationales.
- **Interactive Testing**: Full countdown timer, auto-saving every 30 seconds, KaTeX formula editor, and pure SVG clickable India Map skill question.
- **Auto-Grading & Spaced Repetition Integration**: Immediate scoring against official marking schemes; incorrect concepts automatically sync into the student's FSRS spaced repetition review queue.

### 👥 Collaborative Study Rooms (`/room`)
- **Synchronized Group Study**: 2–8 student rooms over real-time WebSockets (`/ws/room/{code}`).
- **Sync vs Free Scrolling**: Host can lock students to a synchronized lesson or permit independent free scrolling.
- **Integrated AI Interventions**: Moderated chat with `@ai` mention trigger, providing grounded NCERT tutoring on demand within the conversation.
- **3-Question Group Quizzes**: Server-authoritative 20-second countdown, real-time participant choices reveal, and celebratory winner confetti.

### 📸 Check My Work — Photo Feedback (`/check-work`)
- **Handwritten Solution Analyzer**: Multi-model vision pipeline (NVIDIA NIM OCR + Groq reasoning) parsing student handwritten photos step-by-step.
- **Error Pinpointing**: Color-coded step breakdown (Emerald for valid steps, Crimson with explanation for mistakes).
- **Misconception Classifier**: Automatically categorizes errors under `sign_error`, `formula_confusion`, `calculation_error`, or `interpretation_error` and recommends targeted drills.
- **BYOK Security & 1-Click Demo**: Strict user API key isolation with instant 1-click sample numerical demo requiring zero API keys.

### 📅 Adaptive Study Pathway Generator (`/plan` and `/plan/today`)
- **7-Day Dynamic Calendar**: Automatically schedules daily review, drill, read, and mock sessions weighted by FSRS retention stability, error frequency, CBSE chapter weightage, and upcoming exam countdown.
- **Subject Balance Guarantee**: Enforces that no single subject can consume more than 50% of the student's weekly study budget.
- **Mid-Week Roll-Forward & Nightly Sync**: Missed priority sessions automatically roll forward into the active day; background APScheduler rebalances weekly plans nightly at 02:00 IST.

### 📐 Animated SVG Diagrams & LaTeX Formulas
- Embedded vector graphics: Optics ray tracings with normal lines, Snell's law refraction, Ohm's law circuits, conic sections (parabolas, focus, directrix), and historical timelines.
- KaTeX mathematical and chemical typesetting supporting inline `$...$` and display `$$...$$` notations.

### 🔒 BYO Keys with AES-256-GCM Authenticated Encryption
- Bring-Your-Own Groq (`gsk_...`), Tavily (`tvly-...`), AssemblyAI, OpenRouter, and NVIDIA NIM API keys.
- Client keys are encrypted with authenticated AES-256-GCM using PBKDF2/SHA-256 derived keys before persistence in Supabase.
- Strict isolation ensures developer server keys are never consumed by user generation requests.

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

### Backend Test Suite (44/44 Pytest Tests)
The comprehensive test suite covers all endpoints, security sanitization, quiz integrity, dummy data absence, FSRS-6 spaced repetition, share links, solo bot battle mechanics, AssemblyAI STT, Fish Audio TTS with LaTeX math conversion, and multi-modal doubt solving:
```bash
py -3.12 -m pytest backend/tests -v
```
**Result**: `44 passed in ~10s (100% pass rate)`.

Test modules include:
- `backend/tests/test_endpoints.py`: Core endpoints, error envelopes, crypto roundtrips, and WebSocket battle.
- `backend/tests/test_no_dummy_data.py`: Validates zero prebaked demo feed directories, zero seeded comments, zero fake like counts, and clean environment flags.
- `backend/tests/test_share.py`: Short code entropy, deep link routing, XSS sanitization, content moderation, and store fallbacks.
- `backend/tests/test_review.py`: FSRS-6 retrievability decay, stability updates, cutoff calculations, LLM error classifier, and weakness report generation.
- `backend/tests/test_solo_battle.py`: Speed scoring formula, bot naming and badge labeling, deterministic simulation, and battle API flow.
- `backend/tests/test_voice_and_doubt.py`: STT transcription, TTS synthesis with math LaTeX-to-speech, multi-modal doubt solving schema, and `/ws/talk` live streaming.

### End-to-End Browser Testing (Playwright)
Full automated browser test across 9 comprehensive test suites verifying Home empty states, guided tour modal, sandbox feed, solo battle arena with labeled bots, spaced repetition review flow, short code expired states, AI Doubt drawer with 3D simulations & LaTeX, Live Voice Tutor Talk Mode, and dedicated `/doubt` page:
```bash
py -3.12 scratch/test_e2e_browser.py
```
**Result**: `=== ALL E2E PLAYWRIGHT TESTS PASSED SUCCESSFULLY! ===`.

### Frontend Production Build Verification
Verify production compilation and bundle budgets:
```bash
cd frontend
npm run build
```
**Result**: `✓ built in ~5s. Gzipped JS bundle is 270 kB (well under 500 kB budget)`.

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
| `POST` | `/api/stt/sync` | Public | AssemblyAI Universal-3.5 Pro speech-to-text |
| `POST` | `/api/tts` | Public | Fish Audio S2.1 Pro TTS with LaTeX conversion |
| `GET` | `/api/tts/voices` | Public | List available tutor voice presets |
| `POST` | `/api/doubt/text` | Public | Step-by-step doubt solver with 3D sims & SVG graphs |
| `POST` | `/api/doubt/with-image` | Public | Multi-modal textbook photo solver via NVIDIA NIM |
| `POST` | `/api/doubt/3d` | Public | Microsoft TRELLIS 3D generation via NVIDIA NIM |
| `WS` | `/ws/talk` | Public | Bidirectional real-time conversational Voice Tutor |

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
│   │   ├── doubt.py            # Academic doubt solver endpoints
│   │   ├── feeds.py            # Shared feeds API endpoints
│   │   ├── review.py           # FSRS-6 spaced repetition endpoints
│   │   ├── stt.py              # AssemblyAI STT route
│   │   ├── talk.py             # Live Voice Tutor WebSocket route
│   │   └── tts.py              # Fish Audio TTS route
│   ├── supabase/
│   │   └── migrations/         # PostgreSQL schema & doubt history tables
│   ├── tests/
│   │   ├── test_endpoints.py   # Core API & crypto test suite
│   │   ├── test_no_dummy_data.py # Dummy data elimination suite
│   │   ├── test_review.py      # FSRS-6 algorithm & cutoff tests
│   │   ├── test_share.py       # Deep linking & moderation tests
│   │   ├── test_solo_battle.py # Bot simulation & speed scoring tests
│   │   └── test_voice_and_doubt.py # STT, TTS, doubt & talk tests
│   ├── auth.py                 # Supabase JWT authentication
│   ├── battle.py               # WebSocket multiplayer battle state machine
│   ├── config.py               # Safe environment loader
│   ├── crypto.py               # AES-256-GCM BYO key encryption
│   ├── db.py                   # Supabase & in-memory shared feed stores
│   ├── doubt.py                # Multi-modal solver with model cascade & sims
│   ├── llm.py                  # Groq inference client & prompt orchestration
│   ├── main.py                 # FastAPI application & lifespan background cleanup
│   ├── nvidia.py               # NVIDIA NIM (VLM, OCR, TRELLIS 3D) client
│   ├── review.py               # Pure-Python FSRS-6 engine & error classifier
│   ├── sanitizer.py            # SVG & text sanitization
│   ├── schemas.py              # Pydantic data contracts
│   ├── search.py               # Tavily NCERT grounding integration
│   ├── solo_battle.py          # Seeded bot simulation & speed scoring
│   ├── stt.py                  # AssemblyAI Universal-3.5 Pro client
│   ├── tts.py                  # Fish Audio S2.1 Pro TTS client
│   └── tts_latex.py            # Mathematical LaTeX equation to spoken English
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BattlePodium.jsx
│   │   │   ├── BattleSummary.jsx
│   │   │   ├── BotBadge.jsx    # 🤖 BOT identity chip
│   │   │   ├── ChatBubble.jsx  # Student & tutor chat message bubbles
│   │   │   ├── CommentSheet.jsx # Clean empty state comments
│   │   │   ├── DailyReviewCard.jsx # Exam-date aware daily review card
│   │   │   ├── DemoBanner.jsx  # Ephemeral sandbox banner
│   │   │   ├── DiagramRenderer.jsx # DOMPurify SVG diagram viewer
│   │   │   ├── DoubtPanel.jsx  # 520px multi-modal doubt solver drawer
│   │   │   ├── EmptyState.jsx  # Actionable empty state card
│   │   │   ├── ExamDatePrompt.jsx # Exam date selector modal
│   │   │   ├── GraphRenderer.jsx # Pure SVG line/scatter/bar plotting
│   │   │   ├── ImageUploader.jsx # Textbook photo dropzone & camera snap
│   │   │   ├── MicButton.jsx   # Interactive mic button with pulsing animation
│   │   │   ├── MicOverlay.jsx  # Live audio waveform recording overlay
│   │   │   ├── PracticeCard.jsx # Follow-up MCQ with FSRS queue button
│   │   │   ├── Simulation3D.jsx # Optics, projectile & unit circle sims
│   │   │   ├── StepList.jsx    # Numbered steps with LaTeX & voice button
│   │   │   ├── TalkMode.jsx    # Fullscreen live conversational voice interface
│   │   │   ├── VoicePicker.jsx # 3 voice presets (Teacher, Buddy, Narrator)
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── ReviewProvider.jsx
│   │   │   ├── SandboxProvider.jsx
│   │   │   ├── TalkProvider.jsx # Global voice tutor & drawer state
│   │   │   └── ToastProvider.jsx
│   │   ├── hooks/
│   │   │   ├── useDoubt.js     # Doubt solver and history hook
│   │   │   ├── useRecorder.js  # Audio recording & level analyser hook
│   │   │   ├── useTalkMode.js  # WebSocket talk client hook
│   │   │   └── useTTS.js       # Speech synthesis & playback hook
│   │   ├── pages/
│   │   │   ├── Doubt.jsx       # Dedicated /doubt solver page
│   │   │   ├── Home.jsx
│   │   │   ├── Review.jsx
│   │   │   ├── SharedFeed.jsx
│   │   │   └── SoloBattle.jsx
│   │   ├── App.jsx             # React Router with /doubt route & tutor FAB
│   │   ├── api.js              # Client API wrapper
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
├── submission/
│   ├── demo-script.md
│   ├── judging-notes.md
│   ├── pitch-deck.md
│   └── README.md
├── DEVLOG.md                   # Engineering trajectory log
├── SUBMISSION_NOTES.md         # Final hackathon submission notes
└── LICENSE                     # MIT License
```

---

## 11. License & Acknowledgments

StudyRot is licensed under the [MIT License](LICENSE).

Developed for the **Nerdy AI Hackathon** ([hackathon.nerdy.com](https://hackathon.nerdy.com)). NCERT textbooks and curriculum guidelines are copyright National Council of Educational Research and Training, New Delhi, India.
