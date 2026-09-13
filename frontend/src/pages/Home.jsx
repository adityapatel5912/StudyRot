import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SourcePanel from '../components/SourcePanel.jsx';
import SnapFeed from '../components/SnapFeed.jsx';
import DailyReviewCard from '../components/DailyReviewCard.jsx';
import WeaknessReport from '../components/WeaknessReport.jsx';
import Tour from '../components/Tour.jsx';
import DemoBanner from '../components/DemoBanner.jsx';
import { useTour } from '../hooks/useTour.js';
import { useSandbox } from '../contexts/SandboxProvider.jsx';
import { generateFromText, generateFromFile } from '../api.js';
import { useAuth } from '../contexts/AuthProvider.jsx';

export default function Home({ soundEnabled = true, activePosts, setActivePosts }) {
  const navigate = useNavigate();
  const { token, demoMode } = useAuth();
  const { isSandbox, sandboxMode, sandboxFeed, startSandbox, exitSandbox } = useSandbox();
  const { tourSeen, isTourActive, currentStep, startTour, nextStep, endTour } = useTour();

  const [posts, setPosts] = useState(activePosts || []);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedMeta, setFeedMeta] = useState({
    subject: 'Science',
    grade: 10,
    topic: 'Light — Reflection and Refraction',
    feedCode: '',
  });

  // Restore chip state for previous session
  const [savedLocalFeed, setSavedLocalFeed] = useState(null);
  const [dismissRestore, setDismissRestore] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('studyrot:lastFeed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
          setSavedLocalFeed(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (activePosts && activePosts.length > 0) {
      setPosts(activePosts);
    }
  }, [activePosts]);

  const handleRestoreFeed = () => {
    if (savedLocalFeed) {
      setPosts(savedLocalFeed.posts);
      setActivePosts?.(savedLocalFeed.posts);
      setFeedMeta(savedLocalFeed.meta || feedMeta);
      setSavedLocalFeed(null);
    }
  };

  const handleDismissRestore = () => {
    setDismissRestore(true);
    setSavedLocalFeed(null);
  };

  const handleGenerate = async (config) => {
    setLoading(true);
    setError(null);
    setTimerSeconds(config.quizTimer || 20);

    const topicLabel = config.text || (config.file ? config.file.name : 'CBSE Topic');
    setFeedMeta({
      subject: config.subject,
      grade: config.grade,
      topic: topicLabel,
      feedCode: '',
    });

    try {
      let result;
      if (config.mode === 'file' && config.file) {
        result = await generateFromFile({
          groq_key: config.groq_key,
          tavily_key: config.tavily_key,
          vibe: config.vibe,
          subject: config.subject,
          grade: config.grade,
          file: config.file,
          token,
        });
      } else {
        result = await generateFromText({
          groq_key: config.groq_key,
          tavily_key: config.tavily_key,
          text: config.text,
          vibe: config.vibe,
          is_topic: config.is_topic,
          subject: config.subject,
          grade: config.grade,
          isDemoMode: config.isDemoMode ?? demoMode,
          token,
        });
      }

      if (result && Array.isArray(result.posts) && result.posts.length > 0) {
        setPosts(result.posts);
        setActivePosts?.(result.posts);
        setFeedMeta((prev) => ({
          ...prev,
          feedCode: result.feed_code || '',
        }));

        // Persist to localStorage for session restore prompt
        try {
          localStorage.setItem(
            'studyrot:lastFeed',
            JSON.stringify({
              posts: result.posts,
              meta: {
                subject: config.subject,
                grade: config.grade,
                topic: topicLabel,
                feedCode: result.feed_code || '',
              },
            })
          );
        } catch {}
      } else {
        throw new Error('Generation failed. Try again.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      // Real user data only: Show retry error, NEVER fall back to pre-baked demo feeds
      setError(err.message || 'Generation failed. Try again with a different topic.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (isSandbox) exitSandbox();
    setPosts([]);
    setActivePosts?.([]);
    setError(null);
  };

  const handleStartBattle = (battleData) => {
    navigate('/battle/solo', {
      state: {
        questions: battleData.posts,
        topic: feedMeta.topic || 'NCERT Chapter Battle',
      },
    });
  };

  const isFeedSandbox = isSandbox && sandboxMode === 'feed';
  const displayPosts = isFeedSandbox ? sandboxFeed : posts;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[var(--off-white)]">
      {isFeedSandbox && (
        <DemoBanner featureName="Feed Sandbox" onExit={handleReset} />
      )}

      {/* 5-Step Guided Tour Modal */}
      <Tour
        isOpen={isTourActive}
        currentStep={currentStep}
        onNext={currentStep === 4 ? endTour : nextStep}
        onSkip={endTour}
      />

      {displayPosts.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* See how it works banner (First visit only, dismissible) */}
          {!tourSeen && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--navy-900)] to-[var(--navy-800)] text-white shadow-md flex items-center justify-between gap-4 animate-in slide-in-from-top">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <h4 className="text-xs sm:text-sm font-bold">New to StudyRot?</h4>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Take a 60-second tour of StudyRot — feed, quizzes, review, battles.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={startTour}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-[var(--navy-900)] text-xs font-bold hover:bg-slate-100 transition shadow-xs"
                >
                  Take the tour →
                </button>
              </div>
            </div>
          )}

          {/* Restore previous feed chip (if exists and not dismissed) */}
          {savedLocalFeed && !dismissRestore && (
            <div className="p-3.5 rounded-2xl bg-white border border-[var(--border)] shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <span className="text-xs font-semibold text-[var(--navy-800)]">
                  Restore last feed: "{savedLocalFeed.meta?.topic || 'CBSE Notes'}"?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDismissRestore}
                  className="text-xs text-slate-400 hover:text-slate-700 px-2"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleRestoreFeed}
                  className="px-3 py-1 rounded-lg bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition"
                >
                  Restore Feed
                </button>
              </div>
            </div>
          )}

          {/* Daily Review Card (Only shows if student has set exam date & completed 1 review) */}
          <DailyReviewCard onOpenSandbox={() => { startSandbox('review'); navigate('/review'); }} />

          {/* Weakness Report (Only shows after 10+ wrong answers) */}
          <WeaknessReport
            onStartDrill={(drillTopic, drillSubject) => {
              handleGenerate({
                text: drillTopic,
                subject: drillSubject || 'Science',
                grade: 10,
                vibe: 'Instagram',
                is_topic: true,
              });
            }}
          />

          {/* Source Panel */}
          <SourcePanel
            onGenerate={handleGenerate}
            isLoading={loading}
            error={error}
          />

          {/* Sandbox Access Bar for guests */}
          <div className="text-center pt-2">
            <span className="text-[11px] text-[var(--navy-400)] mr-2">
              Want to try without generating?
            </span>
            <button
              type="button"
              onClick={() => startSandbox('feed')}
              className="text-[11px] text-[var(--navy-900)] font-bold underline hover:text-amber-700"
            >
              Launch 4-Post Feed Sandbox
            </button>
          </div>
        </div>
      ) : (
        <SnapFeed
          posts={displayPosts}
          timerSeconds={timerSeconds}
          soundEnabled={soundEnabled}
          onReset={handleReset}
          onStartBattle={handleStartBattle}
          feedMeta={feedMeta}
          feedCode={feedMeta.feedCode}
          isSandbox={isFeedSandbox}
        />
      )}
    </div>
  );
}
