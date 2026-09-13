import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider.jsx';
import { ToastProvider } from './contexts/ToastProvider.jsx';
import { SandboxProvider } from './contexts/SandboxProvider.jsx';
import { ReviewProvider } from './contexts/ReviewProvider.jsx';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Battle from './pages/Battle.jsx';
import SoloBattle from './pages/SoloBattle.jsx';
import Review from './pages/Review.jsx';
import SharedFeed from './pages/SharedFeed.jsx';
import Saved from './pages/Saved.jsx';
import Keys from './pages/Keys.jsx';

function AppContent() {
  const { user, signInWithGoogle } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('studyrot_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [activePosts, setActivePosts] = useState([]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('studyrot_sound_enabled', String(next));
      } catch {}
      return next;
    });
  };

  const handleSelectSavedFeed = (posts) => {
    setActivePosts(posts);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--off-white)] text-[var(--navy-900)]">
      {/* Guest Mode Banner (Hidden when signed in) */}
      {!user && (
        <div className="w-full bg-slate-800 text-slate-200 px-4 py-1.5 text-center text-[11px] font-medium flex items-center justify-center gap-2">
          <span>Demo Mode — Free access.</span>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="underline text-white font-bold hover:text-amber-300"
          >
            Sign in to save your progress
          </button>
        </div>
      )}

      <Header
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                soundEnabled={soundEnabled}
                activePosts={activePosts}
                setActivePosts={setActivePosts}
              />
            }
          />
          {/* Deep link shared feeds */}
          <Route
            path="/s/:shortCode"
            element={<SharedFeed soundEnabled={soundEnabled} />}
          />
          <Route
            path="/s/:shortCode/:index"
            element={<SharedFeed soundEnabled={soundEnabled} />}
          />

          {/* Battles: Classroom & Solo vs Bots */}
          <Route
            path="/battle"
            element={<Battle soundEnabled={soundEnabled} />}
          />
          <Route
            path="/battle/solo"
            element={<SoloBattle soundEnabled={soundEnabled} />}
          />
          <Route
            path="/battle/:code"
            element={<Battle soundEnabled={soundEnabled} />}
          />

          {/* Exam-Date Spaced Repetition Review */}
          <Route
            path="/review"
            element={<Review />}
          />

          <Route
            path="/saved"
            element={<Saved onSelectFeed={handleSelectSavedFeed} />}
          />
          <Route
            path="/keys"
            element={<Keys />}
          />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReviewProvider>
        <SandboxProvider>
          <ToastProvider>
            <Router>
              <AppContent />
            </Router>
          </ToastProvider>
        </SandboxProvider>
      </ReviewProvider>
    </AuthProvider>
  );
}
