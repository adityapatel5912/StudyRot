import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider.jsx';
import { ToastProvider } from './contexts/ToastProvider.jsx';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Battle from './pages/Battle.jsx';
import Saved from './pages/Saved.jsx';
import Keys from './pages/Keys.jsx';

export default function App() {
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
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[var(--off-white)] text-[var(--navy-900)]">
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
                <Route
                  path="/battle"
                  element={<Battle soundEnabled={soundEnabled} />}
                />
                <Route
                  path="/battle/:code"
                  element={<Battle soundEnabled={soundEnabled} />}
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
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
