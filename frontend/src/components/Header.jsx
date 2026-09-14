import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Swords,
  LogIn,
  LogOut,
  Bookmark,
  Key,
  Mic,
  HelpCircle,
  Target,
  FileText,
  Users,
  Camera,
  Calendar,
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider.jsx';
import { useTalk } from '../contexts/TalkProvider.jsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const FEATURES = [
  {
    id: 'talk',
    label: 'Voice Tutor',
    tag: 'AI Voice',
    icon: Mic,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
    desc: 'Conversational audio tutor with low latency, verified CBSE answers, and voice playback.',
    action: 'talk',
  },
  {
    id: 'doubt',
    label: 'Ask Doubt',
    tag: '3D & Sims',
    icon: HelpCircle,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
    desc: 'Instant doubt solver with step derivations, interactive graphs, and 3D simulations.',
    action: 'doubt',
  },
  {
    id: 'plan',
    label: 'Study Plan',
    tag: 'FSRS-6',
    path: '/plan',
    icon: Target,
    colorClass: 'text-amber-600',
    activeBgClass: 'bg-amber-600 text-white border-amber-600',
    bgClass: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
    desc: '7-day adaptive schedule optimized by FSRS-6 retention stability and exam countdown.',
  },
  {
    id: 'mock',
    label: 'Mock Test',
    tag: 'CBSE Board',
    path: '/mock',
    icon: FileText,
    colorClass: 'text-indigo-600',
    activeBgClass: 'bg-indigo-600 text-white border-indigo-600',
    bgClass: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
    desc: 'Full-length 80 marks, 180-min timed exam with official blueprints, PYQs & marking scheme.',
  },
  {
    id: 'room',
    label: 'Study Room',
    tag: 'Multiplayer',
    path: '/room',
    icon: Users,
    colorClass: 'text-teal-600',
    activeBgClass: 'bg-teal-600 text-white border-teal-600',
    bgClass: 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100',
    desc: 'Collaborative rooms for 2–8 students with sync mode, chat moderation & group quizzes.',
  },
  {
    id: 'check-work',
    label: 'Check Work',
    tag: 'NVIDIA OCR',
    path: '/check-work',
    icon: Camera,
    colorClass: 'text-purple-600',
    activeBgClass: 'bg-purple-600 text-white border-purple-600',
    bgClass: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100',
    desc: 'Snap handwritten CBSE homework for instant OCR grading and step-by-step feedback.',
  },
  {
    id: 'review',
    label: 'Review',
    tag: 'Retention',
    path: '/review',
    icon: Calendar,
    colorClass: 'text-blue-600',
    activeBgClass: 'bg-blue-600 text-white border-blue-600',
    bgClass: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100',
    desc: 'Daily spaced repetition card queue powered by FSRS-6 to lock concepts into memory.',
  },
  {
    id: 'battle',
    label: 'Solo Battle',
    tag: 'AI Bots',
    path: '/battle/solo',
    icon: Swords,
    colorClass: 'text-red-600',
    activeBgClass: 'bg-red-600 text-white border-red-600',
    bgClass: 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100',
    desc: 'Rapid-fire competitive quiz matches against CBSE syllabus-aligned AI bots.',
  },
];

