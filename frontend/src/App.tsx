/** Root application component wiring TopBar, SourcePanel, SnapFeed, Classroom Battle Arena, and persistent storage. */
import React, { useState, useEffect } from 'react';
import SourcePanel from './components/SourcePanel.jsx';
import SnapFeed from './components/SnapFeed.jsx';
import TopBar from './components/TopBar.jsx';
import MyFeedsModal from './components/MyFeedsModal.jsx';
import KeysModal from './components/KeysModal.jsx';
import SavedPostsModal from './components/SavedPostsModal.jsx';
import BattleContainer from './components/battle/BattleContainer.jsx';
import { AuthProvider, useAuth } from './components/AuthProvider.jsx';
import { generateFromText, generateFromFile } from './api.js';
import { SAMPLE_FEEDS } from './sampleData.js';
import { useToast } from './hooks/useToast.js';
import { saveLastFeed, getRestorableFeed, clearLastFeed } from './utils/storage.js';
import { compressSvg } from './utils/svgCompress.js';
import { AlertCircle, CheckCircle, Info, X, RotateCcw } from 'lucide-react';

function MainApp() {
  const { token, demoMode } = useAuth();
  const { toast, showError, showSuccess, hideToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedMeta, setFeedMeta] = useState<any>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [restorable, setRestorable] = useState<any>(null);
  const [battleActive, setBattleActive] = useState<boolean>(false);
  const [battleTopic, setBattleTopic] = useState<string>('NCERT Board Battle');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('studyrot:soundEnabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('studyrot_saved_posts') || '[]');
        setSavedCount(saved.length);
      } catch {}
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  useEffect(() => {
    const cached = getRestorableFeed();
    if (cached && Array.isArray(cached.feed) && cached.feed.length > 0) {
      setRestorable(cached);
    }
  }, []);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('studyrot:soundEnabled', String(next));
      } catch {}
      return next;
    });
  };

  const handleRestoreFeed = () => {
    if (!restorable) return;
    setPosts(restorable.feed);
    setFeedMeta(restorable.metadata || {});
    setRestorable(null);
    showSuccess(`Restored previous feed (${restorable.ageMinutes}m ago)`);
  };

  const handleDismissRestore = () => {
    setRestorable(null);
    clearLastFeed();
  };

  const handleGenerate = async (config) => {
    setLoading(true);
    setError(null);
    setTimerSeconds(config.quizTimer || 20);
    const meta = {
      topic: config.text || (config.file ? config.file.name : 'CBSE Chapter'),
      subject: config.subject,
      grade: config.grade,
    };
    setFeedMeta(meta);

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
        const processedPosts = result.posts.map((p) => ({
          ...p,
          diagram: p.diagram ? compressSvg(p.diagram) : '',
        }));

        setPosts(processedPosts);
        saveLastFeed(processedPosts, meta);
        setRestorable(null);
        showSuccess(`Generated ${processedPosts.length} NCERT feed cards!`);
      } else {
        throw new Error('No posts returned from generator. Loaded fallback feed.');
      }
    } catch (err) {
      console.warn('Generation error handled with calibrated fallback:', err);
      showError(err.message || 'Error generating feed. Using calibrated NCERT feed.');

      const lowerText = (config.text || '').toLowerCase();
      let fallbackPosts: any[] = (SAMPLE_FEEDS as any).science_10.posts;

      if (lowerText.includes('electric') || lowerText.includes('ohm') || lowerText.includes('circuit')) {
        fallbackPosts = (SAMPLE_FEEDS as any).electricity_10?.posts || (SAMPLE_FEEDS as any).science_10.posts;
      } else if (config.subject === 'Maths' || lowerText.includes('parabola') || lowerText.includes('math')) {
        fallbackPosts = (SAMPLE_FEEDS as any).maths_12.posts;
      } else if (config.subject === 'SST' || lowerText.includes('national') || lowerText.includes('history')) {
        fallbackPosts = (SAMPLE_FEEDS as any).sst_10.posts;
      }

      const processed = fallbackPosts.map((p) => ({
        ...p,
        diagram: p.diagram ? compressSvg(p.diagram) : '',
      }));

      setPosts(processed);
      saveLastFeed(processed, meta);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPosts([]);
    setError(null);
    setBattleActive(false);
  };

  const handleLoadSavedFeed = (savedPosts) => {
    if (savedPosts && savedPosts.length > 0) {
      const processed = savedPosts.map((p) => ({
        ...p,
        diagram: p.diagram ? compressSvg(p.diagram) : '',
      }));
      setPosts(processed);
      setError(null);
      showSuccess(`Loaded saved feed (${processed.length} cards)`);
    }
  };

  const handleViewSinglePost = (post) => {
    setPosts([post]);
  };

  const handleStartBattle = (customMeta: any = {}) => {
    const title = customMeta?.topic || feedMeta?.topic || 'NCERT Chapter Battle';
    setBattleTopic(title);
    setBattleActive(true);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--off-white)] text-[var(--navy-900)] flex flex-col font-sans">
      <TopBar
        onOpenMyFeeds={() => setActiveModal('my-feeds')}
        onOpenSavedPosts={() => setActiveModal('saved')}
        onOpenKeys={() => setActiveModal('keys')}
        onOpenBattle={() => handleStartBattle()}
        savedPostsCount={savedCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {restorable && posts.length === 0 && !battleActive && (
        <aside
          id="restore-feed-banner"
          className="bg-navy-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm border-b border-navy-800 shadow-sm"
          aria-label="Restore Previous Study Session"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Previous feed on <strong className="text-amber-300">{restorable.metadata.topic || 'NCERT Chapter'}</strong> available ({restorable.ageMinutes}m ago)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="restore-feed-confirm-btn"
              onClick={handleRestoreFeed}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold rounded-lg transition text-xs shadow-sm"
            >
              Restore Feed
            </button>
            <button
              type="button"
              id="restore-feed-dismiss-btn"
              onClick={handleDismissRestore}
              className="p-1 text-navy-400 hover:text-white transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col">
        {battleActive ? (
          <BattleContainer
            feedQuestions={posts}
            topicTitle={battleTopic}
            soundEnabled={soundEnabled}
            onExit={() => setBattleActive(false)}
          />
        ) : posts.length === 0 ? (
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
      </main>

      {activeModal === 'my-feeds' && (
        <MyFeedsModal
          onClose={() => setActiveModal(null)}
          onLoadFeed={handleLoadSavedFeed}
        />
      )}

      {activeModal === 'saved' && (
        <SavedPostsModal
          onClose={() => setActiveModal(null)}
          onViewPost={handleViewSinglePost}
        />
      )}

      {activeModal === 'keys' && (
        <KeysModal onClose={() => setActiveModal(null)} />
      )}

      {toast && (
        <div
          id="global-toast"
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-semibold max-w-sm animate-in slide-in-from-bottom-2 bg-white"
        >
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-navy-600 flex-shrink-0" />}
          <span className="text-navy-900 flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={hideToast}
            className="text-navy-400 hover:text-navy-700 p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
