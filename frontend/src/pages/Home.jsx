import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SourcePanel from '../components/SourcePanel.jsx';
import SnapFeed from '../components/SnapFeed.jsx';
import { generateFromText, generateFromFile } from '../api.js';
import { SAMPLE_FEEDS } from '../sampleData.js';
import { useAuth } from '../contexts/AuthProvider.jsx';

export default function Home({ soundEnabled = true, activePosts, setActivePosts }) {
  const navigate = useNavigate();
  const { token, demoMode } = useAuth();

  const [posts, setPosts] = useState(activePosts || []);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedMeta, setFeedMeta] = useState({
    subject: 'Science',
    grade: 10,
    topic: 'Light — Reflection and Refraction',
  });

  React.useEffect(() => {
    if (activePosts && activePosts.length > 0) {
      setPosts(activePosts);
    }
  }, [activePosts]);

  const handleGenerate = async (config) => {
    setLoading(true);
    setError(null);
    setTimerSeconds(config.quizTimer || 20);
    setFeedMeta({
      subject: config.subject,
      grade: config.grade,
      topic: config.text || (config.file ? config.file.name : 'CBSE Topic'),
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
      } else {
        throw new Error('No posts generated. Try a different topic or verify your keys.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      const lowerText = (config.text || '').toLowerCase();

      // Graceful demo/fallback handling
      if (config.subject === 'Maths' || lowerText.includes('parabola') || lowerText.includes('math')) {
        const fallback = SAMPLE_FEEDS.maths_12.posts;
        setPosts(fallback);
        setActivePosts?.(fallback);
        setError('Demo Mode: Loaded curated NCERT Class 12 Maths feed.');
      } else if (config.subject === 'SST' || lowerText.includes('national') || lowerText.includes('history')) {
        const fallback = SAMPLE_FEEDS.sst_10.posts;
        setPosts(fallback);
        setActivePosts?.(fallback);
        setError('Demo Mode: Loaded curated NCERT Class 10 SST feed.');
      } else {
        const fallback = SAMPLE_FEEDS.science_10.posts;
        setPosts(fallback);
        setActivePosts?.(fallback);
        setError('Demo Mode: Loaded curated NCERT Class 10 Science feed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPosts([]);
    setActivePosts?.([]);
    setError(null);
  };

  const handleStartBattle = (battleData) => {
    navigate('/battle/new', {
      state: {
        questions: battleData.posts,
        topic: feedMeta.topic || 'NCERT Chapter Battle',
      },
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[var(--off-white)]">
      {posts.length === 0 ? (
        <SourcePanel
          onGenerate={handleGenerate}
          isLoading={loading}
          error={error}
        />
      ) : (
        <SnapFeed
          posts={posts}
          timerSeconds={timerSeconds}
          soundEnabled={soundEnabled}
          onReset={handleReset}
          onStartBattle={handleStartBattle}
          feedMeta={feedMeta}
        />
      )}
    </div>
  );
}
