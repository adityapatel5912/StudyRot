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
