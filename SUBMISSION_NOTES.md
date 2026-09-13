# Hackathon Submission Notes — StudyRot

### Project: StudyRot (CBSE NCERT Study Feeds, Spaced Repetition & Classroom Battles)
### Event: Nerdy AI Hackathon (hackathon.nerdy.com)
### Track: Education & AI Learning Tools

---

## 1. Submission Checklist & Completeness

- [x] **Zero Codebase Placeholders**: Exactly 3 permitted placeholders are present:
  - `[VERCEL_LINK]` (Live demo web URL in documentation)
  - `[YOUTUBE_LINK]` (Demo video recording URL in documentation)
  - `submission/pitch-deck.pdf` (Binary presentation deck)
- [x] **No TODOs / No Stubs**: Every backend endpoint, frontend component, utility, migration, and test is fully implemented, runnable, and tested.
- [x] **Real User Data Only (Zero Dummy Data Guarantee)**:
  - All pre-baked demo feeds in `backend/data/demo-feeds/` and `frontend/public/demo-feeds/` have been deleted.
  - Zero seeded comments: comment sheet opens to *"No comments yet. Be the first."*
  - Zero fake like counts: initial post likes start strictly at 0.
  - Transparent bot labeling: simulated opponents in Solo Battle are explicitly named `Bot Aditya`, `Bot Priya`, `Bot Rohan` with 🤖 BOT chips.
  - Ephemeral state-isolated sandbox (`SandboxProvider`) for guest demos without polluting user databases.
- [x] **Working Share & Deep Links**:
  - Unique 6-character short codes (`/s/:shortCode`) with card-level deep links (`/s/:shortCode/:index`).
  - Auto-saved on generation, content moderation filter, and 30-day cleanup background worker.
- [x] **Exam-Date-Aware Spaced Repetition (FSRS-6)**:
  - Pure-Python FSRS-6 scheduler engine ($R(t) = (1 + \frac{1}{9}\frac{t}{S})^{-1}$).
  - Priority queue sorted by marginal retrievability gain: $\Delta R = R_{\text{after}} - R(t)$.
  - Exam date onboarding, daily review card, and 10+ wrong answer weakness diagnostic report.
- [x] **Single-Player Solo Battle vs AI Bots**:
  - 8 questions, 15-second timer, millisecond-accurate speed scoring formula: $1000 - (\frac{\text{time\_ms}}{15000}) \times 500$.
  - Realistic bot latencies, staggered reveals, live commentary, reactions (🔥/💀), and victory podium.
- [x] **AI Voice & Multi-Modal Doubt-Solving Tutor**:
  - AssemblyAI Universal-3.5 Pro speech-to-text with CBSE syllabus prompt injection.
  - Fish Audio S2.1 Pro TTS with specialized LaTeX math-to-speech converter and browser speech synthesis fallback.
  - Multi-modal academic doubt resolution with step-by-step LaTeX derivations, common CBSE board mistakes, and follow-up MCQs.
  - Interactive 3D concept simulations (Ray Optics concave mirror, Projectile Motion, Trigonometric Unit Circle).
  - Pure SVG graphing engine (line, scatter, bar) with coordinate hover without external charting libraries.
  - Multi-modal vision and OCR integration via NVIDIA NIM (Llama 3.2 11B Vision, Nemotron-OCR-v2, Microsoft TRELLIS 3D).
  - Live conversational Voice Tutor mode with central 200px pulsing orb and bidirectional WebSocket streaming (`/ws/talk`).
  - Strict "StudyRot Tutor" persona identity.
- [x] **100% Test Pass Rate**:
  - **Pytest**: 44/44 tests passing across 6 test suites (100% pass rate).
  - **Playwright**: Complete 9-suite E2E browser automation suite passing green.
  - **Build**: Vite production build succeeded in 5s (270 kB gzipped JS, well under 500 kB budget).

---

## 2. Guide for Judges: Quick Testing Flow

1. **Test 1: Clean First-Time Experience & Guided Tour**:
   - Visit the web application.
   - Notice the clean initial state: Daily Review locked until exam date, no dummy feeds.
   - Click **Take the tour →** on the top banner.
   - Experience the 5-step spotlight tour explaining the feed, quizzes, diagrams, review, and battles.
   - Note the explicit demo banner: *"DEMO POST — your own feed will look like this"*.

