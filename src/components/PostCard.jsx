/** Feed post card with MathText LaTeX rendering, dynamic diagrams, and interaction controls. */
import React from 'react';
import AnimatedDiagram from './AnimatedDiagram.jsx';
import Quiz from './Quiz.jsx';
import InteractionBar from './InteractionBar.jsx';
import MathText from './MathText.jsx';

/** Calculates word-overlap similarity to prevent duplicate body/callout text (>70% overlap) */
function isSimilar(textA, textB) {
  if (!textA || !textB) return false;
  const cleanA = textA.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const cleanB = textB.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (cleanA === cleanB) return true;
  const wordsA = new Set(cleanA.split(/\s+/).filter(Boolean));
  const wordsB = new Set(cleanB.split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  let matches = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) matches++;
  }
  const similarity = matches / Math.max(wordsA.size, wordsB.size);
  return similarity >= 0.7;
}

const TYPE_CONFIG = {
  key_point: { label: 'Key Point', emoji: '🔑', pillClass: 'bg-[var(--navy-200)] text-[var(--navy-900)]' },
  analogy: { label: 'Desi Analogy', emoji: '🧠', pillClass: 'bg-purple-100 text-purple-900' },
  apply: { label: 'Real-World Apply', emoji: '🇮🇳', pillClass: 'bg-emerald-100 text-emerald-900' },
  exam_tip: { label: 'CBSE Board Tip', emoji: '🎯', pillClass: 'bg-amber-100 text-amber-900' },
  recap: { label: 'Checkpoint Recap', emoji: '🔁', pillClass: 'bg-blue-100 text-blue-900' },
  myth_buster: { label: 'Myth Buster', emoji: '🚨', pillClass: 'bg-red-100 text-red-900' },
  quiz: { label: 'Board MCQ', emoji: '❓', pillClass: 'bg-orange-100 text-orange-900' },
  summary: { label: 'Revision Summary', emoji: '📌', pillClass: 'bg-indigo-100 text-indigo-900' },
  formula: { label: 'Formula Card', emoji: '📐', pillClass: 'bg-cyan-100 text-cyan-900' },
  timeline: { label: 'History Timeline', emoji: '🕰️', pillClass: 'bg-amber-100 text-amber-900' },
};

export default function PostCard({ post, timerSeconds = 20, soundEnabled = true, onOpenComments, onSaveChange }) {
  if (!post) return null;

  const subject = post.subject || 'Science';
  const typeMeta = TYPE_CONFIG[post.type] || {
    label: post.type || 'Concept',
    emoji: '💡',
    pillClass: 'bg-[var(--navy-200)] text-[var(--navy-900)]',
  };

  return (
    <article
      className="card-inner"
      data-subject={subject}
      id={`post-${(post.title || '').replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Top row: Type badge + Class/Subject badge */}
      <div className="badge-row">
        <span className={`type-badge ${typeMeta.pillClass}`}>
          <span>{typeMeta.emoji}</span>
          <span>{typeMeta.label}</span>
        </span>
        <span className="grade-subject-tag">
          Class {post.grade || '10'} • {subject}
        </span>
      </div>

      {/* Post Title & Body rendered with KaTeX MathText */}
      <h2 className="post-title">
        <MathText>{post.title}</MathText>
      </h2>
      <div className="post-body">
        <MathText>{post.body}</MathText>
      </div>

      {/* Animated Diagram if present */}
      {post.diagram && post.diagram.trim() !== '' && (
        <AnimatedDiagram svg={post.diagram} />
      )}

      {/* Analogy Callout if present and not duplicating body */}
      {post.analogy && post.analogy.trim() !== '' && !isSimilar(post.body, post.analogy) && (
        <div className="analogy-callout">
          <div className="analogy-title">🧠 Desi Analogy</div>
          <div className="text-xs sm:text-sm text-[var(--navy-800)] leading-relaxed">
            <MathText>{post.analogy}</MathText>
          </div>
        </div>
      )}

      {/* Exam Tip Callout (if post has a dedicated exam_tip distinct from body) */}
      {post.exam_tip && post.exam_tip.trim() !== '' && !isSimilar(post.body, post.exam_tip) && (
        <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-900 text-xs sm:text-sm">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
            <span>🎯 CBSE Marking Scheme Tip / Trap</span>
          </div>
          <p className="leading-relaxed">
            <MathText>{post.exam_tip}</MathText>
          </p>
        </div>
      )}

      {/* Interactive Quiz if present */}
      {post.quiz && (
        <Quiz quiz={post.quiz} seconds={timerSeconds} soundEnabled={soundEnabled} />
      )}

      {/* Source Reference & Hashtags footer */}
      <footer className="meta-footer">
        {post.source_ref && (
          <div className="source-ref">
            <span>📘</span>
            <span>{post.source_ref}</span>
          </div>
        )}

        {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
          <div className="hashtag-row">
            {post.hashtags.map((tag, idx) => (
              <span key={idx} className="hashtag-pill">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </footer>

      {/* Likes, Comments, Share, Save Interaction Bar */}
      <InteractionBar
        post={post}
        onOpenComments={onOpenComments}
        onSaveChange={onSaveChange}
      />
    </article>
  );
}
