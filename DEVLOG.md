# Engineering Devlog — StudyRot

This document chronicles the design decisions, architectural pivots, and bug resolutions leading to the submission-ready build of **StudyRot** for the Nerdy AI Hackathon.

---

## Phase 1: Problem Definition & UX Pain Points

### Identified Issues in Prototype Build
1. **Header Layout Collision**: Action buttons (Mute, Battle, Auth, Keys) wrapped into multi-line collisions on screens $< 480\text{px}$.
2. **Fullscreen Quiz Breaking**: Option cards suffered horizontal clipping and native browser scrollbar leaks on iOS Safari and mobile Chrome.
3. **Misleading Option Coloring**: Multiple-choice buttons were styled with static rainbow colors (red, blue, orange, green) by default before user interaction, confusing students into thinking red meant incorrect.
4. **Formula Formatting**: Math formulas and chemical equations were rendered in raw text without proper fractions, exponents, or square roots.
5. **Tip Callout Duplication**: The `body` text was frequently repeated verbatim inside the analogy callout container, degrading the reading experience.
6. **Hallucinated Answers**: Early LLM prompts occasionally returned quiz answers that did not strictly match any of the four generated options.

---

## Phase 2: Backend Architecture & Quality Safety Gates

### 1. Cryptographic Security Engine (`crypto.py`)
- **Decision**: Rather than storing user API keys in plaintext, we implemented authenticated AES-256-GCM encryption with PBKDF2-HMAC-SHA256 key derivation.
- **Outcome**: Client keys stored in Supabase are secure even against direct database dump leaks.

### 2. Multi-Model Inference Cascade (`llm.py`)
- **Challenge**: Groq Cloud account tiers can encounter 404/deprecations on specific models (e.g. `llama-3.3-70b-versatile`).
- **Solution**: Implemented an automated fallback cascade to `qwen/qwen3.8-27b` and `llama-3.1-8b-instant`, paired with local verified pre-baked NCERT cache supplementation to guarantee that every feed strictly contains 14–18 posts.

### 3. Curriculum Research Cache (`verified_context.py`)
- **Implementation**: Built a verified research cache of 15 NCERT topics across Science, Maths, and SST for Class 8, 10, and 12, paired with 6 pre-baked feeds in `data/demo-feeds/`.

### 4. WebSocket Battle Engine (`battle.py`)
- **Implementation**: Engineered an in-memory `BattleManager` supporting:
  - 15-second server-authoritative tick clock.
  - Speed-based scoring formula: $500 + \text{round}((t_{\text{left}} / 15) \times 500)$.
  - 10-message circular replay buffer for reconnection sync.
  - Automatic host promotion upon teacher or host disconnect.

---

## Phase 3: Frontend Polish & Design System Overhaul

### 1. Two-Row Non-Overlapping Header (`Header.jsx`)
- Overhauled the header into two strict rows:
  - Row 1 (48px): Brand logo dot, StudyRot title, subtitle, sound toggle, battle pill, saved feeds link, and auth.
  - Row 2 (32px): Centered Navy-900 demo mode banner with clear sign-in indicators.

### 2. KaTeX Mathematical Typesetting (`MathText.jsx`)
- Added `@import 'katex/dist/katex.min.css';` to global stylesheets.
- Built `<MathText>` component with regex parsing for inline `$...$` and display `$$...$$` LaTeX blocks, backed by an error boundary fallback.

### 3. Jaccard Word-Similarity Filter (`PostCard.jsx`)
- Implemented a set-based Jaccard word-overlap similarity check between `post.body` and `post.analogy`. If overlap $\ge 70\%$, the duplicate callout is hidden, ensuring clean pedagogical delivery.

### 4. High-Contrast Accessible Quiz Styling (`Quiz.jsx` & `FullScreenQuiz.jsx`)
- Restyled all option buttons to pure white background (`#ffffff`) with subtle gray borders by default.
- Applied clear colored feedback only upon answer submission (Emerald `#15803d` for correct, Crimson `#dc2626` for incorrect).
- Rebuilt fullscreen quiz container with `position: fixed`, `inset: 0`, and hidden overflow on the background body to eliminate double scrollbars.

