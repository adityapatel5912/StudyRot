import React from 'react';
import { Crown, ShieldAlert, Sparkles, SlidersHorizontal, UserX } from 'lucide-react';

export default function RoomPlayerList({
  players = [],
  hostId,
  currentPlayerId,
  mode,
  onModeChange,
  onStartQuiz,
  onKickPlayer,
  quizActive,
}) {
  const isHost = currentPlayerId === hostId;

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-800 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-700 w-full lg:w-64">
      {/* Host Controls */}
      {isHost && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs">
          <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Host Controls</span>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-[11px] text-slate-600 dark:text-slate-300">Feed Mode:</span>
            <div className="flex rounded-lg bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onModeChange('sync')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  mode === 'sync' ? 'bg-indigo-600 text-white' : 'text-slate-500'
                }`}
              >
                Sync
              </button>
              <button
                type="button"
                onClick={() => onModeChange('free')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  mode === 'free' ? 'bg-indigo-600 text-white' : 'text-slate-500'
                }`}
              >
                Free
              </button>
            </div>
          </div>

          {/* Start Group Quiz Button */}
          <button
            type="button"
            onClick={onStartQuiz}
            disabled={quizActive}
            className="w-full mt-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{quizActive ? 'Quiz in Progress...' : 'Start Group Quiz (3 Qs)'}</span>
          </button>
        </div>
      )}

      {/* Players List */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Students in Room ({players.length}/8)
        </div>
        <div className="flex flex-col gap-1.5">
          {players.map((p) => {
            const isThisHost = p.id === hostId;
            const isMe = p.id === currentPlayerId;

            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-850 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0 shadow-xs"
                    style={{ backgroundColor: p.color || '#6366f1' }}
                  >
                    {p.nickname.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {p.nickname} {isMe && <span className="text-[10px] text-slate-400">(You)</span>}
                  </span>
                  {isThisHost && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Room Host" />
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    {p.score || 0} pts
                  </span>
                  {isHost && !isMe && (
                    <button
                      type="button"
                      onClick={() => onKickPlayer(p.id)}
                      className="text-slate-400 hover:text-rose-500 transition p-0.5"
                      title="Remove student from room"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
