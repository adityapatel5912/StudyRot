import React, { useState } from 'react';
import MathText from './MathText.jsx';

export default function AnswerEditor({ value = '', onChange, placeholder = 'Type your answer here... You can write formulas using LaTeX e.g. \\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}' }) {
  const [showPreview, setShowPreview] = useState(true);

  const quickSymbols = [
    { label: '½', latex: '\\frac{a}{b}' },
    { label: '√x', latex: '\\sqrt{x}' },
    { label: 'x²', latex: 'x^2' },
    { label: 'θ', latex: '\\theta' },
    { label: 'Ω', latex: '\\Omega' },
    { label: '±', latex: '\\pm' },
    { label: '→', latex: '\\to' },
    { label: 'Δ', latex: '\\Delta' },
    { label: '°', latex: '^\\circ' },
  ];

  const handleInsert = (symbol) => {
    const newVal = value ? `${value} $${symbol}$ ` : `$${symbol}$ `;
    onChange(newVal);
  };

  return (
    <div className="w-full flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
      {/* Formatting & Quick Insert Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-slate-400 font-medium mr-1">Insert Math:</span>
          {quickSymbols.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleInsert(s.latex)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-mono text-xs transition"
              title={`Insert ${s.latex}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-xs ml-auto"
        >
          {showPreview ? 'Hide Live Math Preview' : 'Show Live Math Preview'}
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans resize-y"
      />

      {/* Live KaTeX Math Preview */}
      {showPreview && value && (
        <div className="mt-1 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs">
          <div className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px] mb-1">
            Rendered Math Preview:
          </div>
          <div className="text-slate-800 dark:text-slate-100 font-serif leading-relaxed">
            <MathText>{value}</MathText>
          </div>
        </div>
      )}
    </div>
  );
}
