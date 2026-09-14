import React, { useState } from 'react';
import { usePlan } from '../hooks/usePlan.js';
import WeekView from '../components/WeekView.jsx';
import { Calendar, Flame, RefreshCw, Clock, Award, Sparkles, BookOpen } from 'lucide-react';

export default function Plan() {
  const { plan, loading, error, toggleSessionComplete, regeneratePlan, streakCount } = usePlan();
  const [budget, setBudget] = useState(45);

  const handleRegenerate = () => {
    regeneratePlan(budget);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Top Banner with Streak & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Adaptive Study Pathway
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized 7-day schedule calibrated by FSRS-6 retention, CBSE weightage, and upcoming exam countdown.
          </p>
        </div>

        {/* Streak Counter & Regenerate Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800 shadow-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" style={{ animationDuration: '2s' }} />
            <span>{streakCount} Day Streak</span>
          </div>

          <div className="flex items-center gap-1">
            <select
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value={30}>30 min/day</option>
              <option value={45}>45 min/day</option>
              <option value={60}>60 min/day</option>
              <option value={90}>90 min/day</option>
            </select>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject Distribution & Target Exam Notice */}
      {plan && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>
              Target Exam in: <strong className="text-slate-900 dark:text-slate-100">{plan.days_to_exam || 60} days</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>
              Daily Commitment: <strong className="text-slate-900 dark:text-slate-100">{plan.daily_budget_min || 45} mins</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              Subject Balance: <strong>Balanced (&le; 50% max)</strong>
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          {error}
        </div>
      )}

      {/* Week Calendar Layout */}
      {plan?.days ? (
        <WeekView
          days={plan.days}
          onToggleSessionComplete={toggleSessionComplete}
        />
      ) : (
        <div className="text-center py-12 text-slate-400 text-sm">
          {loading ? 'Assembling your adaptive study pathway...' : 'No plan found. Tap Regenerate to create your plan.'}
        </div>
      )}
    </div>
  );
}
