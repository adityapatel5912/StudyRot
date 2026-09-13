import React, { useState } from 'react';
import { useReview } from '../contexts/ReviewProvider.jsx';

export default function ExamDatePrompt({ isOpen, onClose }) {
  const { examDate, saveExamDate } = useReview();
  const [selectedDate, setSelectedDate] = useState(examDate || '2027-02-20');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDate) {
      saveExamDate(selectedDate);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden p-6 space-y-5 animate-in zoom-in-95">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center text-2xl mx-auto">
            📅
          </div>
          <h3 className="text-base font-bold text-[var(--navy-900)]">
            When is your Board Exam?
          </h3>
          <p className="text-xs text-[var(--navy-600)] leading-relaxed">
            StudyRot uses the FSRS-6 algorithm to work backward from your exam date, scheduling exact daily cards to guarantee peak recall on exam morning.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--navy-800)] mb-1.5">
              Target Exam Date (CBSE 2027 window)
            </label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--off-white)] text-sm font-semibold text-[var(--navy-900)] focus:ring-2 focus:ring-[var(--navy-600)] outline-none"
            />
            <p className="text-[11px] text-[var(--navy-400)] mt-1">
              Suggested default: Feb 20, 2027 (CBSE Class 10/12 Science)
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-sm"
            >
              Lock In Exam Date →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
