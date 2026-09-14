import React, { useState, useEffect } from 'react';
import MathText from './MathText.jsx';
import confetti from 'canvas-confetti';
import { Clock, CheckCircle2, XCircle, Award, Trophy } from 'lucide-react';

export default function GroupQuizPanel({
  quizState,
  onSelectAnswer,
  currentPlayerId,
}) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(20);

  // Reset local answer selection when a new question arrives
  useEffect(() => {
    setSelectedIdx(null);
  }, [quizState?.question_index]);

  // Client countdown timer sync
  useEffect(() => {
    if (!quizState?.deadline_ms) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((quizState.deadline_ms - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [quizState?.deadline_ms]);

  // Trigger confetti when quiz reveals high accuracy or finishes
  useEffect(() => {
    if (quizState?.reveal && quizState.combined_accuracy >= 66) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
  }, [quizState?.reveal]);

  if (!quizState || (!quizState.question && !quizState.reveal && !quizState.finished)) return null;

  // Final Finished Screen
  if (quizState.finished) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-2xl flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
            Group Quiz Completed!
          </div>
          <h3 className="text-2xl font-black mt-1">Room MVP: {quizState.mvp}</h3>
          <p className="text-xs text-indigo-200 mt-1">
            Top Score: {quizState.high_score} points
          </p>
        </div>
      </div>
    );
  }

  const { question, question_index, total_questions, reveal } = quizState;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-xl flex flex-col gap-4">
      {/* Top Header: Question Index & Countdown Timer */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            Quiz Question {Number(question_index) + 1} of {total_questions || 3}
          </span>
        </div>

        {/* Countdown Ring */}
        {!reveal && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs border border-amber-200 dark:border-amber-800 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>{secondsRemaining}s left</span>
          </div>
        )}
      </div>

      {/* Question Text */}
      <div className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
        <MathText>{question?.text || 'Loading question...'}</MathText>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2">
        {(question?.options || []).map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = reveal && idx === quizState.correct_idx;
          const isWrongSelection = reveal && isSelected && !isCorrect;

          let btnClass = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 hover:bg-slate-100';
          if (isSelected && !reveal) {
            btnClass = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500';
          } else if (isCorrect) {
            btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500 font-bold';
          } else if (isWrongSelection) {
            btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 ring-1 ring-rose-400';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={!!reveal}
              onClick={() => {
                setSelectedIdx(idx);
                onSelectAnswer(question_index, idx);
              }}
              className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition ${btnClass}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <MathText>{opt}</MathText>
              </div>
              {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {isWrongSelection && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Reveal Summary: Per-player chips and combined accuracy */}
      {reveal && (
        <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between font-bold">
            <span className="text-slate-600 dark:text-slate-300">Room Performance:</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-sm">
              {quizState.combined_accuracy}% Combined Accuracy
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(quizState.per_player_results || {}).map(([pid, p]) => (
              <span
                key={pid}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border ${
                  p.is_correct
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                <span>{p.nickname}</span>
                {p.is_correct ? '✓' : '✗'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
