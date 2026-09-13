import React, { useState } from 'react';
import MathText from './MathText.jsx';
import { Check, X, BookmarkPlus, Volume2, Sparkles } from 'lucide-react';
import { useTTS } from '../hooks/useTTS.js';

export default function PracticeCard({ practice, subject = 'Science', grade = 10, voice = 'teacher' }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const { speak } = useTTS();

  if (!practice || !practice.question) return null;

  const { question, options = [], correct_idx = 0, explanation = '' } = practice;
  const isAnswered = selectedIdx !== null;
  const isCorrect = selectedIdx === correct_idx;

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
  };

  const handleSaveToReview = () => {
    try {
      const savedCards = JSON.parse(localStorage.getItem('studyrot_custom_reviews') || '[]');
      savedCards.push({
        id: `practice_${Date.now()}`,
        card_id: `card_prac_${Date.now()}`,
        question,
        options,
        correct_idx,
        explanation,
        subject,
        grade,
        savedAt: Date.now(),
      });
      localStorage.setItem('studyrot_custom_reviews', JSON.stringify(savedCards));
      setIsSaved(true);
    } catch (e) {
      console.warn('Failed to save practice card:', e);
    }
  };

  return (
    <div className="my-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            CBSE Follow-Up MCQ
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700">
          Class {grade} · {subject}
        </span>
      </div>

      {/* Question */}
      <div className="text-sm font-semibold text-slate-900 mb-3 leading-snug">
        <MathText>{question}</MathText>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          let btnStyle = 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-800';

          if (isAnswered) {
            if (idx === correct_idx) {
              btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
            } else if (idx === selectedIdx) {
              btnStyle = 'bg-red-100 border-red-400 text-red-950';
            } else {
              btnStyle = 'bg-white/60 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex-shrink-0">
                {letter}
              </span>
              <span className="flex-1">
                <MathText>{opt}</MathText>
              </span>
              {isAnswered && idx === correct_idx && (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[3]" />
              )}
              {isAnswered && idx === selectedIdx && idx !== correct_idx && (
                <X className="w-4 h-4 text-red-600 flex-shrink-0 stroke-[3]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Explanation */}
      {isAnswered && (
        <div className="mt-3 pt-3 border-t border-emerald-200/60 animate-in fade-in space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">
                {isCorrect ? '🎉 Correct! Well done.' : '💡 Explanation:'}
              </span>
              <MathText>{explanation}</MathText>
            </div>
            {explanation && (
              <button
                type="button"
                onClick={() => speak(explanation, { voice })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition flex-shrink-0"
                title="Listen to explanation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleSaveToReview}
              disabled={isSaved}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Added to Spaced Review ✓' : 'Add to Daily Spaced Review'}</span>
            </button>
            <span className="text-[10px] text-slate-500">FSRS Retention Boost</span>
          </div>
        </div>
      )}
    </div>
  );
}
