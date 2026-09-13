import React from 'react';
import BotBadge from './BotBadge.jsx';

export default function SoloBattleLobby({ bots = [], isCountdown = false, countdownNumber = 3 }) {
  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white rounded-3xl border border-[var(--border)] shadow-xl text-center space-y-6 animate-in zoom-in-95">
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
          Matchup Lobby
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--navy-900)]">
          You vs. 3 Bots
        </h2>
        <p className="text-xs text-[var(--navy-600)]">
          8 CBSE MCQs • 15 seconds per question • Speed & accuracy score up to 1000 pts
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
        {/* User profile card */}
        <div className="p-3 rounded-2xl border-2 border-[var(--navy-900)] bg-[var(--off-white)] flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[var(--navy-900)] text-white flex items-center justify-center text-xl mb-2">
            👤
          </div>
          <span className="text-xs font-bold text-[var(--navy-900)]">You</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1">Ready</span>
        </div>

        {/* 3 AI Bots */}
        {bots.map((b) => (
          <div
            key={b.id}
            className="p-3 rounded-2xl border border-slate-200 bg-white flex flex-col items-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl mb-2">
              {b.avatar || '🤖'}
            </div>
            <span className="text-xs font-bold text-slate-800 truncate max-w-full">
              {b.name}
            </span>
            <BotBadge className="mt-1" />
          </div>
        ))}
      </div>

      {isCountdown ? (
        <div className="py-4">
          <div className="inline-block text-4xl sm:text-5xl font-black text-[var(--navy-900)] animate-ping">
            {countdownNumber}
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2">Get ready...</p>
        </div>
      ) : (
        <div className="py-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synchronizing arena...</span>
        </div>
      )}
    </div>
  );
}
