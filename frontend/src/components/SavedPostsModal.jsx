import React, { useState, useEffect } from 'react';

export default function SavedPostsModal({ onClose, onViewPost }) {
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('studyrot_saved_posts') || '[]');
      setSavedPosts(stored);
    } catch {}
  }, []);

  const handleRemove = (postId, e) => {
    e.stopPropagation();
    const filtered = savedPosts.filter((p) => p.id !== postId);
    setSavedPosts(filtered);
    try {
      localStorage.setItem('studyrot_saved_posts', JSON.stringify(filtered));
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--white)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--off-white)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔖</span>
            <h3 className="text-base font-bold text-[var(--navy-900)]">
              Saved Study Cards ({savedPosts.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--navy-400)] hover:text-[var(--navy-900)] hover:bg-[var(--navy-200)] transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {savedPosts.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📌</div>
              <p className="text-sm font-semibold text-[var(--navy-800)]">No bookmarked cards yet</p>
              <p className="text-xs text-[var(--navy-400)] mt-1">
                Tap the bookmark icon on any post card while scrolling to save it for revision.
              </p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div
                key={post.id || post.title}
                onClick={() => {
                  if (onViewPost) {
                    onViewPost(post);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--white)] hover:border-[var(--navy-600)] hover:shadow-sm cursor-pointer transition flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--navy-200)] text-[var(--navy-800)]">
                      {post.type || 'Card'}
                    </span>
                    {post.source_ref && (
                      <span className="text-[10px] text-[var(--navy-400)] truncate max-w-[200px]">
                        {post.source_ref}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--navy-900)] group-hover:text-[var(--navy-600)] transition">
                    {post.title}
                  </h4>
                  <p className="text-xs text-[var(--navy-600)] line-clamp-2 mt-1">
                    {post.body}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRemove(post.id, e)}
                  className="p-1.5 text-[var(--navy-400)] hover:text-[var(--red)] hover:bg-[var(--red-soft)] rounded-lg transition flex-shrink-0"
                  title="Remove bookmark"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
