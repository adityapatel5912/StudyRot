/** Application header bar with sound toggle, battle shortcut, authentication state, and saved feeds menu. */
import React, { useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
import { Volume2, VolumeX, Swords, Bookmark, Key, BookOpen, LogOut } from 'lucide-react';

export default function TopBar({
  onOpenMyFeeds,
  onOpenSavedPosts,
  onOpenKeys,
  onOpenBattle,
  savedPostsCount = 0,
  soundEnabled = true,
  onToggleSound,
}) {
  const { user, signInWithGoogle, signOut, demoMode, setDemoMode } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[var(--white)] border-b border-[var(--border)] sticky top-0 z-40">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-[var(--navy-900)] text-[var(--white)] px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
          <span>Demo Mode · Instant curated NCERT feeds · Free access</span>
          {!user && (
            <button
              onClick={signInWithGoogle}
              className="underline ml-1 font-bold text-amber-300 hover:text-white transition"
            >
              Sign in
            </button>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-[var(--red)] mr-1.5 flex-shrink-0" />
            <span className="text-[22px] font-extrabold text-[var(--navy-900)] tracking-tight">
              StudyRot
            </span>
          </div>
          <span className="hidden sm:inline-block text-[13px] italic text-[var(--navy-400)] border-l border-[var(--border)] pl-3">
            CBSE NCERT Feed
          </span>
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle Button */}
          {onToggleSound && (
            <button
              type="button"
              id="sound-toggle-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              className="p-2 rounded-full bg-[var(--off-white)] hover:bg-[#eaf0fa] text-[var(--navy-700)] border border-[var(--border)] transition"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-navy-400" />
              )}
            </button>
          )}

          {/* Classroom Battle Mode Shortcut */}
          {onOpenBattle && (
            <button
              type="button"
              id="open-battle-mode-btn"
              onClick={onOpenBattle}
              title="Classroom Battle Mode"
              aria-label="Open Classroom Battle Mode"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition shadow-sm"
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Classroom Battle</span>
              <span className="sm:hidden">Battle</span>
            </button>
          )}

          {/* Demo Mode Toggle */}
          <div className="hidden md:flex items-center bg-[var(--off-white)] p-1 rounded-full border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setDemoMode(true)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition ${
                demoMode
                  ? 'bg-[var(--navy-900)] text-[var(--white)] shadow-sm'
                  : 'text-[var(--navy-600)] hover:text-[var(--navy-900)]'
              }`}
            >
              Demo Mode
            </button>
            <button
              type="button"
              onClick={() => {
                setDemoMode(false);
                if (!user) {
                  signInWithGoogle();
                }
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition ${
                !demoMode
                  ? 'bg-[var(--navy-900)] text-[var(--white)] shadow-sm'
                  : 'text-[var(--navy-600)] hover:text-[var(--navy-900)]'
              }`}
            >
              BYO Keys
            </button>
          </div>

          {/* Saved Posts Shortcut */}
          <button
            type="button"
            onClick={onOpenSavedPosts}
            title="Saved Posts"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--navy-700)] bg-[var(--off-white)] hover:bg-[#eaf0fa] rounded-full border border-[var(--border)] transition"
          >
            <Bookmark className="w-3.5 h-3.5 text-[var(--navy-600)]" />
            <span>Saved ({savedPostsCount})</span>
          </button>

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 rounded-full bg-[var(--off-white)] border border-[var(--border)] hover:border-[var(--navy-400)] transition"
              >
                <img
                  src={user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav'}
                  alt="avatar"
                  className="w-7 h-7 rounded-full bg-[var(--navy-800)] object-cover"
                />
                <span className="hidden md:inline text-xs font-bold text-[var(--navy-900)] max-w-[100px] truncate">
                  {user.user_metadata?.full_name || 'Student'}
                </span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-[var(--white)] rounded-xl shadow-xl border border-[var(--border)] py-1 z-50 animate-in fade-in"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[var(--border)]">
                    <p className="text-xs font-bold text-[var(--navy-900)] truncate">
                      {user.user_metadata?.full_name || 'CBSE Student'}
                    </p>
                    <p className="text-[10px] text-[var(--navy-400)] truncate">
                      {user.email || 'signed in'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenMyFeeds}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[var(--navy-800)] hover:bg-[var(--off-white)] flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-navy-600" />
                    <span>My Saved Feeds</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenSavedPosts}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[var(--navy-800)] hover:bg-[var(--off-white)] flex items-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-navy-600" />
                    <span>Saved Bookmarks</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenKeys}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[var(--navy-800)] hover:bg-[var(--off-white)] flex items-center gap-2"
                  >
                    <Key className="w-4 h-4 text-navy-600" />
                    <span>Manage API Keys</span>
                  </button>

                  <div className="border-t border-[var(--border)] my-1" />

                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[var(--red)] hover:bg-[var(--red-soft)] flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-full bg-[var(--white)] text-[var(--navy-900)] border border-[var(--border)] hover:border-[var(--navy-600)] hover:shadow-sm transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
