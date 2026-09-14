import React from 'react';
import { Volume2, VolumeX, Swords, LogIn, LogOut, Bookmark, Key, Mic, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider.jsx';
import { useTalk } from '../contexts/TalkProvider.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ soundEnabled = true, onToggleSound }) {
  const { user, demoMode, setDemoMode, signInWithGoogle, signOut } = useAuth();
  const { openTalkMode, openDoubt } = useTalk();
  const navigate = useNavigate();

  return (
    <header className="header-wrapper" role="banner">
      {/* Row 1: 48px, white bg, bottom border */}
      <div className="header-row-1">
        <div className="header-left">
          <Link to="/" className="header-brand-title" aria-label="StudyRot Home">
            <span className="header-brand-dot" aria-hidden="true" />
            <span>StudyRot</span>
          </Link>
          <span className="header-subtitle">CBSE NCERT Feed</span>
        </div>

        <div className="header-right">
          {/* Voice Tutor Live Mode Pill */}
          <button
            type="button"
            onClick={openTalkMode}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm"
            aria-label="Voice Tutor Live Mode"
            title="Talk to AI Voice Tutor (AssemblyAI + Fish Audio)"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Voice Tutor</span>
            <span className="sm:hidden">Talk</span>
          </button>

          {/* Doubt Solver Drawer Button */}
          <button
            type="button"
            onClick={() => openDoubt()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition shadow-sm"
            aria-label="Ask Doubt Solver"
            title="Ask a Doubt with 3D Simulations and Graphs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Ask Doubt</span>
            <span className="sm:hidden">Doubt</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            className="p-1.5 rounded-full border border-[var(--border)] bg-[var(--off-white)] hover:bg-[#eef3fc] text-[var(--navy-700)] transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-navy-400" />
            )}
          </button>

          {/* Study Pathway Link */}
          <Link
            to="/plan"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
            title="7-Day Adaptive Study Pathway"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">Plan</span>
          </Link>

          {/* Full Mock Test Link */}
          <Link
            to="/mock"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition shadow-xs"
            title="CBSE Board Full Mock Tests"
          >
            <span>📝</span>
            <span className="hidden sm:inline">Mock</span>
          </Link>

          {/* Collaborative Study Room Link */}
          <Link
            to="/room"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition shadow-xs"
            title="Collaborative Study Rooms (2-8 Students)"
          >
            <span>👥</span>
            <span className="hidden sm:inline">Room</span>
          </Link>

          {/* Check My Work Link */}
          <Link
            to="/check-work"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition shadow-xs"
            title="Check My Work Photo Feedback"
          >
            <span>📷</span>
            <span className="hidden sm:inline">Check</span>
          </Link>

          {/* Daily Review Link */}
          <Link
            to="/review"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-[var(--navy-900)] border border-blue-200 hover:bg-blue-100 transition"
            title="Daily Spaced Repetition"
          >
            <span>📅</span>
            <span className="hidden sm:inline">Review</span>
          </Link>

          {/* Solo Battle Pill */}
          <button
            type="button"
            onClick={() => navigate('/battle/solo')}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-[var(--red)] border border-red-200 hover:bg-red-100 transition shadow-sm"
            aria-label="Solo Battle Arena"
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Solo Battle</span>
            <span className="sm:hidden">Battle</span>
          </button>

          {/* Saved Feeds */}
          <Link
            to="/saved"
            className="p-1.5 rounded-full border border-[var(--border)] bg-[var(--off-white)] hover:bg-[#eef3fc] text-[var(--navy-700)] transition"
            title="Saved Feeds & Bookmarks"
            aria-label="View Saved Feeds"
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          {/* API Keys */}
          {!demoMode && (
            <Link
              to="/keys"
              className="p-1.5 rounded-full border border-[var(--border)] bg-[var(--off-white)] hover:bg-[#eef3fc] text-[var(--navy-700)] transition"
              title="API Keys Configuration"
              aria-label="Configure API Keys"
            >
              <Key className="w-4 h-4" />
            </Link>
          )}

          {/* Sign In / User Avatar */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--navy-800)] hidden md:inline">
                {user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1.5 rounded-full border border-[var(--border)] hover:bg-red-50 text-[var(--red)] transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center gap-1 text-xs font-bold text-[var(--navy-800)] hover:text-[var(--navy-600)] transition px-2 py-1"
              aria-label="Sign In with Google"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: 32px, navy-900 bg, white text, centered */}
      <div className="header-row-2">
        <span className="demo-mode-dot" aria-hidden="true" />
        <span>
          Demo Mode — Instant curated NCERT feeds · Free access ·{' '}
          {!user ? (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="underline font-bold text-amber-300 hover:text-white transition ml-1"
            >
              [Sign in]
            </button>
          ) : (
            <span className="text-emerald-400 font-bold ml-1">✓ Signed in</span>
          )}
        </span>
      </div>
    </header>
  );
}
