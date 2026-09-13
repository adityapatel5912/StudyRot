import React, { useState } from 'react';
import MathText from './MathText.jsx';

export default function ReviewCard({ card, onRate, isSandbox = false }) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) return null;

  const retrievability = card.retrievability_pct ?? 75;
  const badgeColor =
    retrievability < 50
      ? 'bg-red-100 text-red-800 border-red-300'
      : retrievability < 70
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const handleRating = (rating) => {
    setIsFlipped(false);
    onRate(rating);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-[var(--border)] shadow-md overflow-hidden flex flex-col min-h-[360px] animate-in zoom-in-95">
      {/* Header with subject badge and exam retrievability */}
      <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--off-white)] flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--navy-900)]">
          {card.subject || 'Science'} • Class {card.grade || 10}
        </span>
        <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badgeColor}`}>
          {retrievability}% by exam day
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--navy-400)]">
          {card.topic || 'CBSE Recall Drill'}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-[var(--navy-900)] leading-snug max-w-sm">
          <MathText text={card.title || card.fact || ''} />
        </h3>

        {isFlipped ? (
          <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[var(--navy-800)] leading-relaxed animate-in fade-in">
            <MathText text={card.fact || card.body || card.explanation || 'Verified NCERT Concept'} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="px-4 py-2 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-xs"
          >
            Reveal Answer / Formula 👁️
          </button>
        )}
      </div>

      {/* Rating actions bar */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--off-white)]">
        {isFlipped ? (
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleRating(1)}
              className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-center transition"
            >
              <div className="text-base">😵</div>
              <div className="text-[10px] font-bold mt-0.5">Forgot</div>
              <div className="text-[9px] opacity-75">10 min</div>
            </button>
            <button
              type="button"
              onClick={() => handleRating(2)}
              className="p-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-center transition"
            >
              <div className="text-base">😕</div>
              <div className="text-[10px] font-bold mt-0.5">Hard</div>
              <div className="text-[9px] opacity-75">1 day</div>
            </button>
            <button
              type="button"
              onClick={() => handleRating(3)}
              className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 text-center transition"
            >
              <div className="text-base">🙂</div>
              <div className="text-[10px] font-bold mt-0.5">Good</div>
              <div className="text-[9px] opacity-75">3 days</div>
            </button>
            <button
              type="button"
              onClick={() => handleRating(4)}
              className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-center transition"
            >
              <div className="text-base">😎</div>
              <div className="text-[10px] font-bold mt-0.5">Easy</div>
              <div className="text-[9px] opacity-75">7 days</div>
            </button>
          </div>
        ) : (
          <div className="text-center text-[11px] text-[var(--navy-400)] py-1">
            Think of the answer first, then tap Reveal to rate your recall.
          </div>
        )}
      </div>
    </div>
  );
}
