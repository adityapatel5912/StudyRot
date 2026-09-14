import React, { useState } from 'react';
import DayCard from './DayCard.jsx';

export default function WeekView({ days = [], onToggleSessionComplete }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedMobileDayIdx, setSelectedMobileDayIdx] = useState(() => {
    const idx = days.findIndex((d) => d.date === todayStr);
    return idx >= 0 ? idx : 0;
  });

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Mobile Day Selector Bar */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700">
        {days.map((day, idx) => {
          const isSelected = idx === selectedMobileDayIdx;
          const isToday = day.date === todayStr;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedMobileDayIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{day.day_name.slice(0, 3)}</span>
              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* Mobile Selected Day View */}
      <div className="md:hidden">
        {days[selectedMobileDayIdx] && (
          <DayCard
            day={days[selectedMobileDayIdx]}
            isToday={days[selectedMobileDayIdx].date === todayStr}
            onToggleSessionComplete={onToggleSessionComplete}
          />
        )}
      </div>

      {/* Responsive Grid Layout (2 cols on tablet, 3 on laptop, 4 on standard desktop, 7 on 2xl) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5 items-start">
        {days.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            isToday={day.date === todayStr}
            onToggleSessionComplete={onToggleSessionComplete}
          />
        ))}
      </div>
    </div>
  );
}
