import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.jsx';

export default function MyFeedsModal({ onClose, onLoadFeed }) {
  const { token, user } = useAuth();
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeds();
  }, [token]);

  const fetchFeeds = async () => {
    try {
      const res = await fetch('/api/my-feeds', {
        headers: { Authorization: `Bearer ${token || 'guest'}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFeeds(data.data?.feeds || data.feeds || []);
      }
    } catch (err) {
      console.warn('Could not fetch feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/feed/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || 'guest'}` },
      });
      setFeeds(feeds.filter((f) => f.id !== id));
    } catch (err) {
      console.warn('Could not delete feed:', err);
    }
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
            <span className="text-lg">📚</span>
            <h3 className="text-base font-bold text-[var(--navy-900)]">My Saved Feeds</h3>
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
          {loading ? (
            <div className="text-center py-8 text-sm text-[var(--navy-400)]">
              Loading your curriculum feeds...
            </div>
          ) : feeds.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📖</div>
              <p className="text-sm font-semibold text-[var(--navy-800)]">No saved feeds yet</p>
              <p className="text-xs text-[var(--navy-400)] mt-1">
                Generate any chapter feed and click "Save Feed" to keep it in your study library.
              </p>
            </div>
          ) : (
            feeds.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.feed && item.feed.posts) {
                    onLoadFeed(item.feed.posts);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--white)] hover:border-[var(--navy-600)] hover:shadow-sm cursor-pointer transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${
                        item.subject === 'Maths'
                          ? 'bg-[var(--red)]'
                          : item.subject === 'SST'
                          ? 'bg-[#15803d]'
                          : 'bg-[var(--navy-800)]'
                      }`}
                    >
                      {item.subject} Cl {item.grade}
                    </span>
                    <span className="text-[10px] text-[var(--navy-400)]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--navy-900)] group-hover:text-[var(--navy-600)] transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--navy-500)] mt-0.5">
                    {item.feed?.posts?.length || 16} study cards with animated diagrams
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 text-[var(--navy-400)] hover:text-[var(--red)] hover:bg-[var(--red-soft)] rounded-lg transition"
                  title="Delete feed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
