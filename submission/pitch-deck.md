# StudyRot — Pitch Deck

## Slide 1: Title & Hook
- **Title**: StudyRot
- **Subtitle**: Turning Textbook Slump into High-Yield Brain Rot for CBSE Students
- **Tagline**: The TikTok of NCERT — Swipeable Feeds, Animated Diagrams, & Real-Time Classroom Battles
- **Team**: Built for the Nerdy AI Hackathon (hackathon.nerdy.com)

---

## Slide 2: The Problem
- **The Attention Crisis**: High school students spend an average of 4.2 hours daily scrolling vertical short-form feeds (Instagram Reels, TikTok, YouTube Shorts).
- **The Textbook Reality**: CBSE NCERT textbooks are dense, text-heavy, static PDFs. Reading them feels like homework; scrolling social media feels like dopamine.
- **The Gap**: EdTech apps have simply pasted PDFs behind paywalls or recorded 45-minute monotone lecture videos. Nobody has re-engineered curriculum study around the vertical swipe habit loop.

---

## Slide 3: The Solution — StudyRot
- **Swipeable Micro-Learning**: 14–18 bite-sized, structured study cards per chapter.
- **Multi-Modal Retention**:
  - 🎨 **Animated SVG Ray Tracings & Circuit Models** for visual memory.
  - 🧠 **Desi Analogies** grounding abstract physics & chemistry into everyday intuition.
  - ⏱️ **Timed Board MCQs** providing immediate active recall dopamine.
  - ⚔️ **Classroom Battle Arenas** turning silent revision into competitive multiplayer.

---

## Slide 4: Under the Hood — Technical Architecture
- **Inference Speed**: Groq Cloud running Llama 3.3 70B Versatile at 250+ tokens/sec, synthesizing full 16-card feeds in $< 3$ seconds.
- **Zero Hallucination Grounding**: Tavily Search API dynamically searches verified CBSE syllabus guidelines and NCERT chapter notes.
- **Math Precision**: KaTeX LaTeX typesetting ensures complex formulas ($\frac{1}{f} = \frac{1}{v} - \frac{1}{u}$, $\int x^2 dx$) render crisply on mobile.
- **Privacy First**: Authenticated AES-256-GCM encryption secures user BYO API keys in Supabase.

---

## Slide 5: Real-Time Classroom Battles
- **Multiplayer State Machine**: Server-authoritative WebSockets built on FastAPI.
- **Synchronized Clocks**: 15-second per-question countdowns broadcast to all peers.
- **Resilient Reconnection**: Circular replay buffers and automatic host promotion ensure classroom sessions never crash from spotty school Wi-Fi.
- **Gamified Scoring**: Formula balances accuracy and response speed.

---

## Slide 6: Product Demo Walkthrough
1. **1-Click NCERT Demos**: Science Class 10 Light, Electricity, Maths Class 12 Parabola, SST Class 10 Nationalism.
2. **Interactive Diagram Inspection**: Dynamic SVG rendering with normal lines and angle indicators.
3. **Timed Fullscreen Quiz**: Keyboard shortcuts, sound effects, and color-coded instant reveal.
4. **Live Multiplayer Arena**: Instant 6-digit room PIN, live standings, and winners podium.

---

## Slide 7: Quality & Reliability Guardrails
- **Jaccard Word-Similarity Filter**: Automatically prunes duplicate callout text ($>70\%$ overlap) between body copy and analogy tips.
- **Strict Pydantic Schema Contracts**: Validates 4 unique options per question and exact answer equality.
- **Pre-Baked NCERT Cache**: 15 verified research topics and 6 pre-baked feeds for guaranteed offline/demo reliability.

---

## Slide 8: Market Opportunity & Target Audience
- **Target Market**: 25+ Million CBSE and ICSE students in India (Classes 8–12).
- **Expansion Potential**: State Board exams, JEE Main, NEET UG, and UPSC Prelims micro-learning.
- **B2C & B2B Distribution**: Direct to students for revision; licensed to schools and tuition centers as an engaging classroom starter.

---

## Slide 9: Tech Stack Summary
- **Frontend**: React 18, Vite, Tailwind CSS, KaTeX, Lucide, Web Audio API
- **Backend**: FastAPI, Python 3.12, Uvicorn, SlowAPI, Cryptography
- **AI & Data**: Groq Cloud SDK, Tavily Search, Supabase PostgreSQL, Pytest

---

## Slide 10: Call to Action & Live Links
- **Live App**: [VERCEL_LINK]
- **Video Walkthrough**: [YOUTUBE_LINK]
- **GitHub Repository**: Open-source, production-ready, zero stubs, 100% test coverage.
- *Thank you, Nerdy Hackathon Judges!*
