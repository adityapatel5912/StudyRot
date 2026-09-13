/** Classroom Battle answer reveal screen showcasing accuracy, speed points, KaTeX explanation, and live standings. */
import React from 'react';
import MathText from '../MathText.jsx';
import { CheckCircle2, XCircle, Trophy, ArrowRight, Clock } from 'lucide-react';

export default function BattleReveal({
  question,
  userAnswer,
  isCorrect,
  pointsEarned = 0,
  streak = 0,
  leaderboard = [],
  nextCountdown = 5,
  isHost = false,
  onNextQuestion,
  isLastQuestion = false,
}) {
  const correctAnswer = question?.answer;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6" id="battle-reveal-view">
      {/* Result Hero Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-center text-white mb-6 shadow-md transition-all ${
          isCorrect
            ? 'bg-gradient-to-br from-emerald-600 to-green-700'
            : 'bg-gradient-to-br from-red-600 to-rose-700'
        }`}
      >
        <div className="flex items-center justify-center mb-2">
          {isCorrect ? (
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-1">
          {isCorrect ? 'Outstanding! Correct' : 'Not Quite!'}
        </h1>

        {isCorrect ? (
          <div className="inline-flex items-center gap-2 bg-black/20 px-3.5 py-1 rounded-full text-sm font-extrabold tracking-wide text-amber-300">
            <span>+{pointsEarned} Points</span>
            {streak > 1 && <span>🔥 {streak} Streak!</span>}
          </div>
        ) : (
          <div className="text-xs text-white/90 mt-1">
            <span>Correct answer: </span>
            <span className="font-bold underline text-white">
              <MathText>{correctAnswer || ''}</MathText>
            </span>
          </div>
        )}
      </div>

      {/* Explanation Box */}
      {question?.explanation && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-1">
            📘 NCERT Concept Explanation
          </div>
          <p className="text-sm text-navy-800 leading-relaxed">
            <MathText>{question.explanation}</MathText>
          </p>
        </div>
      )}

      {/* Live Mini Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Arena Standings</span>
          </div>
          <span className="text-[11px] text-navy-500">Live points</span>
        </div>

        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((player, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition ${
                idx === 0
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-gray-50 border-gray-100 text-navy-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    idx === 0
                      ? 'bg-amber-400 text-navy-950'
                      : idx === 1
                      ? 'bg-gray-300 text-navy-900'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'text-navy-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  {player.name}
                </span>
              </div>
              <span className="font-mono font-bold text-navy-700">
                {player.score || 0} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Question Countdown / Host Next Button */}
      <div className="flex items-center justify-between p-4 bg-navy-900 text-white rounded-xl">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-navy-300 font-medium">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Next in {nextCountdown}s...</span>
        </div>

        {(isHost || onNextQuestion) && (
          <button
            type="button"
            onClick={onNextQuestion}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-bold text-xs sm:text-sm text-white transition shadow-sm"
          >
            <span>{isLastQuestion ? 'View Podium' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
