import React from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import Quiz from './Quiz.jsx';

export default function FullScreenQuiz({
  quiz,
  seconds = 20,
  soundEnabled = true,
  onToggleSound,
  onClose,
  currentIndex = 0,
  totalPosts = 15,
}) {
  if (!quiz) return null;

  return (
    <div
      className="fullscreen-quiz-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen CBSE Quiz"
    >
      <div className="fullscreen-quiz-card">
        {/* Top Bar: Close button left, Counter centered, Mute toggle right */}
        <div className="fullscreen-topbar">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--navy-700)] hover:text-[var(--navy-900)] p-2 rounded-full border border-[var(--border)] transition"
            aria-label="Close Fullscreen Quiz"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>

          <span className="text-xs font-bold text-[var(--navy-600)] px-3 py-1 rounded-full bg-[var(--off-white)] border border-[var(--border)]">
            {currentIndex + 1} / {totalPosts}
          </span>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-full border border-[var(--border)] bg-[var(--off-white)] hover:bg-[#eef3fc] text-[var(--navy-700)] transition"
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-navy-400" />
            )}
          </button>
        </div>

        {/* Quiz card content */}
        <div className="w-full">
          <Quiz
            quiz={quiz}
            seconds={seconds}
            soundEnabled={soundEnabled}
            isFullscreen={true}
          />
        </div>
      </div>
    </div>
  );
}
