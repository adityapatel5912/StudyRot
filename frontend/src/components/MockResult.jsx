import React, { useState } from 'react';
import MathText from './MathText.jsx';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function MockResult({ result, paper, onRetake }) {
  const [filter, setFilter] = useState('all'); // all | correct | wrong | skipped
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!result) return null;

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `StudyRot Mock Test Result - ${paper?.title || 'CBSE Mock'}`,
          text: `I scored ${result.total_score}/${result.max_marks} (${result.percentage}%) on my CBSE Mock Test on StudyRot!`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredReviews = (result.question_reviews || []).filter((q) => {
    if (filter === 'correct') return q.marks_awarded === q.max_marks;
    if (filter === 'wrong') return q.status === 'answered' && q.marks_awarded < q.max_marks;
    if (filter === 'skipped') return q.status === 'unanswered';
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Top Score Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-indigo-200 font-bold">
                CBSE Board Mock Test Result
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">{paper?.title || 'Mock Examination'}</h2>
              <p className="text-xs text-indigo-200/80 mt-1">
                Completed in {Math.round((result.duration_sec || 0) / 60)} minutes
              </p>
            </div>
          </div>

          {/* Big Score Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/15">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-amber-300">
                {result.total_score}
                <span className="text-lg text-white/60 font-normal"> / {result.max_marks}</span>
              </div>
              <div className="text-xs text-white/80 font-bold">{result.percentage}% • Grade {result.grade}</div>
            </div>
          </div>
        </div>

        {/* Percentile and FSRS Notification */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-300" />
            <span>
              Your score is in the <strong>{result.percentile}th percentile</strong> of students taking this mock.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{result.fsrs_summary}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Retake, Share, Print/PDF */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetake}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Test</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Report</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF / Print</span>
        </button>
      </div>

      {/* Section-Wise Performance & Chapter Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section Breakdown */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Section-Wise Performance
          </h3>
          <div className="flex flex-col gap-3">
            {Object.entries(result.section_breakdown || {}).map(([secId, sec]) => {
              const secPct = Math.round(((sec.score || 0) / Math.max(1, sec.total_marks || 1)) * 100);
              return (
                <div key={secId} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{sec.name}</span>
                    <span className="font-bold">
                      {sec.score} / {sec.total_marks} ({secPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${secPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chapter Mastery Heatmap */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Topic & Chapter Breakdown
          </h3>
          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
            {Object.entries(result.chapter_heatmap || {}).map(([chap, stats]) => {
              const chapPct = Math.round(((stats.scored || 0) / Math.max(1, stats.total || 1)) * 100);
              let color = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
              if (chapPct < 50) color = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
              else if (chapPct < 75) color = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200';

              return (
                <div
                  key={chap}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${color}`}
                >
                  <span className="font-semibold truncate">{chap}</span>
                  <span className="font-bold shrink-0">
                    {stats.scored} / {stats.total} ({chapPct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question-by-Question Review with CBSE Marking Schemes */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Question-by-Question Detailed Review
          </h3>
          {/* Filters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            {['all', 'correct', 'wrong', 'skipped'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition ${
                  filter === tab
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filteredReviews.map((q) => {
            const isFullMarks = q.marks_awarded === q.max_marks;
            const isZero = q.marks_awarded === 0;
            const isExpanded = !!expandedQuestions[q.id];

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col gap-2 shadow-xs transition"
              >
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    {isFullMarks ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : isZero ? (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-500">
                        Q{q.q_number} • Section {q.section} ({q.type}) • {q.chapter}
                      </div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1 line-clamp-2">
                        <MathText>{q.question}</MathText>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        isFullMarks
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {q.marks_awarded} / {q.max_marks} Marks
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-3 text-xs">
                    {/* Student Answer */}
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-slate-500 mb-1">Your Answer:</div>
                      <div className="text-slate-800 dark:text-slate-200 font-mono">
                        {q.student_answer ? <MathText>{String(q.student_answer)}</MathText> : <em className="text-slate-400">Not Answered</em>}
                      </div>
                    </div>

                    {/* CBSE Marking Scheme & Correct Answer */}
                    <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                      <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                        CBSE Official Marking Scheme & Correct Key:
                      </div>
                      <div className="text-slate-800 dark:text-slate-100 leading-relaxed">
                        <MathText>{q.correct_answer || q.marking_scheme_rationale}</MathText>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-2 italic">
                        Feedback: {q.marking_scheme_rationale}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
