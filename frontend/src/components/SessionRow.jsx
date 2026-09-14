import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, RotateCcw, FileText, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export default function SessionRow({ session, onToggleComplete }) {
  const navigate = useNavigate();
  if (!session) return null;

  const isCompleted = !!session.completed;

  // Icons based on session type: 📖 read, 🎯 drill, 🔄 review, 📝 mock
  const getIcon = () => {
    switch (session.session_type) {
      case 'read':
        return <BookOpen className="w-4 h-4 text-sky-500" />;
      case 'drill':
        return <Target className="w-4 h-4 text-amber-500" />;
      case 'review':
        return <RotateCcw className="w-4 h-4 text-emerald-500" />;
      case 'mock':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleLaunch = (e) => {
    e.stopPropagation();
    switch (session.session_type) {
      case 'read':
        navigate(`/?topic=${encodeURIComponent(session.topic)}&subject=${encodeURIComponent(session.subject)}`);
        break;
      case 'drill':
      case 'review':
        navigate('/review');
        break;
      case 'mock':
        navigate('/mock');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div
      onClick={handleLaunch}
      className={`group p-2.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${
        isCompleted
          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(session.id, !isCompleted);
          }}
          className="text-slate-400 hover:text-indigo-600 transition shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          )}
        </button>

        <div className="shrink-0">{getIcon()}</div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold truncate ${
                isCompleted
                  ? 'line-through text-slate-400'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {session.topic}
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
              {session.subject}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {session.reason}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
          {session.minutes}m
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition hidden sm:inline-block" />
      </div>
    </div>
  );
}
