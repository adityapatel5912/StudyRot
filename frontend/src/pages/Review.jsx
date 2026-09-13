import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useReview } from '../contexts/ReviewProvider.jsx';
import { useSandbox } from '../contexts/SandboxProvider.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import DemoBanner from '../components/DemoBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { EMPTY_STATES } from '../utils/emptyStates.js';

export default function Review() {
  const navigate = useNavigate();
  const { queue, recordRating, examDate } = useReview();
  const { isSandbox, sandboxMode, sandboxReviewCards, exitSandbox } = useSandbox();

  const isReviewSandbox = isSandbox && sandboxMode === 'review';
  const activeCards = isReviewSandbox ? sandboxReviewCards : queue;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [ratedCount, setRatedCount] = useState(0);

  const currentCard = activeCards[currentIndex];

  const handleRate = async (rating) => {
    setRatedCount((prev) => prev + 1);
    if (!isReviewSandbox && currentCard) {
      await recordRating({
        card_id: currentCard.card_id,
        rating,
        subject: currentCard.subject,
        grade: currentCard.grade,
        topic: currentCard.topic,
      });
    }

    if (currentIndex + 1 >= activeCards.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[var(--off-white)] flex flex-col">
      {isReviewSandbox && (
        <DemoBanner featureName="Spaced Repetition Review" onExit={() => { exitSandbox(); navigate('/'); }} />
      )}

      <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {completed ? (
          <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-md text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto">
              🎉
            </div>
            <h2 className="text-xl font-bold text-[var(--navy-900)]">
              Daily Review Completed!
            </h2>
            <p className="text-xs sm:text-sm text-[var(--navy-600)] max-w-md mx-auto leading-relaxed">
              {isReviewSandbox
                ? "You've finished the sandbox review tour. Ratings in sandbox mode are never saved."
                : `Great job! You reviewed ${ratedCount} cards today. FSRS-6 has calibrated your next review intervals.`}
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              {isReviewSandbox ? (
                <button
                  type="button"
                  onClick={() => { exitSandbox(); navigate('/'); }}
                  className="px-5 py-2.5 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-sm"
                >
                  Set your exam date to start real reviews →
                </button>
              ) : (
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-sm"
                >
                  Back to Home →
                </Link>
              )}
            </div>
          </div>
        ) : activeCards.length === 0 ? (
          <EmptyState
            icon={EMPTY_STATES.dailyReview.icon}
            title={EMPTY_STATES.dailyReview.title}
            description="Complete a feed to start your review queue."
            actionLabel="Generate a Feed"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-[var(--navy-600)] px-2">
              <span>Card {currentIndex + 1} of {activeCards.length}</span>
              <span>Target: {examDate || 'Board Exam'}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[var(--navy-900)] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / activeCards.length) * 100}%` }}
              />
            </div>

            <ReviewCard
              card={currentCard}
              onRate={handleRate}
              isSandbox={isReviewSandbox}
            />
          </div>
        )}
      </div>
    </div>
  );
}
