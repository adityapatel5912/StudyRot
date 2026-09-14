import React, { useState, useEffect } from 'react';
import { useMockTest } from '../hooks/useMockTest.js';
import MockSidebar from '../components/MockSidebar.jsx';
import MockQuestion from '../components/MockQuestion.jsx';
import MockResult from '../components/MockResult.jsx';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Send,
  BookOpen,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function MockTest() {
  const {
    mockId,
    paper,
    loading,
    error,
    currentQuestionIndex,
    answers,
    markedForReview,
    visitedQuestions,
    timeLeftSec,
    isSubmitting,
    result,
    flatQuestions,
    startMockTest,
    setAnswer,
    toggleMarkForReview,
    selectQuestion,
    submitTest,
    setResult,
  } = useMockTest();

  const [selectedSubject, setSelectedSubject] = useState('Science');
  const [selectedGrade, setSelectedGrade] = useState(10);
  const [templates, setTemplates] = useState([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Load available templates
  useEffect(() => {
    fetch('/api/mock/templates')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data) setTemplates(j.data);
      })
      .catch(() => {});
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = flatQuestions[currentQuestionIndex];
  const activeSectionId = currentQ?.sectionId || 'A';

  const handleSelectSection = (secId) => {
    const firstQIdx = flatQuestions.findIndex((q) => q.sectionId === secId);
    if (firstQIdx >= 0) selectQuestion(firstQIdx);
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) selectQuestion(currentQuestionIndex - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < flatQuestions.length - 1) {
      selectQuestion(currentQuestionIndex + 1);
    }
  };

  const handleClearAnswer = () => {
    if (currentQ) setAnswer(currentQ.id, '');
  };

  // 1. If result is available, show the detailed CBSE marking scheme report
  if (result) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 py-6">
        <MockResult
          result={result}
          paper={paper}
          onRetake={() => {
            setResult(null);
            startMockTest(selectedSubject, selectedGrade);
          }}
        />
      </div>
    );
  }

  // 2. Lobby View: Pick Subject and Grade
  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            CBSE Board Full-Length Mock Test Mode
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Simulate the exact CBSE board examination experience. 80 marks, 180 minutes, verified PYQs,
            auto-graded with official CBSE marking schemes and FSRS-6 spaced repetition sync.
          </p>
        </div>

        {/* Test Configuration Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Subject:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Science">Science (Class 10)</option>
                <option value="Maths">Maths (Class 10 / 12)</option>
                <option value="SST">Social Science (Class 10)</option>
                <option value="Physics">Physics (Class 12)</option>
                <option value="Chemistry">Chemistry (Class 12)</option>
                <option value="Biology">Biology (Class 12)</option>
                <option value="History">History (Class 12)</option>
                <option value="Political Science">Political Science (Class 12)</option>
                <option value="Geography">Geography (Class 12)</option>
                <option value="Economics">Economics (Class 12)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Class / Grade:
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>Class 10 (Secondary School)</option>
                <option value={12}>Class 12 (Senior Secondary)</option>
              </select>
            </div>
          </div>

          {/* Exam Rules Summary */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-slate-700 dark:text-slate-200 flex flex-col gap-2">
            <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Official CBSE Exam Pattern & Rules:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
              <li>Duration: 180 minutes (3 hours) with countdown timer.</li>
              <li>Questions drawn from verified CBSE Previous Year Questions (PYQs).</li>
              <li>Includes MCQs, Assertion-Reasoning, Short Answers (SA1/SA2), Long Answers (LA), and Map skills.</li>
              <li>Auto-saves answers every 30 seconds to browser storage.</li>
              <li>Graded with official CBSE step-wise marking schemes and FSRS-6 review updates.</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => startMockTest(selectedSubject, selectedGrade)}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Assembling Full Paper...</span>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Start Full-Length Mock Examination</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Test Taking Full-Screen Mode
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-slate-100 dark:bg-slate-900 select-none">
      {/* Top Test Header Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-none">
            {paper.title}
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            Total: {paper.total_marks} Marks
          </span>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-sm ${
              timeLeftSec < 900
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeftSec)}</span>
          </div>

          <button
            type="button"
            onClick={() => setMobilePaletteOpen((p) => !p)}
            className="lg:hidden px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold"
          >
            Palette
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* Main Body: Question Area + Question Palette */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center: Question View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-w-4xl mx-auto w-full">
          {currentQ ? (
            <MockQuestion
              question={currentQ}
              questionNumber={currentQuestionIndex + 1}
              answer={answers[currentQ.id]}
              onAnswerChange={(val) => setAnswer(currentQ.id, val)}
            />
          ) : (
            <div className="text-center text-slate-400 py-10">No questions loaded.</div>
          )}

          {/* Bottom Action Controls */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAnswer}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
              >
                Clear Response
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentQ) toggleMarkForReview(currentQ.id);
                  handleNext();
                }}
                className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-semibold hover:bg-amber-200 transition"
              >
                Mark & Next
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentQuestionIndex === flatQuestions.length - 1}
              className="flex items-center gap-1 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition disabled:opacity-40"
            >
              <span>Save & Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar Palette on Desktop */}
        <div className="hidden lg:block">
          <MockSidebar
            sections={paper.sections}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
            currentQuestionIndex={currentQuestionIndex}
            onSelectQuestion={selectQuestion}
            answers={answers}
            markedForReview={markedForReview}
            visitedQuestions={visitedQuestions}
            onToggleMarkForReview={toggleMarkForReview}
          />
        </div>

        {/* Mobile Palette Drawer */}
        {mobilePaletteOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex justify-end">
            <div className="w-72 bg-white dark:bg-slate-800 h-full">
              <div className="p-3 border-b flex justify-between items-center">
                <span className="font-bold text-xs">Question Palette</span>
                <button
                  type="button"
                  onClick={() => setMobilePaletteOpen(false)}
                  className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded"
                >
                  Close
                </button>
              </div>
              <MockSidebar
                sections={paper.sections}
                activeSectionId={activeSectionId}
                onSelectSection={(id) => {
                  handleSelectSection(id);
                  setMobilePaletteOpen(false);
                }}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={(idx) => {
                  selectQuestion(idx);
                  setMobilePaletteOpen(false);
                }}
                answers={answers}
                markedForReview={markedForReview}
                visitedQuestions={visitedQuestions}
                onToggleMarkForReview={toggleMarkForReview}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Submit Examination Paper?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You have answered{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {Object.values(answers).filter((a) => String(a).trim() !== '').length}
              </strong>{' '}
              of <strong className="text-slate-900 dark:text-slate-100">{flatQuestions.length}</strong> questions.
              Once submitted, your paper will be scored against official CBSE marking schemes.
            </p>
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  submitTest();
                }}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
              >
                {isSubmitting ? 'Grading...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
