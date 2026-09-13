import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReview } from '../contexts/ReviewProvider.jsx';
import ExamDatePrompt from './ExamDatePrompt.jsx';

export default function DailyReviewCard({ onOpenSandbox }) {
  const navigate = useNavigate();
  const { examDate, reviewCount, queue, cutoffs } = useReview();
  const [showPrompt, setShowPrompt] = useState(false);

  // Rule 2: Daily Review card ONLY appears after student has (a) set an exam date and (b) completed at least one review session.
  const isUnlocked = Boolean(examDate) && reviewCount > 0;

  if (!isUnlocked) {
    return (
      <>
        <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-white border border-[var(--border)] shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl">
              📅
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--navy-900)]">
                Daily Review Locked
              </h4>
              <p className="text-[11px] text-[var(--navy-600)]">
                {examDate
                  ? "Complete your first feed review to unlock daily spaced repetition."
                  : "Set your exam date to unlock daily review."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onOpenSandbox && (
              <button
                type="button"
                onClick={onOpenSandbox}
                className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition"
              >
                Try Sandbox
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPrompt(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-xs"
            >
              {examDate ? "Edit Exam Date" : "Set Exam Date →"}
            </button>
          </div>
        </div>
        <ExamDatePrompt isOpen={showPrompt} onClose={() => setShowPrompt(false)} />
      </>
    );
  }

  const queueCount = queue.length;
  const estimatedMin = Math.max(2, Math.round(queueCount * 0.8));
  const isExamMode = cutoffs?.is_exam_mode;

  return (
    <>
      <div className={`w-full max-w-2xl mx-auto mb-6 p-5 rounded-2xl border shadow-sm ${
        isExamMode
          ? 'bg-red-50/80 border-red-200'
          : 'bg-white border-[var(--border)]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">{isExamMode ? '🚨' : '🧠'}</span>
              <h3 className="text-sm font-bold text-[var(--navy-900)]">
                {isExamMode ? 'CBSE Exam Mode Active' : "Today's Daily Review Queue"}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                FSRS-6 Active
              </span>
            </div>
            <p className="text-xs text-[var(--navy-600)]">
              {queueCount > 0
                ? `${queueCount} concepts due today (~${estimatedMin} mins) ordered by exam-day marginal recall gain.`
                : "You're all caught up for today! Add new feed cards or check formula sheets."}
            </p>

            {/* Cutoff indicators */}
            {cutoffs?.subjects && (
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.values(cutoffs.subjects).map((s) => (
                  <span
                    key={s.subject}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                      s.is_behind
                        ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {s.subject}: {s.status_text}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowPrompt(true)}
              className="text-[11px] text-[var(--navy-400)] hover:text-[var(--navy-800)] underline px-2"
              title="Change exam date"
            >
              Target: {examDate}
            </button>
            <button
              type="button"
              onClick={() => navigate('/review')}
              className="px-4 py-2 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-sm"
            >
              Start Review →
            </button>
          </div>
        </div>
      </div>
      <ExamDatePrompt isOpen={showPrompt} onClose={() => setShowPrompt(false)} />
    </>
  );
}
