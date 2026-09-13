/** Classroom Battle active question screen with synchronized timer, KaTeX math parsing, and high-contrast option cards. */
import React, { useState, useEffect } from 'react';
import MathText from '../MathText.jsx';

const OPTION_STYLES = [
  { letter: 'A', symbol: '▲', colorClass: 'bg-red-600 hover:bg-red-700 text-white border-red-700', activeClass: 'ring-4 ring-red-400 bg-red-700' },
  { letter: 'B', symbol: '■', colorClass: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700', activeClass: 'ring-4 ring-blue-400 bg-blue-700' },
  { letter: 'C', symbol: '●', colorClass: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700', activeClass: 'ring-4 ring-amber-400 bg-amber-700' },
  { letter: 'D', symbol: '◆', colorClass: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700', activeClass: 'ring-4 ring-emerald-400 bg-emerald-700' },
];

export default function BattleQuestion({
  question,
  questionIndex = 0,
  totalQuestions = 5,
  timeLeft = 15,
  totalTime = 15,
  onSubmitAnswer,
  selectedAnswer = null,
  disabled = false,
  soundEnabled = true,
}) {
  const [localPicked, setLocalPicked] = useState(selectedAnswer);
  const options = question?.options || [];

  useEffect(() => {
    setLocalPicked(selectedAnswer);
  }, [selectedAnswer, questionIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (localPicked || disabled) return;
      const key = e.key.toUpperCase();
      let pickedIdx = -1;
      if (key === '1' || key === 'A') pickedIdx = 0;
      else if (key === '2' || key === 'B') pickedIdx = 1;
      else if (key === '3' || key === 'C') pickedIdx = 2;
      else if (key === '4' || key === 'D') pickedIdx = 3;

      if (pickedIdx >= 0 && pickedIdx < options.length) {
        handleOptionClick(options[pickedIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localPicked, disabled, options]);

  const handleOptionClick = (option) => {
    if (localPicked || disabled) return;
    setLocalPicked(option);
    onSubmitAnswer?.(option);
  };

  const timerPct = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  const isUrgent = timeLeft <= 5;
  const isCritical = timeLeft <= 2;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6" id="battle-question-view">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-navy-900 text-white text-xs font-bold font-mono">
            Question {questionIndex + 1} / {totalQuestions}
          </span>
          {question?.grade && (
            <span className="text-xs text-navy-500 font-semibold">
              Class {question.grade} • {question.subject || 'NCERT'}
            </span>
          )}
        </div>

        <div
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full font-mono font-black text-sm sm:text-base border transition-colors ${
            isCritical
              ? 'bg-red-600 text-white border-red-700 animate-pulse'
              : isUrgent
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white text-navy-900 border-gray-200'
          }`}
          aria-live="polite"
          aria-label={`Time remaining: ${timeLeft} seconds`}
        >
          <span>⏱️</span>
          <span>{timeLeft}s</span>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isCritical ? 'bg-red-600' : isUrgent ? 'bg-amber-500' : 'bg-navy-700'
          }`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6 text-center">
        <h2 className="text-lg sm:text-2xl font-bold text-navy-900 leading-snug">
          <MathText>{question?.question || 'Preparing next question...'}</MathText>
        </h2>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        role="radiogroup"
        aria-label="Quiz Battle Options"
      >
        {options.map((option, idx) => {
          const config = OPTION_STYLES[idx % OPTION_STYLES.length];
          const isChosen = localPicked === option;

          return (
            <button
              key={idx}
              type="button"
              id={`battle-opt-${idx}`}
              onClick={() => handleOptionClick(option)}
              disabled={Boolean(localPicked) || disabled}
              className={`min-h-[72px] sm:min-h-[84px] p-4 rounded-xl border flex items-center gap-3.5 text-left font-semibold text-sm sm:text-base shadow-sm transition-all transform active:scale-95 ${
                config.colorClass
              } ${
                isChosen ? config.activeClass + ' scale-102 shadow-md' : ''
              } ${
                localPicked && !isChosen ? 'opacity-50 grayscale-20' : ''
              }`}
              role="radio"
              aria-checked={isChosen}
              aria-label={`Option ${config.letter}: ${option}`}
            >
              <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                <span className="mr-1 opacity-75 text-xs">{config.symbol}</span>
                <span>{config.letter}</span>
              </div>
              <div className="flex-1 leading-snug">
                <MathText>{option}</MathText>
              </div>
            </button>
          );
        })}
      </div>

      {localPicked && (
        <div className="mt-6 text-center p-3 rounded-xl bg-navy-50 border border-navy-200 text-navy-900 text-xs sm:text-sm font-semibold animate-in fade-in">
          🔒 Answer locked in! Waiting for all classmates to submit or time to expire...
        </div>
      )}
    </div>
  );
}
