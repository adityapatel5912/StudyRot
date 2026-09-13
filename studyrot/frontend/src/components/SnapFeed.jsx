import React, { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard.jsx';

export default function SnapFeed({ posts, timerSeconds = 20, onReset }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  // Setup intersection observer to track which post is currently in center viewport
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

  // Keyboard navigation for snap feed (Up / Down arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
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
  }, [currentIndex, posts]);

  const scrollToIndex = (idx) => {
    if (idx < 0 || idx >= posts.length) return;
    const target = cardRefs.current[idx];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="snap-feed-container" ref={containerRef}>
      {/* Top Floating Bar: Subject/Topic badge + Back to Config Button + Navigation + Counter */}
      <nav className="top-counter-bar">
        <button
          type="button"
          id="back-to-source-btn"
          className="floating-btn"
          onClick={onReset}
          title="Back to Source Panel"
        >
          <span>←</span>
          <span>New Topic</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
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

          <div className="floating-pill" id="post-counter">
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

      {/* Vertical Progress Dots on the Right */}
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

      {/* Snap Scrollable Post Cards */}
      {posts.map((post, idx) => (
        <section
          key={idx}
          ref={(el) => (cardRefs.current[idx] = el)}
          className="snap-card"
          data-index={idx}
          id={`snap-card-${idx}`}
        >
          <PostCard post={post} timerSeconds={timerSeconds} />
        </section>
      ))}

      {/* Subtle bottom scroll hint */}
      <div className="feed-hints">
        <span>↓ Swipe or press Arrow Keys to scroll</span>
      </div>
    </main>
  );
}
