import React from 'react';
import MathText from './MathText.jsx';
import BotBadge from './BotBadge.jsx';

export default function SoloBattleArena({
  question,
  questionIndex = 0,
  totalQuestions = 8,
  timerSeconds = 15,
  selectedOption = null,
  hasSubmitted = false,
  roundResult = null,
  leaderboard = [],
  commentary = '',
  onSubmitAnswer,
}) {
  if (!question) return null;

  const isReveal = Boolean(roundResult);
  const correctOptionIdx = roundResult?.correct_index;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Top bar: Question indicator, Timer, Commentary */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--border)] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[var(--navy-600)]">
            Q{questionIndex + 1}/{totalQuestions}
          </span>
          {commentary && (
            <div className="text-xs font-semibold text-[var(--navy-900)] px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 truncate max-w-[280px] sm:max-w-md">
              {commentary}
            </div>
          )}
        </div>

        {/* 15s Timer */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-bold text-slate-500">⏱️</span>
          <span className={`text-sm font-black tabular-nums ${
            timerSeconds <= 5 ? 'text-red-600 animate-pulse' : 'text-[var(--navy-900)]'
          }`}>
            {timerSeconds}s
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-md space-y-6 animate-in fade-in">
        <h3 className="text-base sm:text-lg font-bold text-[var(--navy-900)] leading-snug">
          <MathText text={question.question || ''} />
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(question.options || []).map((opt, idx) => {
            const isSelected = selectedOption === idx;
            let btnStyle = 'bg-white border-[var(--border)] text-[var(--navy-900)] hover:border-[var(--navy-900)]';

            if (isReveal) {
              if (idx === correctOptionIdx) {
                btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400';
              } else if (isSelected) {
                btnStyle = 'bg-red-100 border-red-400 text-red-950 font-bold';
              } else {
                btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              btnStyle = 'bg-[var(--navy-900)] text-white border-[var(--navy-900)] font-bold';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={hasSubmitted}
                onClick={() => onSubmitAnswer(idx)}
                className={`p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-2.5 ${btnStyle}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">
                  <MathText text={opt} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation on Reveal */}
        {isReveal && roundResult?.explanation && (
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 leading-relaxed animate-in fade-in">
            <span className="font-bold block mb-1">💡 CBSE Marking Rationale:</span>
            <MathText text={roundResult.explanation} />
          </div>
        )}
      </div>

      {/* Live Round Activity & Leaderboard */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[var(--navy-800)] uppercase tracking-wider">
          Live Standings
        </h4>

        <div className="space-y-2">
          {leaderboard.map((p, rank) => {
            const isUser = p.is_user;
            const botData = roundResult?.bots?.find((b) => b.bot_id === p.id);

            return (
              <div
                key={p.id}
                className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  isUser
                    ? 'bg-amber-50/60 border-amber-300 font-bold text-[var(--navy-900)]'
                    : 'bg-[var(--off-white)] border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 w-4">#{rank + 1}</span>
                  <span className="text-sm">{isUser ? '👤' : (botData?.avatar || '🤖')}</span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">
                    {p.name}
                  </span>
                  {!isUser && <BotBadge />}
                  {p.streak >= 2 && (
                    <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded font-bold">
                      {p.streak}x 🔥
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Staggered answer reveal badge */}
                  {isReveal && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {p.is_correct ? `+${p.points_this_round}` : 'Missed'}
                    </span>
                  )}
                  <span className="font-mono font-bold text-[var(--navy-900)]">
                    {p.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
