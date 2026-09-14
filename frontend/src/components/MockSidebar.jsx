import React from 'react';
import { Bookmark, CheckCircle, AlertCircle, Circle } from 'lucide-react';

export default function MockSidebar({
  sections = [],
  activeSectionId,
  onSelectSection,
  currentQuestionIndex,
  onSelectQuestion,
  answers = {},
  markedForReview = {},
  visitedQuestions = {},
  onToggleMarkForReview,
}) {
  // Compute overall question list with section context
  let flatQuestions = [];
  sections.forEach((sec) => {
    (sec.questions || []).forEach((q, idx) => {
      flatQuestions.push({
        ...q,
        sectionId: sec.id,
        sectionName: sec.name,
      });
    });
  });

  const getQuestionState = (qId, qIdx) => {
    const isMarked = !!markedForReview[qId];
    const isAnswered = answers[qId] !== undefined && String(answers[qId]).trim() !== '';
    const isVisited = !!visitedQuestions[qId] || qIdx === currentQuestionIndex;

    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (isVisited) return 'unanswered';
    return 'unvisited';
  };

  const currentQ = flatQuestions[currentQuestionIndex];
  const isCurrentMarked = currentQ ? !!markedForReview[currentQ.id] : false;

  return (
    <aside className="w-full lg:w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Section Switcher Tabs */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Sections
        </div>
        <div className="flex flex-wrap gap-1">
          {sections.map((sec) => {
            const isSecActive = sec.id === activeSectionId;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  isSecActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                }`}
              >
                {sec.name || sec.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Palette Legend */}
      <div className="grid grid-cols-2 gap-1.5 p-3 text-[11px] border-b border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Marked Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Not Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>Not Visited</span>
        </div>
      </div>

      {/* Question Number Palette Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Question Palette
        </div>
        <div className="grid grid-cols-5 gap-2">
          {flatQuestions.map((q, idx) => {
            const state = getQuestionState(q.id, idx);
            const isCurrent = idx === currentQuestionIndex;

            let badgeClass = 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
            if (state === 'answered') badgeClass = 'bg-emerald-500 text-white font-bold';
            else if (state === 'marked') badgeClass = 'bg-amber-400 text-slate-900 font-bold ring-2 ring-amber-300';
            else if (state === 'unanswered') badgeClass = 'bg-rose-500 text-white font-bold';

            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs transition relative ${badgeClass} ${
                  isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800 scale-105 shadow' : 'hover:opacity-85'
                }`}
                title={`Q${idx + 1}: ${q.type || 'Question'} (${q.marks || 1} mark)`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions: Mark for Review */}
      {currentQ && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => onToggleMarkForReview(currentQ.id)}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              isCurrentMarked
                ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isCurrentMarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isCurrentMarked ? 'Unmark Review' : 'Mark for Review'}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
