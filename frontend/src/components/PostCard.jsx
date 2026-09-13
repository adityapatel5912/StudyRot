import React, { useState } from 'react';
import AnimatedDiagram from './AnimatedDiagram.jsx';
import Quiz from './Quiz.jsx';
import FullScreenQuiz from './FullScreenQuiz.jsx';
import InteractionBar from './InteractionBar.jsx';
import MathText from './MathText.jsx';
import { BookOpen, Sparkles } from 'lucide-react';
import { useTalk } from '../contexts/TalkProvider.jsx';

const TYPE_CONFIG = {
  key_point: { label: 'Key Point', emoji: '🔑' },
  analogy: { label: 'Desi Analogy', emoji: '🧠' },
  apply: { label: 'Real-World Apply', emoji: '🇮🇳' },
  exam_tip: { label: 'CBSE Board Tip', emoji: '🎯' },
  recap: { label: 'Checkpoint Recap', emoji: '🔁' },
  myth_buster: { label: 'Myth Buster', emoji: '🚨' },
  quiz: { label: 'Board MCQ', emoji: '❓' },
  summary: { label: 'Revision Summary', emoji: '📌' },
  formula: { label: 'Formula Card', emoji: '📐' },
  timeline: { label: 'History Timeline', emoji: '🕰️' },
};

function calculateWordSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  const set1 = new Set(text1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  const set2 = new Set(text2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  if (set1.size === 0 || set2.size === 0) return 0;
  const common = new Set([...set1].filter((w) => set2.has(w)));
  const total = new Set([...set1, ...set2]);
  return total.size > 0 ? common.size / total.size : 0;
}

export default function PostCard({
  post,
  index = 0,
  totalPosts = 15,
  timerSeconds = 20,
  soundEnabled = true,
  onToggleSound,
  onOpenComments,
  onSaveChange,
  feedCode = '',
  isSandbox = false,
}) {
  const [fullscreenQuizOpen, setFullscreenQuizOpen] = useState(false);
  const { openDoubt } = useTalk();

  if (!post) return null;

  const subject = post.subject || 'Science';
  const typeMeta = TYPE_CONFIG[post.type] || {
    label: post.type || 'Concept',
    emoji: '💡',
  };

  // Content duplication check: suppress analogy/tip callout if >70% similar to body
  const showAnalogyCallout =
    Boolean(post.analogy && post.analogy.trim()) &&
    calculateWordSimilarity(post.body, post.analogy) <= 0.70;

  return (
    <>
      <article
        className="post-card-inner"
        data-subject={subject}
        id={`post-card-${index}`}
        role="article"
        aria-label={`${typeMeta.label}: ${post.title}`}
      >
        {/* Header row: type chip + Class / Subject meta */}
        <div className="post-header-row">
          <span className="post-type-chip">
            <span>{typeMeta.emoji}</span> {typeMeta.label}
          </span>
          <span className="post-meta-tag">
            Class {post.grade || '10'} · {subject}
          </span>
        </div>

        {/* Post Title: 22px bold navy-900 */}
        <h2 className="post-title-text">
          <MathText>{post.title}</MathText>
        </h2>

        {/* Post Body: 15px navy-700 */}
        <p className="post-body-text">
          <MathText>{post.body}</MathText>
        </p>

        {/* Animated Diagram */}
        {post.diagram && post.diagram.trim() !== '' && (
          <div className="diagram-container-box">
            <AnimatedDiagram svg={post.diagram} />
          </div>
        )}

        {/* Analogy or Exam Tip Callout: only rendered if distinct from body */}
        {showAnalogyCallout && (
          <div className="analogy-callout-box">
            <div className="analogy-callout-title">
              {post.type === 'exam_tip' ? '🎯 Actionable CBSE Tip' : '🧠 Desi Intuition'}
            </div>
            <div className="analogy-callout-body">
              <MathText>{post.analogy}</MathText>
            </div>
          </div>
        )}

        {/* Timed Quiz */}
        {post.quiz && (
          <Quiz
            quiz={post.quiz}
            seconds={timerSeconds}
            soundEnabled={soundEnabled}
            onOpenFullscreen={() => setFullscreenQuizOpen(true)}
          />
        )}

        {/* Source Reference with Book Icon */}
        {post.source_ref && (
          <div className="post-source-footer">
            <BookOpen className="w-3.5 h-3.5 text-navy-400 flex-shrink-0" />
            <span>{post.source_ref}</span>
          </div>
        )}

        {/* Hashtag outline chips */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="hashtags-row">
            {post.hashtags.map((tag, i) => (
              <span key={i} className="hashtag-outline-chip">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* Ask Tutor Action Chip */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() =>
              openDoubt({
                question: `Explain "${post.title}" with derivations, diagrams, and examples.`,
                subject: post.subject || 'Science',
                grade: post.grade || 10,
                autoSolve: true,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition shadow-sm"
            title="Ask StudyRot Tutor to explain this concept"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ask Tutor about this</span>
          </button>
        </div>

        {/* Interaction Bar (Likes, Comments, Share, Save) */}
        <InteractionBar
          post={post}
          postId={post.id || `post_${index}`}
          initialLikes={post.engagement?.likes || 0}
          initialCommentsCount={post.engagement?.comments?.length || 0}
          postTitle={post.title}
          onOpenComments={onOpenComments}
          onSaveChange={onSaveChange}
          postData={post}
          feedCode={feedCode}
          postIndex={index}
          isSandbox={isSandbox}
        />
      </article>

      {/* Rebuilt Fullscreen Quiz Overlay */}
      {fullscreenQuizOpen && post.quiz && (
        <FullScreenQuiz
          quiz={post.quiz}
          seconds={timerSeconds}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          onClose={() => setFullscreenQuizOpen(false)}
          currentIndex={index}
          totalPosts={totalPosts}
        />
      )}
    </>
  );
}
