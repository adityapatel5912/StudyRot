import React, { useState } from 'react';
import SourcePanel from './components/SourcePanel.jsx';
import SnapFeed from './components/SnapFeed.jsx';
import { generateFromText, generateFromFile } from './api.js';
import { SAMPLE_FEEDS } from './sampleData.js';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (config) => {
    setLoading(true);
    setError(null);
    setTimerSeconds(config.quizTimer || 20);

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
        });
      } else {
        // Topic or paste mode
        result = await generateFromText({
          groq_key: config.groq_key,
          tavily_key: config.tavily_key,
          text: config.text,
          vibe: config.vibe,
          is_topic: config.is_topic,
          subject: config.subject,
          grade: config.grade,
        });
      }

      if (result && Array.isArray(result.posts) && result.posts.length > 0) {
        setPosts(result.posts);
      } else {
        throw new Error('No posts were generated. Please check your Groq API key or try a different topic.');
      }
    } catch (err) {
      console.error('Generation error:', err);

      // If user is testing without an active Groq API key, load corresponding CBSE sample feed
      const lowerText = (config.text || '').toLowerCase();
      if (
        err.message?.includes('API key') ||
        err.message?.includes('Failed to connect') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('Failed to fetch') ||
        !config.groq_key
      ) {
        if (config.subject === 'Maths' || lowerText.includes('parabola') || lowerText.includes('math')) {
          setPosts(SAMPLE_FEEDS.maths_12.posts);
          setError('Loaded pre-calibrated NCERT Maths feed (add your Groq API key above for dynamic custom chapters).');
          return;
        } else if (config.subject === 'SST' || lowerText.includes('national') || lowerText.includes('history')) {
          setPosts(SAMPLE_FEEDS.sst_10.posts);
          setError('Loaded pre-calibrated NCERT SST feed (add your Groq API key above for dynamic custom chapters).');
          return;
        } else {
          setPosts(SAMPLE_FEEDS.science_10.posts);
          setError('Loaded pre-calibrated NCERT Science feed (add your Groq API key above for dynamic custom chapters).');
          return;
        }
      }

      setError(err.message || 'An error occurred while generating the feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPosts([]);
    setError(null);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--off-white)] text-[var(--navy-900)]">
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
          onReset={handleReset}
        />
      )}
    </div>
  );
}
