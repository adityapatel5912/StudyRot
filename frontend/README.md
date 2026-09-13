# StudyRot — Frontend Client

React 18 and Vite single-page application delivering an NCERT vertical snap-scroll study feed, KaTeX formula typesetting, procedural Web Audio effects, and real-time multiplayer classroom battles.

---

## 1. Quick Start

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The application will start at `http://localhost:5173`.

To verify production compilation:
```bash
npm run build
```

---

## 2. Environment Variables

Edit `frontend/.env`:
```ini
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

---

## 3. UI Architecture & Components

- **`App.jsx`**: Client router wrapping `AuthProvider` and `ToastProvider` with routes for `/`, `/battle`, `/battle/:code`, `/saved`, and `/keys`.
- **`Header.jsx`**: Two-row non-overlapping responsive header with mute toggle, battle trigger, saved feeds, and auth.
- **`SourcePanel.jsx`**: 560px centered input card featuring 1-click quick NCERT demo cards across Science, Maths, and SST.
- **`SnapFeed.jsx`**: 100dvh vertical snap-scroll feed with IntersectionObserver lazy rendering.
- **`PostCard.jsx`**: Educational card with animated SVG diagram, KaTeX body typesetting, and Jaccard deduplication.
- **`Quiz.jsx` / `FullScreenQuiz.jsx`**: Timed MCQ view with pure white option styling by default, color reveals, and Web Audio SFX.
- **`components/battle/`**: Multiplayer classroom arena (`BattleLobby`, `BattleQuestion`, `BattleReveal`, `BattlePodium`).
- **`styles.css`**: Strict design token system and KaTeX font imports.
