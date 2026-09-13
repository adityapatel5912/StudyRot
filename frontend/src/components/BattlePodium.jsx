import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import BotBadge from './BotBadge.jsx';

export default function BattlePodium({
  summary,
  onPlayAgain,
  onNewBattle,
  isSandbox = false,
}) {
  const podium = summary?.podium || [];
  const userWon = summary?.user_won;
  const userRank = summary?.user_rank || 1;

  useEffect(() => {
    if (userWon) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [userWon]);

  const handleShareResult = async () => {
    const text = `I just scored ${summary?.total_score || 0} pts against 3 bots in StudyRot Solo Battle! Can you beat my score?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StudyRot Solo Battle Result',
          text,
          url: window.location.origin,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  const firstPlace = podium[0];
  const secondPlace = podium[1];
  const thirdPlace = podium[2];

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-[var(--border)] shadow-xl text-center space-y-6 animate-in zoom-in-95">
      <div className="space-y-1">
        <span className="text-4xl">{userWon ? '🏆' : '🎯'}</span>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--navy-900)]">
          {summary?.podium_title || (userWon ? "You beat 3 bots!" : `Finished #${userRank} against 3 bots`)}
        </h2>
        <p className="text-xs text-[var(--navy-600)]">
          {userWon
            ? "Flawless reaction speed and accuracy across 8 NCERT questions!"
            : "Review missed concepts in your Spaced Repetition queue to sharpen recall."}
        </p>
      </div>

      {/* 3-Tier Podium */}
      <div className="grid grid-cols-3 gap-2 items-end pt-6 pb-4 h-56 max-w-md mx-auto">
        {/* 2nd Place */}
        {secondPlace && (
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">{secondPlace.avatar || (secondPlace.is_user ? '👤' : '🤖')}</span>
            <span className="text-xs font-bold text-[var(--navy-900)] truncate max-w-full">
              {secondPlace.name}
            </span>
            {!secondPlace.is_user && <BotBadge className="my-0.5" />}
            <span className="text-[10px] text-slate-500 font-mono">{secondPlace.score} pts</span>
            <div className="w-full h-24 bg-slate-200 rounded-t-2xl flex items-center justify-center font-black text-slate-600 text-lg border-t-4 border-slate-400 mt-2">
              2
            </div>
          </div>
        )}

        {/* 1st Place */}
        {firstPlace && (
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">{firstPlace.avatar || (firstPlace.is_user ? '👤' : '🤖')}</span>
            <span className="text-xs font-black text-[var(--navy-900)] truncate max-w-full">
              {firstPlace.name}
            </span>
            {!firstPlace.is_user && <BotBadge className="my-0.5" />}
            <span className="text-[10px] text-amber-600 font-bold font-mono">{firstPlace.score} pts</span>
            <div className="w-full h-36 bg-[var(--navy-900)] text-white rounded-t-2xl flex items-center justify-center font-black text-2xl border-t-4 border-amber-400 mt-2 shadow-md">
              1
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <div className="flex flex-col items-center">
            <span className="text-xl mb-1">{thirdPlace.avatar || (thirdPlace.is_user ? '👤' : '🤖')}</span>
            <span className="text-xs font-bold text-[var(--navy-900)] truncate max-w-full">
              {thirdPlace.name}
            </span>
            {!thirdPlace.is_user && <BotBadge className="my-0.5" />}
            <span className="text-[10px] text-slate-500 font-mono">{thirdPlace.score} pts</span>
            <div className="w-full h-16 bg-amber-100 rounded-t-2xl flex items-center justify-center font-black text-amber-800 text-base border-t-4 border-amber-300 mt-2">
              3
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="px-4 py-2 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-sm"
        >
          Play Again 🔁
        </button>
        <button
          type="button"
          onClick={handleShareResult}
          className="px-4 py-2 rounded-xl border border-[var(--border)] bg-white text-[var(--navy-900)] text-xs font-bold hover:bg-slate-50 transition"
        >
          Share Result 📤
        </button>
        <button
          type="button"
          onClick={onNewBattle}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[var(--navy-900)]"
        >
          Exit Battle
        </button>
      </div>
    </div>
  );
}