---

## Phase 4: Verification & Automated Testing

1. **Pytest Suite**:
   - Developed 11 automated test cases in `backend/tests/test_endpoints.py` testing health checks, SVG sanitization, quiz schema integrity, error envelopes, crypto roundtrip, and battle state machine.
   - **Result**: 11/11 tests passing (100%).
2. **Frontend Production Build**:
   - Ran `npm run build` with Vite.
   - **Result**: 1,759 modules transformed, KaTeX fonts packaged, 0 syntax or bundling errors.
3. **Smoke Testing**:
   - Authored `scripts/smoke.sh` and `scripts/smoke.ps1` for rapid endpoint validation against staging and local servers.

---

## Phase 5: Real User Data Only, Deep Link Sharing, FSRS-6 & Solo Battles

### 1. Real User Data Only & Zero Dummy Data
- **Problem**: Demo mode previously relied on pre-baked feed files in `backend/data/demo-feeds/` and `frontend/public/demo-feeds/`, hardcoded `likes: 24`, and AI-seeded "StudyBuddy" comments.
- **Solution**:
  - Deleted `backend/data/demo-feeds/` and `frontend/public/demo-feeds/` completely.
  - Eliminated `likes: 24` across all schemas; initial likes strictly start at 0.
  - Cleaned comment sheet; comments start empty with prompt: *"No comments yet. Be the first."*
  - Re-labeled all bot opponents with explicit `Bot ` prefixes (e.g. `Bot Aditya`, `Bot Priya`, `Bot Rohan`) and a distinct 🤖 BOT badge so students always recognize simulated practice opponents.
  - Built `SandboxProvider` for ephemeral state isolation across Feed, Review, and Solo Battle demos so guest testing never pollutes user account databases.
  - Created a 5-step guided interactive tour with spotlight and explicit demo card labeling (`"DEMO POST — your own feed will look like this"`).

### 2. Working Share & Card-Level Deep Links
- **Short Code Engine**: Developed `utils/codes.py` generating 6-character short codes omitting ambiguous characters (`O, 0, I, 1`).
- **Auto-Persistence**: `/api/generate`, `/api/demo-generate`, and `/api/upload` automatically persist feeds with 30-day expiry.
- **Card-Level Routing**: Added `/s/:shortCode/:index` route, scrolling directly to the targeted card with an arriving glowing indicator ring.
- **Safety**: Banned words content moderation, SVG script stripping, and guest rate-limiting (3/hour guest, 20/hour authenticated).
- **Store Resilience**: Implemented `SupabaseSharedFeedStore` with transparent graceful fallback to `InMemorySharedFeedStore` (24h TTL, periodic cleanup) if the remote database table is unmigrated.

### 3. Exam-Date-Aware Spaced Repetition (FSRS-6)
- **FSRS-6 Math Engine**: Pure-Python implementation of the state-of-the-art Free Spaced Repetition Scheduler formula $R(t, S) = (1 + \frac{1}{9}\frac{t}{S})^{-1}$.
- **Priority Queue**: Priority queue sorting by marginal retrievability gain $\Delta R = R_{\text{after}} - R(t)$, prioritizing concepts whose review yields the highest exam-day retention.
- **Exam Mode & Cutoffs**: Calculates cutoff date after which new concept acquisition will decay below 70% before the board exam.
- **Weakness Diagnostic**: Categorizes mistakes into Formula Confusion, Sign Convention, Conceptual Misapplication, or Careless Reading, producing an automated remediation report after 10+ wrong answers.

### 4. Single-Player Solo Battle vs AI Bots
- **Speed Scoring**: Implemented $\text{Score} = 1000 - (\frac{\text{time\_ms}}{15000}) \times 500$ for correct answers.
- **Realistic Bot Simulation**: Easy (55%), Medium (75%), and Hard (90%) difficulty profiles with realistic answer latencies.
- **Staggered Reveals & Commentary**: Bot reveals stagger across 15 seconds, live standings update in real-time with streak badges and reactions (🔥/💀), leading to a podium ceremony.

