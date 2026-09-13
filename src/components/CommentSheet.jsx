import React, { useState, useEffect } from 'react';

export default function CommentSheet({ post, onClose }) {
  const postId = post?.id || `p_${(post?.title || '').slice(0, 15)}`;
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!post) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`studyrot_comments_${postId}`) || '[]');
      if (stored.length > 0) {
        setComments(stored);
      } else {
        // Seed default authentic CBSE study comments
        const defaultComments = [
          {
            id: 'c1',
            author: 'Ananya (Delhi)',
            text: post.engagement?.seed_comment || 'Is this concept frequently asked as a 3-mark question in Boards?',
            time: '2h ago',
            likes: 4,
          },
          {
            id: 'c2',
            author: 'StudyBuddy AI',
            text: 'Yes! Focus on drawing the labeled diagram carefully with proper arrows for full marks according to CBSE marking scheme.',
            time: '1h ago',
            likes: 7,
            isAi: true,
          },
        ];
        setComments(defaultComments);
      }
    } catch {}
  }, [post, postId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: 'You (Student)',
      text: commentText.trim(),
      time: 'Just now',
      likes: 1,
    };

    const updated = [...comments, newComment];
    setComments(updated);
    setCommentText('');

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
        {/* Header */}
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

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                c.isAi
                  ? 'bg-[#f0f4fc] border-[#c8d4ec] text-[var(--navy-900)]'
                  : 'bg-[var(--white)] border-[var(--border)] text-[var(--navy-800)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  {c.isAi && <span className="text-[10px] bg-[var(--navy-900)] text-white px-1.5 py-0.2 rounded">Tutor</span>}
                  <span>{c.author}</span>
                </span>
                <span className="text-[10px] text-[var(--navy-400)]">{c.time}</span>
              </div>
              <p className="text-[12px]">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Input Form */}
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
