import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.jsx';
import { ArrowLeft, Bookmark, Trash2, ExternalLink, BookOpen } from 'lucide-react';

export default function Saved({ onSelectFeed }) {
  const navigate = useNavigate();
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

  const handleOpenFeed = (feedItem) => {
    const feedPosts = feedItem.posts || feedItem.feed?.posts || (Array.isArray(feedItem.feed) ? feedItem.feed : null);
    if (feedPosts && feedPosts.length > 0) {
      onSelectFeed?.(feedPosts);
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[var(--off-white)] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--white)] hover:bg-[var(--off-white)] text-[var(--navy-700)] transition"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--navy-900)] flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-[var(--red)]" />
                <span>Saved Study Feeds</span>
              </h1>
              <p className="text-xs text-[var(--navy-500)]">
                Your personal library of bookmarked CBSE chapters and diagrams
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--navy-200)] border-t-[var(--navy-600)] animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-[var(--navy-500)]">Loading your library...</p>
          </div>
        ) : feeds.length === 0 ? (
          <div className="bg-[var(--white)] rounded-2xl border border-[var(--border)] p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[var(--red)] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[var(--navy-900)] mb-1">No Saved Feeds Yet</h2>
            <p className="text-xs text-[var(--navy-500)] leading-relaxed mb-6">
              When you generate a study feed for any Science, Maths, or SST chapter, click "Save Feed" in the top bar to bookmark it here for offline revision.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-[var(--navy-900)] hover:bg-[var(--navy-800)] text-white text-xs font-bold transition shadow-sm"
            >
              Explore NCERT Chapters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeds.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenFeed(item)}
                className="bg-[var(--white)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--navy-600)] hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
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

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-[var(--navy-400)] hover:text-[var(--red)] hover:bg-red-50 rounded-lg transition"
                      title="Delete feed"
                      aria-label="Delete saved feed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-[var(--navy-900)] group-hover:text-[var(--navy-600)] transition line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--navy-500)] mt-1 line-clamp-2">
                    {item.posts?.length || item.feed?.posts?.length || 14} interactive study cards with animated diagrams and board exam MCQs
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--navy-700)]">
                  <span>Click to review feed</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