### 5. Comprehensive Verification
- **Pytest Suite Expanded**: Built 4 new test suites (`test_no_dummy_data.py`, `test_share.py`, `test_review.py`, `test_solo_battle.py`). Total: **33/33 passing (100%)**.
- **Playwright E2E Browser Testing**: Built and verified `scratch/test_e2e_browser.py` executing 6 end-to-end user journeys (Home empty states, guided tour, sandbox feed, solo battle arena, spaced repetition review, and 404 shared feeds).
- **Production Build**: Verified bundle size (249 kB gzipped JS, well under the 500 kB budget).

---

## Phase 6: Full AI Voice & Multi-Modal Doubt-Solving Tutor

### 1. Architectural Positioning
- **Moat Enforcement**: Rather than building generic flashcards or mind maps (dominated by Google NotebookLM and Gemini Student Hub), StudyRot doubled down on its four defensible pillars:
  1. Retention science (FSRS-6 calibrated to board exam dates)
  2. Voice-first doubt solver (AssemblyAI Universal-3.5 Pro + Fish Audio S2.1 Pro with math LaTeX converter)
  3. Multi-modal learning with 3D simulations (Ray optics, projectile trajectories, unit circles, pure SVG graphs)
  4. Competitive battles (Solo AI bot arena & classroom multiplayer)

### 2. Voice Stack (STT & TTS)
- **AssemblyAI Universal-3.5 Pro**: Integrated `backend/stt.py` with CBSE curriculum prompt injection (`"CBSE Class 10 Science physics ray optics concave mirror focal length..."`) to maximize recognition accuracy on accented English, Hinglish, and scientific vocabulary.
- **Fish Audio S2.1 Pro via OpenRouter**: Integrated `backend/tts.py` with 3 voice presets (`teacher`, `buddy`, `narrator`) and in-memory LRU audio cache.
- **LaTeX Math-to-Spoken English Converter**: Created `backend/tts_latex.py` translating complex mathematical equations into smooth spoken English (e.g., `\frac{1}{v} + \frac{1}{u} = \frac{1}{f}` $\to$ *"one over v plus one over u equals one over f"*, `\sin^2\theta + \cos^2\theta = 1` $\to$ *"sine squared theta plus cosine squared theta equals one"*), with automated fallback to the browser's `window.speechSynthesis`.

### 3. Multi-Modal Academic Doubt Solver
- **NVIDIA NIM Integration**: Built `backend/nvidia.py` integrating:
  - Vision: `meta/llama-3.2-11b-vision-instruct` for textbook diagram & handwritten assignment recognition.
  - OCR: `nvidia/nemotron-ocr-v2` for dense formula extraction.
  - 3D Generation: `microsoft/trellis` for GLB 3D concept asset generation.
- **Groq Model Cascade & Fast Failover**: Integrated `qwen/qwen3.8-27b`, `qwen/qwen3.6-27b`, and `openai/gpt-oss-120b` in `backend/doubt.py`. Set `max_retries=0` and `timeout=12.0` with `max_tokens=700` so rate limits fail over instantly without hanging requests.
- **Guaranteed Output Schema**: Added strict schema guards ensuring `final_answer`, `common_mistakes`, `steps`, `next_practice`, and `StudyRot Tutor` identity are always present.

### 4. Visualizations & Simulations
- **Interactive 3D Simulation**: Created `frontend/src/components/Simulation3D.jsx` with interactive sliders for Concave Mirror optics ($u, v, f, m$), Projectile Motion ($\theta, u, H, R$), and Trigonometric Unit Circle ($\sin, \cos, \theta$).
- **Pure SVG Graph Renderer**: Created `frontend/src/components/GraphRenderer.jsx` rendering coordinate axes, ticks, plotted curves, and hover coordinate tooltips with zero external charting dependencies, maintaining our < 500 kB bundle budget (actual: 270 kB gzipped).
- **Interactive Diagram Viewer**: Created `frontend/src/components/DiagramRenderer.jsx` with DOMPurify sanitization, zoom controls, and fullscreen view.

