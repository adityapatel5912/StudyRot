import React from 'react';
import { useReview } from '../contexts/ReviewProvider.jsx';

export default function WeaknessReport({ onStartDrill }) {
  const { weakness } = useReview();

  // Rule: Only appears after 10+ wrong answers. Otherwise hidden entirely.
  if (!weakness || !weakness.unlocked || !weakness.report) {
    return null;
  }

  const r = weakness.report;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-sm animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-950 flex items-center justify-center text-xl flex-shrink-0">
          🎯
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--navy-900)]">
              AI Diagnostic Weakness Report: {r.title}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
              {r.top_error_type.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-[var(--navy-700)] leading-relaxed">
            {r.summary}
          </p>
          <div className="p-3 rounded-xl bg-white/80 border border-amber-200 text-xs font-medium text-[var(--navy-900)]">
            💡 {r.recommended_fix}
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onStartDrill && onStartDrill(r.drill_topic, r.drill_subject)}
              className="px-4 py-2 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-xs flex items-center gap-1.5"
            >
              <span>Launch 5-Min Drill</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
