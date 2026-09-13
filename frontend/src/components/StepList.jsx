import React from 'react';
import MathText from './MathText.jsx';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { useTTS } from '../hooks/useTTS.js';

export default function StepList({ steps = [], voice = 'teacher' }) {
  const { speak, isPlaying, currentText, stop } = useTTS();

  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full my-4 space-y-4">
      <h3 className="text-xs font-bold text-[var(--navy-800)] uppercase tracking-wider flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Step-by-Step CBSE Solution</span>
      </h3>

      <div className="relative pl-6 space-y-4 border-l-2 border-emerald-200 ml-3">
        {steps.map((rawStep, idx) => {
          const stepNum = idx + 1;
          const stepText = typeof rawStep === 'object' && rawStep !== null
            ? `${rawStep.text || rawStep.description || ''}${rawStep.latex ? ` $$${String(rawStep.latex).replace(/^\$+|\$+$/g, '')}$$` : ''}`
            : String(rawStep || '');

          const isThisPlaying = isPlaying && currentText === stepText;

          return (
            <div key={idx} className="relative group">
              {/* Step number badge pinned to vertical timeline */}
              <div className="absolute -left-[35px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-sm ring-4 ring-white">
                {stepNum}
              </div>

              {/* Step Content Card */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm transition hover:shadow-md hover:border-emerald-300">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm text-slate-800 leading-relaxed flex-1">
                    <MathText>{stepText}</MathText>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isThisPlaying) {
                        stop();
                      } else {
                        speak(stepText, { voice });
                      }
                    }}
                    title="Listen to this step"
                    className={`p-1.5 rounded-full transition flex-shrink-0 ${
                      isThisPlaying
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
