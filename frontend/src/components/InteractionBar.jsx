import React, { useState, useEffect } from 'react';

export default function InteractionBar({
  post,
  postData,
  postId: propPostId,
  initialLikes: propInitialLikes,
  initialCommentsCount = 0,
  postTitle,
  onOpenComments,
  onSaveChange,
  isSaved = false,
}) {
  const activePost = post || postData || {};
  const postId = propPostId || activePost.id || `p_${Math.abs(hashString((postTitle || activePost.title || '') + (activePost.body || '')))}`;
  
  const initialLikes = propInitialLikes ?? (activePost.engagement && activePost.engagement.likes) ?? 24;
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [copiedToast, setCopiedToast] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    try {
      const likedPosts = JSON.parse(localStorage.getItem('studyrot_liked_posts') || '{}');
      if (likedPosts[postId]) {
        setHasLiked(true);
        setLikes(initialLikes + 1);
      }
      const rawSaved = localStorage.getItem('studyrot_saved_posts');
      let savedPosts = [];
      try {
        const parsed = JSON.parse(rawSaved || '[]');
        savedPosts = Array.isArray(parsed) ? parsed : [];
      } catch {
        savedPosts = [];
      }
      const alreadySaved = savedPosts.some((p) => p && typeof p === 'object' && (p.id === postId || (p.title === post?.title && p.body === post?.body)));
      setSaved(alreadySaved);
    } catch {}
  }, [postId, initialLikes, post?.title, post?.body]);

  const toggleLike = (e) => {
    e.stopPropagation();
    setBouncing(true);
    setTimeout(() => setBouncing(false), 300);

    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    const newLikes = nextLiked ? likes + 1 : Math.max(initialLikes, likes - 1);
    setLikes(newLikes);

    try {
      const likedPosts = JSON.parse(localStorage.getItem('studyrot_liked_posts') || '{}');
      if (nextLiked) {
        likedPosts[postId] = true;
      } else {
        delete likedPosts[postId];
      }
      localStorage.setItem('studyrot_liked_posts', JSON.stringify(likedPosts));
    } catch {}
  };

  const toggleSave = (e) => {
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      let savedPosts = [];
      try {
        const parsed = JSON.parse(localStorage.getItem('studyrot_saved_posts') || '[]');
        savedPosts = Array.isArray(parsed) ? parsed : [];
      } catch {
        savedPosts = [];
      }

      if (nextSaved) {
        const postToSave = { ...activePost, id: postId, savedAt: new Date().toISOString() };
        savedPosts = [postToSave, ...savedPosts.filter((p) => p && typeof p === 'object' && p.id !== postId)];
      } else {
        savedPosts = savedPosts.filter((p) => p && typeof p === 'object' && p.id !== postId && p.title !== activePost?.title);
      }
      localStorage.setItem('studyrot_saved_posts', JSON.stringify(savedPosts));
      if (onSaveChange) {
        onSaveChange(nextSaved);
      }
    } catch {}
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?post=${postId}`;
    const shareTitle = `StudyRot: ${activePost.title || 'CBSE Study Card'}`;
    const shareText = `Check out this CBSE Class ${activePost.grade || 10} ${activePost.subject || 'NCERT'} card on StudyRot!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      alert(`Card link: ${shareUrl}`);
    }
  };

  const commentsCount =
    initialCommentsCount ||
    ((activePost.engagement && activePost.engagement.comments ? activePost.engagement.comments.length : 0) +
     (activePost.engagement && activePost.engagement.seed_comment ? 1 : 3));

  return (
    <div className="relative pt-3 mt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--navy-600)] select-none">
      {copiedToast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--navy-900)] text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold animate-in fade-in zoom-in-95 z-30">
          ✓ Link copied to clipboard!
        </div>
      )}

      <button
        type="button"
        id={`like-btn-${postId}`}
        onClick={toggleLike}
        className={`min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-all ${
          hasLiked
            ? 'text-[var(--red)] bg-[var(--red-soft)]'
            : 'text-[var(--navy-600)] hover:bg-[var(--off-white)] hover:text-[var(--red)]'
        }`}
        title="Like card"
      >
        <svg
          className={`w-5 h-5 transition-transform ${bouncing ? 'scale-125' : 'scale-100'}`}
          viewBox="0 0 24 24"
          fill={hasLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
        <span className="text-xs">{likes}</span>
      </button>

      <button
        type="button"
        id={`comment-btn-${postId}`}
        onClick={(e) => {
          e.stopPropagation();
          onOpenComments(post);
        }}
        className="min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-[var(--navy-600)] hover:bg-[var(--off-white)] hover:text-[var(--navy-900)] transition"
        title="Comments"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="text-xs">{commentsCount}</span>
      </button>

      <button
        type="button"
        id={`share-btn-${postId}`}
        onClick={handleShare}
        className="min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold text-[var(--navy-600)] hover:bg-[var(--off-white)] hover:text-[var(--navy-900)] transition"
        title="Share card"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        <span className="hidden sm:inline text-xs">Share</span>
      </button>

      <button
        type="button"
        id={`save-btn-${postId}`}
        onClick={toggleSave}
        className={`min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold transition ${
          saved
            ? 'text-[var(--navy-900)] bg-[var(--navy-200)]'
            : 'text-[var(--navy-600)] hover:bg-[var(--off-white)] hover:text-[var(--navy-900)]'
        }`}
        title="Save card"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <span className="hidden sm:inline text-xs">{saved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
