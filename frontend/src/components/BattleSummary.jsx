import React from 'react';

export default function BattleSummary({ summary, onStartReview }) {
  if (!summary) return null;

  const wrongCount = (summary.wrong_questions || []).length;

  return (
    <div className="w-full max-w-xl mx-auto p-5 bg-white rounded-2xl border border-[var(--border)] shadow-xs space-y-4">
      <h3 className="text-xs font-bold text-[var(--navy-800)] uppercase tracking-wider">
        Battle Performance Metrics
      </h3>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Accuracy
          </span>
          <span className="text-lg font-black text-[var(--navy-900)]">
            {summary.accuracy_pct}%
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Fastest Answer
          </span>
          <span className="text-lg font-black text-[var(--navy-900)]">
            {summary.fastest_correct_ms ? `${(summary.fastest_correct_ms / 1000).toFixed(1)}s` : '—'}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">
            Total Score
          </span>
          <span className="text-lg font-black text-amber-600">
            {summary.total_score}
          </span>
        </div>
      </div>

      {wrongCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-amber-950 block">
              {wrongCount} concepts flagged for review
            </span>
            <span className="text-[11px] text-amber-800">
              Synced to your FSRS-6 spaced repetition queue.
            </span>
          </div>
          {onStartReview && (
            <button
              type="button"
              onClick={onStartReview}
              className="px-3 py-1.5 rounded-lg bg-[var(--navy-900)] text-white text-[11px] font-bold hover:bg-[var(--navy-800)] transition"
            >
              Review Now →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
