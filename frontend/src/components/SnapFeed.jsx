/** Snap-scrolling feed container with lazy rendering, error boundaries, keyboard navigation, and classroom battle trigger. */
import React, { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard.jsx';
import CommentSheet from './CommentSheet.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { useAuth } from './AuthProvider.jsx';
import { Swords } from 'lucide-react';

export default function SnapFeed({
  posts,
  timerSeconds = 20,
  soundEnabled = true,
  onReset,
  onStartBattle,
  feedMeta = {}
}) {
  const { token } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [savedFeedSuccess, setSavedFeedSuccess] = useState(false);
  const [savingFeed, setSavingFeed] = useState(false);

  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) {
              setCurrentIndex(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [posts]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeCommentPost) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts, activeCommentPost]);

  const scrollToIndex = (idx) => {
    if (idx < 0 || idx >= posts.length) return;
    const target = cardRefs.current[idx];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveFeed = async () => {
    setSavingFeed(true);
    const title = feedMeta.topic || posts[0]?.title || 'CBSE Study Feed';
    const subject = feedMeta.subject || posts[0]?.subject || 'Science';
    const grade = feedMeta.grade || posts[0]?.grade || 10;

    try {
      await fetch('/api/save-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'guest'}`,
        },
        body: JSON.stringify({
          title,
          subject,
          grade,
          feed: { posts },
        }),
      });

      setSavedFeedSuccess(true);
      setTimeout(() => setSavedFeedSuccess(false), 2500);
    } catch (err) {
      console.warn('Failed to save feed:', err);
    } finally {
      setSavingFeed(false);
    }
  };

  return (
    <div className="snap-feed-wrapper flex flex-col h-[calc(100vh-80px)] h-[calc(100dvh-80px)] w-full overflow-hidden bg-[var(--off-white)]">
      <nav className="top-counter-bar shrink-0" aria-label="Feed Controls">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="back-to-source-btn"
            className="floating-btn text-xs sm:text-sm"
            onClick={onReset}
            title="Back to Topic Selection"
            aria-label="Back to Topic Selection"
          >
            <span>←</span>
            <span className="hidden sm:inline">New Topic</span>
            <span className="sm:hidden">Topic</span>
          </button>

          {onStartBattle && (
            <button
              type="button"
              id="start-feed-battle-btn"
              onClick={() => onStartBattle({ posts, ...feedMeta })}
              className="floating-btn flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              title="Host a live classroom battle with this feed"
              aria-label="Host Classroom Battle with these questions"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Battle</span>
            </button>
          )}

          <button
            type="button"
            id="save-full-feed-btn"
            onClick={handleSaveFeed}
            disabled={savingFeed}
            className="floating-btn hidden sm:flex items-center gap-1 text-xs"
            title="Save entire feed to library"
            aria-label="Save entire feed to library"
          >
            <span>{savedFeedSuccess ? '✓' : '💾'}</span>
            <span>{savedFeedSuccess ? 'Saved!' : 'Save Feed'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            id="prev-post-btn"
            disabled={currentIndex === 0}
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="floating-btn px-2.5 sm:px-3 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous card"
            aria-label="Previous card"
          >
            <span>↑</span>
          </button>

          <div className="floating-pill" id="post-counter" aria-label={`Post ${currentIndex + 1} of ${posts.length}`}>
            <span>{currentIndex + 1}</span>
            <span className="text-[var(--navy-400)]">/</span>
            <span>{posts.length}</span>
          </div>

          <button
            type="button"
            id="next-post-btn"
            disabled={currentIndex === posts.length - 1}
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="floating-btn px-2.5 sm:px-3 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next card"
            aria-label="Next card"
          >
            <span>↓</span>
          </button>
        </div>
      </nav>

      <main className="snap-feed-container flex-1" ref={containerRef} tabIndex={0} aria-label="CBSE NCERT Scrollable Feed">

      <div className="progress-dots-container" aria-label="Feed Navigation">
        {posts.map((_, idx) => (
          <button
            key={idx}
            type="button"
            id={`dot-nav-${idx}`}
            className={`progress-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Go to post ${idx + 1}`}
          />
        ))}
      </div>

      {posts.map((post, idx) => {
        const isNearViewport = Math.abs(idx - currentIndex) <= 1;

        return (
          <section
            key={idx}
            ref={(el) => (cardRefs.current[idx] = el)}
            className="snap-card"
            data-index={idx}
            id={`snap-card-${idx}`}
          >
            <ErrorBoundary>
              {isNearViewport ? (
                <PostCard
                  post={post}
                  timerSeconds={timerSeconds}
                  soundEnabled={soundEnabled}
                  onOpenComments={(p) => setActiveCommentPost(p)}
                />
              ) : (
                <div
                  className="card-inner min-h-[440px] flex flex-col items-center justify-center p-8 text-center text-navy-400 bg-white dark:bg-navy-900/40 rounded-2xl border border-gray-100"
                  aria-hidden="true"
                >
                  <span className="text-xs font-mono uppercase tracking-wider text-navy-400 mb-2">
                    Card #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full border-2 border-navy-200 border-t-navy-600 animate-spin opacity-50" />
                </div>
              )}
            </ErrorBoundary>
          </section>
        );
      })}

      <div className="feed-hints">
        <span>↓ Swipe or press Arrow Keys to scroll ({currentIndex + 1}/{posts.length})</span>
      </div>

      </main>

      {activeCommentPost && (
        <CommentSheet
          post={activeCommentPost}
          onClose={() => setActiveCommentPost(null)}
        />
      )}
    </div>
  );
}
