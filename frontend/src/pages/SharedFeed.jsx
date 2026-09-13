import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SnapFeed from '../components/SnapFeed.jsx';
import { getSharedFeedApi } from '../api.js';

export default function SharedFeed({ soundEnabled = true }) {
  const { shortCode, index } = useParams();
  const navigate = useNavigate();

  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialIndex = index ? parseInt(index, 10) : 0;

  useEffect(() => {
    let isMounted = true;
    async function loadFeed() {
      setLoading(true);
      setError(null);
      try {
        const res = await getSharedFeedApi(shortCode);
        if (isMounted) {
          if (res?.ok && res?.data) {
            setFeedData(res.data);
          } else {
            setError(res?.error || "Feed not found");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "This feed has expired or doesn't exist.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (shortCode) {
      loadFeed();
    }
    return () => { isMounted = false; };
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[var(--navy-900)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[var(--navy-800)]">Loading shared CBSE feed...</p>
        <p className="text-xs text-[var(--navy-400)] mt-1">Fetching verified notes and diagrams</p>
      </div>
    );
  }

  if (error || !feedData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-3xl mb-4 border border-red-200">
          ⚠️
        </div>
        <h2 className="text-lg font-bold text-[var(--navy-900)] mb-2">
          Feed Expired or Not Found
        </h2>
        <p className="text-xs sm:text-sm text-[var(--navy-600)] mb-6 leading-relaxed">
          This feed has expired or doesn't exist. StudyRot feeds are preserved for 30 days.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-sm"
        >
          Generate a new one →
        </Link>
      </div>
    );
  }

  const posts = feedData.posts || [];
  const views = feedData.view_count || 0;
  const viewLabel = views > 0 ? `${views} views` : "No views yet";

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] bg-[var(--off-white)]">
      {/* Top right chip */}
      <div className="absolute top-4 right-4 z-30 pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-[var(--border)] text-[11px] font-semibold text-[var(--navy-800)] shadow-xs flex items-center gap-1.5">
          <span>🔗</span>
          <span>Shared feed · {viewLabel}</span>
        </div>
      </div>

      <SnapFeed
        posts={posts}
        initialIndex={!isNaN(initialIndex) && initialIndex < posts.length ? initialIndex : 0}
        soundEnabled={soundEnabled}
        feedMeta={{
          subject: feedData.subject || 'Science',
          grade: feedData.grade || 10,
          topic: feedData.topic || 'Shared Topic',
        }}
        feedCode={feedData.short_code}
      />
    </div>
  );
}
