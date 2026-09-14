import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider.jsx';
import { ToastProvider } from './contexts/ToastProvider.jsx';
import { SandboxProvider } from './contexts/SandboxProvider.jsx';
import { ReviewProvider } from './contexts/ReviewProvider.jsx';
import { TalkProvider, useTalk } from './contexts/TalkProvider.jsx';
import Header from './components/Header.jsx';
import TalkMode from './components/TalkMode.jsx';
import DoubtPanel from './components/DoubtPanel.jsx';
import Home from './pages/Home.jsx';
import Battle from './pages/Battle.jsx';
import SoloBattle from './pages/SoloBattle.jsx';
import Review from './pages/Review.jsx';
import SharedFeed from './pages/SharedFeed.jsx';
import Saved from './pages/Saved.jsx';
import Keys from './pages/Keys.jsx';
import Doubt from './pages/Doubt.jsx';
import MockTest from './pages/MockTest.jsx';
import StudyRoom from './pages/StudyRoom.jsx';
import CheckWork from './pages/CheckWork.jsx';
import Plan from './pages/Plan.jsx';
import PlanToday from './pages/PlanToday.jsx';
import { Sparkles, Mic } from 'lucide-react';

function AppContent() {
  const { user, signInWithGoogle } = useAuth();
  const {
    isTalkOpen,
    closeTalkMode,
    isDoubtOpen,
    openDoubt,
    closeDoubt,
    doubtPayload,
    activeVoice,
    setActiveVoice,
  } = useTalk();

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

          {/* AI Doubt Solver & Voice Tutor Page */}
          <Route
            path="/doubt"
            element={<Doubt />}
          />

          {/* Full Mock Test Mode */}
          <Route
            path="/mock"
            element={<MockTest />}
          />
          <Route
            path="/mock/:id"
            element={<MockTest />}
          />

          {/* Collaborative Study Rooms */}
          <Route
            path="/room"
            element={<StudyRoom />}
          />
          <Route
            path="/room/:code"
            element={<StudyRoom />}
          />

          {/* Check My Work with Photo Feedback */}
          <Route
            path="/check-work"
            element={<CheckWork />}
          />

          {/* Adaptive Study Pathway Generator */}
          <Route
            path="/plan"
            element={<Plan />}
          />
          <Route
            path="/plan/today"
            element={<PlanToday />}
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

      {/* Floating "Ask Tutor" Quick Action FAB */}
      <button
        type="button"
        id="ask-tutor-fab"
        onClick={() => openDoubt()}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
        title="Ask StudyRot AI Tutor (Voice, Sims & Graphs)"
      >
        <Sparkles className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '8s' }} />
        <span>Ask Tutor</span>
      </button>

      {/* Fullscreen Talk Mode Modal */}
      <TalkMode
        isOpen={isTalkOpen}
        onClose={closeTalkMode}
        activeVoice={activeVoice}
        onSelectVoice={setActiveVoice}
      />

      {/* 520px Slide-out Doubt Drawer */}
      <DoubtPanel
        isOpen={isDoubtOpen}
        onClose={closeDoubt}
        initialPayload={doubtPayload}
        activeVoice={activeVoice}
        onSelectVoice={setActiveVoice}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ReviewProvider>
        <SandboxProvider>
          <ToastProvider>
            <TalkProvider>
              <Router>
                <AppContent />
              </Router>
            </TalkProvider>
          </ToastProvider>
        </SandboxProvider>
      </ReviewProvider>
    </AuthProvider>
  );
}
