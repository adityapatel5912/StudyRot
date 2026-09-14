import React from 'react';
import { usePlan } from '../hooks/usePlan.js';
import SessionRow from '../components/SessionRow.jsx';
import { Flame, Calendar, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlanToday() {
  const { plan, loading, toggleSessionComplete, streakCount } = usePlan();
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayDay = (plan?.days || []).find((d) => d.date === todayStr) || (plan?.days || [])[0];

  if (!todayDay) {
    return (
      <div className="max-w-md mx-auto p-8 text-center text-slate-400">
        {loading ? 'Loading today’s sessions...' : 'No sessions scheduled for today.'}
      </div>
    );
  }

  const totalMin = todayDay.total_minutes || 45;
  const completedMin = (todayDay.sessions || [])
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.minutes, 0);

  const progressPct = Math.min(100, Math.round((completedMin / Math.max(1, totalMin)) * 100));
  const isFinished = progressPct >= 70;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-200">
              Today's Study Plan • {todayDay.day_name}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold">
            {streakCount} Day Streak
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-black">{completedMin} of {totalMin} min completed</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Complete at least 70% ({Math.ceil(totalMin * 0.7)}m) to extend your study streak!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${isFinished ? 'bg-emerald-400' : 'bg-amber-400'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Today's Scheduled Sessions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today's Sessions (Tap to start):
          </h3>
          <Link
            to="/plan"
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View 7-Day Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          {(todayDay.sessions || []).map((sess) => (
            <SessionRow
              key={sess.id}
              session={sess}
              onToggleComplete={toggleSessionComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
