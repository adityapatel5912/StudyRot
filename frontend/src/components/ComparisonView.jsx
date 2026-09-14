import React, { useState } from 'react';
import MathText from './MathText.jsx';
import StepGradeCard from './StepGradeCard.jsx';
import { Columns, SplitSquareVertical } from 'lucide-react';

export default function ComparisonView({ report, imageB64 }) {
  const [activeTab, setActiveTab] = useState('side_by_side'); // 'side_by_side' or 'steps_only'

  if (!report) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* View Toggle Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Solution Diagnostic View
        </span>
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('side_by_side')}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'side_by_side'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Side-by-Side
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps_only')}
            className={`px-3 py-1 rounded-md transition ${
              activeTab === 'steps_only'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Steps Breakdown
          </button>
        </div>
      </div>

      {activeTab === 'side_by_side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Original Photo Preview */}
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              Your Uploaded Photo:
            </span>
            <div className="w-full h-80 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
              {imageB64 ? (
                <img
                  src={imageB64.startsWith('data:') ? imageB64 : `data:image/jpeg;base64,${imageB64}`}
                  alt="Student work"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-xs text-slate-500">Sample problem demonstration</div>
              )}
            </div>
          </div>

          {/* Right: Step-by-Step Diagnostic Cards */}
          <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              CBSE Step Evaluation:
            </span>
            {(report.steps || []).map((step, idx) => (
              <StepGradeCard key={idx} step={step} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {(report.steps || []).map((step, idx) => (
            <StepGradeCard key={idx} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}
