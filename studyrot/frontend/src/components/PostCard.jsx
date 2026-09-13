import React from 'react';
import AnimatedDiagram from './AnimatedDiagram.jsx';
import Quiz from './Quiz.jsx';

const TYPE_CONFIG = {
  key_point: { label: 'Key Point', emoji: '🔑' },
  analogy: { label: 'Analogy', emoji: '🧠' },
  myth_buster: { label: 'Myth Buster', emoji: '🚨' },
  quiz: { label: 'Board MCQ', emoji: '❓' },
  summary: { label: 'Revision Recap', emoji: '📌' },
  formula: { label: 'Formula Card', emoji: '📐' },
  timeline: { label: 'Timeline', emoji: '🕰️' },
};

export default function PostCard({ post, timerSeconds = 20 }) {
  if (!post) return null;

  const subject = post.subject || 'Science';
  const typeMeta = TYPE_CONFIG[post.type] || { label: post.type || 'Insight', emoji: '💡' };

  return (
    <article
      className="card-inner"
      data-subject={subject}
      id={`post-${post.title?.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Top row: Type badge + Class/Subject badge */}
      <div className="badge-row">
        <span className="type-badge">
          <span>{typeMeta.emoji}</span>
          <span>{typeMeta.label}</span>
        </span>
        <span className="grade-subject-tag">
          Class {post.grade || '10'} • {subject}
        </span>
      </div>

      {/* Post Title & Body */}
      <h2 className="post-title">{post.title}</h2>
      <p className="post-body">{post.body}</p>

      {/* Animated Diagram if present */}
      {post.diagram && post.diagram.trim() !== '' && (
        <AnimatedDiagram svg={post.diagram} />
      )}

      {/* Analogy Callout if present */}
      {post.analogy && post.analogy.trim() !== '' && (
        <div className="analogy-callout">
          <div className="analogy-title">🧠 Desi Analogy</div>
          <div>{post.analogy}</div>
        </div>
      )}

      {/* Interactive Quiz if present */}
      {post.quiz && (
        <Quiz quiz={post.quiz} seconds={timerSeconds} />
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
    </article>
  );
}
