import React from 'react';
import SessionRow from './SessionRow.jsx';
import { CheckCircle2, Clock } from 'lucide-react';

export default function DayCard({ day, isToday, onToggleSessionComplete }) {
  if (!day) return null;

  const totalMinutes = day.total_minutes || 45;
  const completedMinutes = (day.sessions || [])
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.minutes, 0);

  const progressPct = Math.min(100, Math.round((completedMinutes / Math.max(1, totalMinutes)) * 100));
  const isDayFinished = progressPct >= 70;

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3 transition shadow-xs ${
        isToday
          ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-800 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70'
      }`}
    >
      {/* Day Header - Clean 2-row layout with zero overlap */}
      <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-700/60 pb-2">
        <div className="flex items-center justify-between gap-1">
          <span className="font-black text-sm text-slate-900 dark:text-slate-100">
            {day.day_name}
          </span>
          {isToday && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase tracking-wider shrink-0">
              Today
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="text-[10px] text-slate-400 font-mono">{day.date}</span>
          <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300 shrink-0">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{completedMinutes}/{totalMinutes}m</span>
          </span>
        </div>
      </div>

      {/* Daily Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isDayFinished ? 'bg-emerald-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Sessions List */}
      <div className="flex flex-col gap-2">
        {(day.sessions || []).map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            onToggleComplete={onToggleSessionComplete}
          />
        ))}
      </div>
    </div>
  );
}
