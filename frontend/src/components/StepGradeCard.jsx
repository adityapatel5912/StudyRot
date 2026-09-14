import React from 'react';
import MathText from './MathText.jsx';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function StepGradeCard({ step }) {
  if (!step) return null;

  const isCorrect = step.verdict === 'correct';

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col gap-2 transition text-xs ${
        isCorrect
          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
      }`}
    >
      {/* Header: Step Number & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="font-bold text-slate-800 dark:text-slate-100">
            Step {step.step_number}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
            isCorrect
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
          }`}
        >
          {isCorrect ? 'Correct Step' : 'Mistake Detected'}
        </span>
      </div>

      {/* Transcribed Student Work */}
      <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 font-mono text-slate-800 dark:text-slate-200">
        <MathText>{step.student_wrote}</MathText>
      </div>

      {/* Pedagogical Note / Diagnostic Explanation */}
      <div
        className={`leading-relaxed text-[11px] ${
          isCorrect
            ? 'text-emerald-800 dark:text-emerald-200'
            : 'text-rose-800 dark:text-rose-200 font-medium'
        }`}
      >
        {step.note}
      </div>
    </div>
  );
}
