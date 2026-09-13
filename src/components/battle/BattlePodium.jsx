/** Classroom Battle final celebration podium displaying top three winners, scoreboard, and rematch actions. */
import React from 'react';
import { Trophy, Medal, Award, RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BattlePodium({
  leaderboard = [],
  onPlayAgain,
  onExit,
  topicTitle = 'NCERT Chapter Battle',
  totalQuestions = 5,
}) {
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6" id="battle-podium-view">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Battle Champions Podium</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
          {topicTitle}
        </h1>
        <p className="text-xs sm:text-sm text-navy-500 mt-1">
          Final Results · {totalQuestions} NCERT Board Questions
        </p>
      </div>

      {/* 3-Step Podium (2nd | 1st | 3rd) */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10 max-w-lg mx-auto pt-6">
        {/* 2nd Place (Silver) */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-center mb-2">
            <Medal className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-bold text-navy-900 truncate max-w-[90px] sm:max-w-[120px]">
              {top2 ? top2.name : '—'}
            </p>
            <p className="text-[11px] font-mono text-navy-500 font-semibold">
              {top2 ? `${top2.score} pts` : ''}
            </p>
          </div>
          <div className="w-full h-28 sm:h-32 bg-gradient-to-t from-slate-200 to-slate-100 border border-slate-300 rounded-t-xl flex items-center justify-center shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-slate-600 font-mono">2</span>
          </div>
        </div>

        {/* 1st Place (Gold - Center, Tallest) */}
        <div className="flex-1 flex flex-col items-center -mt-6">
          <div className="text-center mb-2">
            <Trophy className="w-9 h-9 text-amber-500 mx-auto mb-1 animate-bounce" />
            <p className="text-sm sm:text-base font-extrabold text-navy-900 truncate max-w-[100px] sm:max-w-[130px]">
              {top1 ? top1.name : '—'}
            </p>
            <p className="text-xs font-mono text-amber-700 font-bold">
              {top1 ? `${top1.score} pts` : ''}
            </p>
          </div>
          <div className="w-full h-36 sm:h-44 bg-gradient-to-t from-amber-300 to-amber-200 border border-amber-400 rounded-t-xl flex items-center justify-center shadow-md">
            <span className="text-3xl sm:text-4xl font-black text-amber-800 font-mono">1</span>
          </div>
        </div>

        {/* 3rd Place (Bronze) */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-center mb-2">
            <Award className="w-6 h-6 text-amber-700 mx-auto mb-1" />
            <p className="text-xs sm:text-sm font-bold text-navy-900 truncate max-w-[90px] sm:max-w-[120px]">
              {top3 ? top3.name : '—'}
            </p>
            <p className="text-[11px] font-mono text-navy-500 font-semibold">
              {top3 ? `${top3.score} pts` : ''}
            </p>
          </div>
          <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-orange-200 to-amber-100 border border-amber-300 rounded-t-xl flex items-center justify-center shadow-sm">
            <span className="text-2xl sm:text-3xl font-black text-amber-900 font-mono">3</span>
          </div>
        </div>
      </div>

      {/* Full Scoreboard Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-3">
          Classroom Leaderboard
        </h2>

        <div className="divide-y divide-gray-100">
          {leaderboard.map((p, idx) => (
            <div
              key={idx}
              className="py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-navy-400 font-mono">
                  #{idx + 1}
                </span>
                <span className="text-navy-900 truncate max-w-[180px] sm:max-w-[280px]">
                  {p.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {typeof p.correctCount === 'number' && (
                  <span className="text-navy-400 text-xs hidden sm:inline">
                    {p.correctCount}/{totalQuestions} correct
                  </span>
                )}
                <span className="font-mono font-bold text-navy-900">
                  {p.score || 0} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onPlayAgain && (
          <button
            type="button"
            id="battle-play-again-btn"
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        )}

        <button
          type="button"
          id="battle-exit-btn"
          onClick={onExit}
          className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-navy-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Study Feed</span>
        </button>
      </div>
    </div>
  );
}