### 5. Live Voice Talk Mode & Everywhere Integration
- **Full-Screen Voice Orb Interface**: Built `frontend/src/components/TalkMode.jsx` with a 200px pulsing voice orb, live audio visualizer bars, and bidirectional WebSocket streaming (`/ws/talk`).
- **Global Drawer & Everywhere Actions**: Added floating `#ask-tutor-fab`, header "Voice Tutor" live mode button, post card "Ask Tutor about this" chip, and quiz card "Explain with 3D Simulation & Diagram" button.

### 6. Full Verification & Results
- **Backend Pytest Suite**: Added `backend/tests/test_voice_and_doubt.py`. **44/44 tests passing (100%)**.
- **Playwright E2E Browser Suite**: Expanded to 9 automated user journey tests in `scratch/test_e2e_browser.py`. **All 9 test suites passing (100%)**.
- **Production Bundle**: Gzipped JS is 270.70 kB (well under the 500 kB budget); build completes in ~5s.

---

## Phase 6: Four Core Defensible Features

### 1. Full Mock Test Mode (`/mock`)
- **CBSE Blueprints & Balanced Difficulty**: Created 11 official paper templates across Class 10 (Science, Maths, SST) and Class 12 (Physics, Chemistry, Maths, Biology, History, Political Science, Geography, Economics). Enforces 40% Easy, 40% Medium, 20% Hard difficulty distribution.
- **Authentic PYQ Seed Data**: Seeded authentic CBSE Previous Year Questions (2022–2024) complete with official marking scheme rationales.
- **Multi-Modal Testing**: Built KaTeX rich equation answer editor and interactive pure SVG India Map skill question with clickable state identification (e.g., major iron ore mines, dams, nuclear plants).
- **Auto-Grader & PDF Export**: Server auto-grades MCQs, map locations, and evaluates subjective answers against rubrics, syncing mistakes into the FSRS spaced repetition retention queue.

### 2. Collaborative Study Rooms (`/room`)
- **Real-Time Synchronized Study**: Built room manager supporting 2–8 concurrent students via WebSockets (`/ws/room/{code}`).
- **Sync Mode vs. Free Mode**: Host controls navigation lockstep across the feed or allows free independent scrolling.
- **Bottom Bar Chat with AI Interventions**: Moderated chat with 2-second rate limiting, profane filter, and `@ai` trigger delivering instant verified NCERT tutor responses directly into the group conversation.
- **3-Question Group Quiz**: Synchronized 20-second countdown timer, real-time participant choice reveal, and MVP winner celebratory confetti.

### 3. Check My Work with Photo Feedback (`/check-work`)
- **Handwritten Solution Grader**: Multi-model vision pipeline (NVIDIA NIM OCR + Groq reasoning) grading student photos step-by-step.
- **Pedagogical Pinpointing**: Displays student's written text side-by-side with step-by-step colored badges (green for correct, red with highlight for errors).
- **Misconception Classifier**: Identifies mistake classes (`sign_error`, `formula_confusion`, `calculation_error`, `interpretation_error`) and suggests targeted drill topics.
- **Security & Caching**: 24-hour SHA-256 image caching and BYOK isolation with 1-click sample numerical demo.

### 4. Adaptive Study Pathway Generator (`/plan` and `/plan/today`)
- **7-Day Dynamic Calendar**: Calibrated against FSRS-6 card stability, topic error history, CBSE blueprint weightage, and upcoming exam countdown.
- **Subject Balance Guarantee**: Strictly prevents any single subject from exceeding 50% of the weekly time budget.
- **Dynamic Mid-Week Roll-Forward**: Past uncompleted priority sessions automatically roll forward into the active day.
- **Automated Rebalancing**: APScheduler cron job running nightly at 02:00 IST to rebalance schedules based on recent student activity.

### 5. Verification & Quality Gates
- **Pytest Suite**: **59/59 tests passing (100% green)** in `backend/tests/`.
- **Smoke Suite**: All 9 automated API health and feature tests passing in `scripts/smoke.ps1`.
- **Frontend Production Build**: Vite build completed cleanly with index bundle gzip at 291.77 kB (< 500 kB budget).
- **Playwright E2E Verification**: 15 screenshots captured across Mobile (375x812), Tablet (768x1024), and Desktop (1440x900).