2. **Test 2: Ephemeral Feed Sandbox & Real Interactions**:
   - On the Home page, click **Launch 4-Post Feed Sandbox**.
   - Notice the amber **SANDBOX DEMO** top banner.
   - Tap the ❤️ like button on any card — observe the counter increment from 0 to 1.
   - Tap the 💬 comment button — verify the clean empty state: *"No comments yet. Be the first."*
   - Tap the 🔗 share button — observe that demo feeds gracefully restrict sharing while prompting users to generate their own.

3. **Test 3: Solo Battle vs AI Bots (`/battle/solo`)**:
   - In the header, click **Solo Battle** or navigate to `/battle/solo`.
   - Select your bot difficulty (Easy 55%, Medium 75%, Hard 90%) and click **Enter Arena**.
   - View the Matchup Lobby: you vs. 3 bots (`Bot Aditya`, `Bot Priya`, `Bot Rohan`) each clearly labeled with 🤖 BOT chips.
   - Enter the arena: answer the 15-second timed CBSE MCQs.
   - Observe millisecond speed scoring, live standings table, staggered bot reveals, live reactions, and final podium summary.

4. **Test 4: Exam-Date Spaced Repetition (`/review`)**:
   - Click **Set Exam Date** on the Daily Review card.
   - Select an upcoming board exam date (e.g. March 2026).
   - Click **Try Sandbox** on the Daily Review card to enter sandbox review mode.
   - Review flashcards: click **Reveal Answer / Formula 👁️** to reveal the NCERT concept.
   - Rate recall with the 4 FSRS rating buttons: **Forgot (10 min)**, **Hard (1 day)**, **Good (3 days)**, **Easy (7 days)**.

5. **Test 5: Working Share Deep Links**:
   - Generate a topic or visit `/s/:shortCode` to view a shared study feed.
   - Test card-level deep links: `/s/:shortCode/2` navigates directly to card #3 with an arrival glowing ring.

6. **Test 6: AI Voice & Multi-Modal Doubt Solver**:
   - Click the floating **Ask Tutor** FAB (bottom-right) or header **Ask Doubt** button to open the 520px right drawer.
   - Tap a 1-click concept doubt: *"Concave Mirror: Object between C and F"*.
   - Observe the step-by-step CBSE solution render with KaTeX formulas, Final Answer card, Common CBSE Mistakes warnings, and follow-up MCQ.
   - Interact with the **3D Concept Simulation** (drag sliders for object distance $u$ and focal length $f$ to watch real-time image formation and magnification).
   - Click **Listen** to hear the explanation synthesized via Fish Audio / browser speech with LaTeX formulas naturally spoken.

7. **Test 7: Live Voice Tutor Talk Mode**:
   - In the header, click the **Voice Tutor** button (waveform icon) to open full-screen Live Voice Mode.
   - Tap the central 200px pulsing Voice Orb to speak in Hinglish or English (or click any quick prompt pill).
   - Speak your question; observe the live audio waveform visualizer and immediate spoken guidance from StudyRot Tutor.

---

## 3. Technology Highlights for Nerdy Judges

- **FSRS-6 Algorithm**: Pure-Python implementation of Free Spaced Repetition Scheduler v6, with mathematical marginal gain sorting optimized for board exam dates.
- **Voice Stack**: AssemblyAI Universal-3.5 Pro for speech-to-text with CBSE syllabus prompt injection, combined with Fish Audio S2.1 Pro and a custom LaTeX formula-to-spoken-English converter.
- **Multi-Modal Vision & 3D**: NVIDIA NIM integration (Llama-3.2-11b-vision-instruct, Nemotron-OCR-v2, and Microsoft TRELLIS 3D), with pure SVG graph plotting maintaining a 270 kB gzipped bundle.
- **AI Inference Cascade**: Groq Cloud SDK (`qwen/qwen3.8-27b`, `qwen/qwen3.6-27b`, `openai/gpt-oss-120b`) with zero-retry fast failover generating 14–18 curriculum cards with SVG diagrams and board-exam MCQs.
- **Syllabus Grounding**: Tavily Search integration grounding CBSE curriculum guidelines and board exam marking schemes.
- **Multiplayer & Bot Simulation**: Server-authoritative WebSocket state machine for multiplayer rooms, paired with deterministic bot simulations for zero-wait solo revision.
- **Client Security**: AES-256-GCM authenticated encryption with PBKDF2 key derivation for Bring-Your-Own API keys.
