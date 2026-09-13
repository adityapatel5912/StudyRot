# Hackathon Submission Notes — StudyRot

### Project: StudyRot (CBSE NCERT Study Feeds & Classroom Battles)
### Event: Nerdy AI Hackathon (hackathon.nerdy.com)
### Track: Education & AI Learning Tools

---

## 1. Submission Checklist & Completeness

- [x] **Zero Codebase Placeholders**: Exactly 3 permitted placeholders are present:
  - `[VERCEL_LINK]` (Live demo web URL in documentation)
  - `[YOUTUBE_LINK]` (Demo video recording URL in documentation)
  - `submission/pitch-deck.pdf` (Binary presentation deck)
- [x] **No TODOs / No Stubs**: Every backend endpoint, frontend component, utility, and migration is fully implemented, runnable, and tested.
- [x] **All Reported UI Issues Resolved**:
  - Overlapping header buttons $\to$ Solved with two stacked non-overlapping header rows.
  - Fullscreen quiz layout clipping $\to$ Solved with strict viewport overlay, clean top bar, and no body overflow.
  - Misleading default option colors $\to$ Options are now crisp white by default; color appears only during reveal.
  - Formulas in plain text $\to$ Full KaTeX LaTeX typesetting across cards, quizzes, and battle screens.
  - Tip callout duplication $\to$ Automatic Jaccard similarity filter hides callouts matching $\ge 70\%$ of body text.
  - Inaccurate quiz answers $\to$ Pydantic schemas enforce exact answer match in the 4 unique option array.
- [x] **100% Test Pass Rate**: All 11 pytest integration tests pass. Frontend builds with 0 errors via Vite.

---

## 2. Guide for Judges: Quick Testing Flow

1. **Test 1: Instant Demo Feed (Zero Setup)**:
   - Visit the web application.
   - Under **⚡ Quick Demo Topics**, click **Science Cl 10: Light & Refraction**.
   - Observe instant feed generation (14–18 cards) with animated SVG ray diagrams, Snell's law diagrams, and KaTeX formulas.
   - Swipe through cards or use the Up/Down arrow keys.
2. **Test 2: Timed Quiz & Fullscreen Mode**:
   - Scroll to a quiz card (e.g. Card #3 or #7).
   - Notice the timer bar animating and pure white option buttons.
   - Click "Fullscreen Mode" to view the distraction-free quiz interface.
   - Select an answer or press keys `1`–`4` on your keyboard.
   - Hear procedural Web Audio sound feedback and see the green/red reveal states.
3. **Test 3: Real-Time Classroom Battle Arena**:
   - In the header, click **Classroom Battle**.
   - Click **Solo Practice Mode** to play immediately against simulated CBSE topper bots, or share the 6-digit PIN with a peer in another tab.
   - Answer the rapid-fire 15-second questions.
   - View the live speed-based score calculation, live arena standings, and champions podium.
4. **Test 4: BYO Encrypted API Keys**:
   - In the header, click the **Keys** icon or navigate to `/keys`.
   - Enter your Groq or Tavily API key and click Save.
   - The backend encrypts keys using AES-256-GCM authenticated cipher before storage.

---

## 3. Technology Highlights for Nerdy Judges

- **AI Inference**: High-throughput Groq Cloud inference (`llama-3.3-70b-versatile` with `qwen/qwen3.8-27b` fallback) delivering full 14-post curriculum feeds in $< 3$ seconds.
- **Fact Grounding**: Tavily Search integration grounding NCERT curriculum details and board exam marking schemes.
- **Multiplayer Synchronous State**: WebSocket server-authoritative state machine with host promotion and 10-message replay buffer.
- **Client Security**: Authenticated AES-256-GCM encryption with PBKDF2 key derivation.
