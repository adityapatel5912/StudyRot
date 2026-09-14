import React from 'react';
import MathText from './MathText.jsx';
import AnswerEditor from './AnswerEditor.jsx';
import MapQuestion from './MapQuestion.jsx';
import { HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function MockQuestion({
  question,
  questionNumber,
  answer,
  onAnswerChange,
}) {
  if (!question) return null;

  const qType = question.type || 'MCQ';
  const marks = question.marks || 1;

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Question Header Card */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            Question {questionNumber}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {qType}
          </span>
          {question.chapter && (
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
              • {question.chapter}
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
          [{marks} {marks === 1 ? 'Mark' : 'Marks'}]
        </div>
      </div>

      {/* Case Study Passage (if present) */}
      {question.passage && (
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            <span>Case Study Passage</span>
          </div>
          <p className="whitespace-pre-line font-serif">{question.passage}</p>
        </div>
      )}

      {/* Question Statement */}
      <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
        <MathText>{question.question}</MathText>
      </div>

      {/* Answer Input Area based on Question Type */}
      <div className="mt-2">
        {qType === 'MCQ' && (
          <div className="flex flex-col gap-2.5">
            {(question.options || []).map((opt, idx) => {
              const isSelected = String(answer).trim().toLowerCase() === String(opt).trim().toLowerCase();
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

              return (
                <label
                  key={idx}
                  onClick={() => onAnswerChange(opt)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {optionLetter}
                  </div>
                  <div className="text-sm text-slate-800 dark:text-slate-100 flex-1 pt-0.5">
                    <MathText>{opt}</MathText>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />}
                </label>
              );
            })}
          </div>
        )}

        {qType === 'Map' && (
          <MapQuestion
            question={question}
            selectedRegions={Array.isArray(answer) ? answer : answer ? [answer] : []}
            onSelectRegion={(regs) => onAnswerChange(regs)}
          />
        )}

        {(qType === 'SA1' || qType === 'SA2' || qType === 'LA' || qType === 'Case') && (
          <AnswerEditor
            value={answer || ''}
            onChange={(val) => onAnswerChange(val)}
            placeholder={`Type your detailed ${qType} answer according to CBSE steps... LaTeX formulas are supported.`}
          />
        )}
      </div>
    </div>
  );
}