export default function Header({ soundEnabled = true, onToggleSound }) {
  const { user, demoMode, signInWithGoogle, signOut } = useAuth();
  const { openTalkMode, openDoubt } = useTalk();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const ribbonRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftVal, setScrollLeftVal] = useState(0);

  const isCurrent = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  // Check scroll bounds to display arrows and fades
  const updateScrollState = useCallback(() => {
    const el = ribbonRef.current;
    if (!el) return;
    const hasLeft = el.scrollLeft > 6;
    const hasRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 6;
    setCanScrollLeft(hasLeft);
    setCanScrollRight(hasRight);
  }, []);

  useEffect(() => {
    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollState]);

  // Close menu modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  // Smooth scroll left / right buttons
  const handleScrollRibbon = (direction) => {
    if (!ribbonRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    ribbonRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(updateScrollState, 250);
  };

  // Mouse drag-to-scroll support for desktop users without trackpad
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !ribbonRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - ribbonRef.current.offsetLeft);
    setScrollLeftVal(ribbonRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !ribbonRef.current) return;
    e.preventDefault();
    const x = e.pageX - ribbonRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    ribbonRef.current.scrollLeft = scrollLeftVal - walk;
    updateScrollState();
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  // Vertical wheel to horizontal scroll on ribbon
  const handleWheel = (e) => {
    if (!ribbonRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      ribbonRef.current.scrollLeft += e.deltaY;
      updateScrollState();
    }
  };

  const handleFeatureClick = (feat) => {
    setMenuOpen(false);
    if (feat.action === 'talk') {
      openTalkMode();
    } else if (feat.action === 'doubt') {
      openDoubt();
    } else if (feat.path) {
      navigate(feat.path);
    }
  };

  return (
    <header className="header-wrapper" role="banner">
      {/* Row 1: Brand & User Utilities (48px) */}
      <div className="header-row-1">
        <div className="header-left">
          <Link to="/" className="header-brand-title" aria-label="StudyRot Home">
            <span className="header-brand-dot" aria-hidden="true" />
            <span>StudyRot</span>
          </Link>
          <span className="header-subtitle hidden md:inline">CBSE NCERT Feed</span>
        </div>

        <div className="header-right">
          {/* Features Menu Card Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            title="Open Features Directory"
            aria-label="Open Features Directory"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition shrink-0 shadow-xs"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Features</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            className="p-1.5 rounded-full border border-[var(--border)] bg-[var(--off-white)] hover:bg-[#eef3fc] text-[var(--navy-700)] transition shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-navy-400" />
            )}
          </button>

          {/* Saved Feeds */}
          <Link
            to="/saved"
            className="p-1.5 rounded-full border border-[var(--border)] bg-[var(--off-white)] hover:bg-[#eef3fc] text-[var(--navy-700)] transition shrink-0"
            title="Saved Feeds & Bookmarks"
            aria-label="View Saved Feeds"
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          {/* API Keys */}
          {!demoMode && (
            <Link
              to="/keys"
              className="p-1.5 rounded-full border border-[var(--border)] bg-[var(--off-white)] hover:bg-[#eef3fc] text-[var(--navy-700)] transition shrink-0"
              title="API Keys Configuration"
              aria-label="Configure API Keys"
            >
              <Key className="w-4 h-4" />
            </Link>
          )}

          {/* Sign In / User Avatar */}
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-[var(--navy-800)] hidden sm:inline max-w-[120px] truncate">
                {user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1.5 rounded-full border border-[var(--border)] hover:bg-red-50 text-[var(--red)] transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center gap-1 text-xs font-bold text-[var(--navy-800)] hover:text-[var(--navy-600)] transition px-2.5 py-1 rounded-full border border-[var(--border)] bg-slate-50 hover:bg-slate-100 shrink-0"
              aria-label="Sign In with Google"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Dedicated Feature Navigation Ribbon (Scrollable horizontally, invisible scrollbar) */}
      <div className="header-ribbon-container">
        {/* Left Arrow & Fade */}
        {canScrollLeft && (
          <>
            <div className="header-ribbon-fade-left" aria-hidden="true" />
            <button
              type="button"
              onClick={() => handleScrollRibbon('left')}
              className="header-ribbon-arrow left"
              aria-label="Scroll navigation left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        <nav
          ref={ribbonRef}
          onScroll={updateScrollState}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className="header-nav-ribbon"
          aria-label="Feature navigation"
        >
          {/* Quick Menu Card Pill */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="header-pill bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs"
            title="Browse all features in a directory card"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>All Features</span>
          </button>

          {/* 8 Feature Pills */}
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const active = feat.path ? isCurrent(feat.path) : false;

            if (feat.action) {
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => handleFeatureClick(feat)}
                  className={`header-pill ${feat.bgClass} shadow-xs`}
                  title={feat.desc}
                >
                  <Icon className={`w-3.5 h-3.5 ${feat.colorClass} shrink-0`} />
                  <span>{feat.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={feat.id}
                to={feat.path}
                className={`header-pill ${
                  active ? `${feat.activeBgClass} shadow-sm` : feat.bgClass
                }`}
                title={feat.desc}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${active ? 'text-white' : feat.colorClass} shrink-0`}
                />
                <span>{feat.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Arrow & Fade */}
        {canScrollRight && (
          <>
            <div className="header-ribbon-fade-right" aria-hidden="true" />
            <button
              type="button"
              onClick={() => handleScrollRibbon('right')}
              className="header-ribbon-arrow right"
              aria-label="Scroll navigation right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Row 3: 28px, navy-900 bg, white text, single status bar */}
      <div className="header-row-2">
        <span className="demo-mode-dot" aria-hidden="true" />
        <span className="truncate text-xs">
          Demo Mode — Instant curated NCERT feeds · Free access ·{' '}
          {!user ? (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="underline font-bold text-amber-300 hover:text-white transition ml-1"
            >
              [Sign in]
            </button>
          ) : (
            <span className="text-emerald-400 font-bold ml-1">✓ Signed in</span>
          )}
        </span>
      </div>

      {/* Responsive Features Menu Card Modal */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Features Directory"
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                    StudyRot Features Directory
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Quickly jump to any AI study tool, mock exam, or collaborative space.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Grid of Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {FEATURES.map((feat) => {
                const Icon = feat.icon;
                const active = feat.path ? isCurrent(feat.path) : false;

                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => handleFeatureClick(feat)}
                    className={`text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 group ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            active ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? 'text-white' : feat.colorClass}`} />
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition">
                          {feat.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {feat.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {feat.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">ESC to close</span>
              <div className="flex items-center gap-3">
                <Link
                  to="/saved"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-indigo-600 transition font-bold"
                >
                  Saved Feeds
                </Link>
                <span>·</span>
                <Link
                  to="/keys"
                  onClick={() => setMenuOpen(false)}
                  className="hover:text-indigo-600 transition font-bold"
                >
                  API Keys
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

