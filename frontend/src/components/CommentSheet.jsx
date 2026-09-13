import React, { useState, useEffect } from 'react';

export default function CommentSheet({ post, onClose }) {
  const postId = post?.id || `p_${(post?.title || '').slice(0, 15)}`;
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!post) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`studyrot_comments_${postId}`) || '[]');
      setComments(stored);
    } catch {
      setComments([]);
    }
  }, [post, postId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: 'You (Student)',
      text: commentText.trim(),
      time: 'Just now',
      likes: 0,
    };

    const updated = [...comments, newComment];
    setComments(updated);
    setCommentText('');

    try {
      localStorage.setItem(`studyrot_comments_${postId}`, JSON.stringify(updated));
    } catch {}
  };

  const handleLikeComment = (commentId) => {
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return { ...c, likes: (c.likes || 0) + 1 };
      }
      return c;
    });
    setComments(updated);
    try {
      localStorage.setItem(`studyrot_comments_${postId}`, JSON.stringify(updated));
    } catch {}
  };

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[var(--white)] rounded-t-3xl sm:rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[75vh] animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--off-white)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <div>
              <h3 className="text-sm font-bold text-[var(--navy-900)]">
                Discussion & Doubt Clearing
              </h3>
              <p className="text-[11px] text-[var(--navy-400)] truncate max-w-[280px]">
                {post.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--navy-400)] hover:text-[var(--navy-900)] hover:bg-[var(--navy-200)] transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-[160px]">
          {comments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2 opacity-60">💬</span>
              <p className="text-xs font-semibold text-[var(--navy-800)]">
                No comments yet. Be the first.
              </p>
              <p className="text-[11px] text-[var(--navy-400)] mt-1">
                Ask a clarifying doubt or leave an exam tip for others.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border text-xs leading-relaxed bg-[var(--white)] border-[var(--border)] text-[var(--navy-800)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>{c.author}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--navy-400)]">{c.time}</span>
                    <button
                      type="button"
                      onClick={() => handleLikeComment(c.id)}
                      className="text-[10px] text-[var(--navy-600)] hover:text-red-500 flex items-center gap-0.5"
                    >
                      ❤️ {c.likes > 0 ? c.likes : ''}
                    </button>
                  </div>
                </div>
                <p className="text-[12px]">{c.text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="p-3.5 border-t border-[var(--border)] bg-[var(--white)] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a question or add a tip..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--off-white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="px-4 py-2.5 bg-[var(--navy-900)] text-white text-xs font-bold rounded-xl disabled:opacity-40 hover:bg-[var(--navy-800)] transition flex-shrink-0"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
