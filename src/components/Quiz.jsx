/** Interactive timed CBSE MCQ component with KaTeX math rendering, sound effects, and full accessibility. */
import React, { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';
import MathText from './MathText.jsx';

function playSynthSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(130, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'timeup') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    }
  } catch {
    // AudioContext blocked or restricted
  }
}

export default function Quiz({ quiz, seconds = 20, soundEnabled = true }) {
  if (!quiz) return null;

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const timerRef = useRef(null);
  const optionRefs = useRef([]);

  const [playCorrectAudio] = useSound('/sounds/correct.mp3', { volume: 0.6, soundEnabled });
  const [playWrongAudio] = useSound('/sounds/wrong.mp3', { volume: 0.5, soundEnabled });
  const [playTickAudio] = useSound('/sounds/tick.mp3', { volume: 0.25, interrupt: true, soundEnabled });
  const [playTimeUpAudio] = useSound('/sounds/timeup.mp3', { volume: 0.6, soundEnabled });

  const triggerTick = () => {
    if (!soundEnabled) return;
    try { playTickAudio(); } catch { playSynthSound('tick'); }
  };

  const triggerCorrect = () => {
    if (!soundEnabled) return;
    try { playCorrectAudio(); } catch { playSynthSound('correct'); }
  };

  const triggerWrong = () => {
    if (!soundEnabled) return;
    try { playWrongAudio(); } catch { playSynthSound('wrong'); }
  };

  const triggerTimeUp = () => {
    if (!soundEnabled) return;
    try { playTimeUpAudio(); } catch { playSynthSound('timeup'); }
  };

  const handleStart = () => {
    setStarted(true);
    setTimeLeft(seconds);
    setAnswered(false);
    setPicked(null);
    setTimedOut(false);
    setFocusedIndex(0);
    setAnnouncement(`Quiz started. You have ${seconds} seconds.`);
    triggerTick();
  };

  useEffect(() => {
    if (!started || answered || timedOut) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next === 10 || next === 5 || next === 3 || next === 1) {
          setAnnouncement(`${next} seconds remaining.`);
        }
        if (next <= 0) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setAnswered(true);
          setAnnouncement("Time is up! Quiz finished.");
          triggerTimeUp();
          return 0;
        }
        triggerTick();
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, answered, timedOut, soundEnabled]);

  const handlePick = (option) => {
    if (!started || answered || timedOut) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setAnswered(true);
    setPicked(option);

    const isCorrect = option === quiz.answer;
    if (isCorrect) {
      setAnnouncement(`Correct! ${quiz.explanation}`);
      triggerCorrect();
    } else {
      setAnnouncement(`Incorrect. Correct answer is ${quiz.answer}. ${quiz.explanation}`);
      triggerWrong();
    }
  };

  // Keyboard navigation across options
  const handleKeyDown = (e, index) => {
    if (answered) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (index + 1) % quiz.options.length;
      setFocusedIndex(nextIdx);
      optionRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (index - 1 + quiz.options.length) % quiz.options.length;
      setFocusedIndex(prevIdx);
      optionRefs.current[prevIdx]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePick(quiz.options[index]);
    }
  };

  return (
    <div className="quiz-box" id="quiz-container">
      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <div className="quiz-header">
        <span className="quiz-badge">⚡ CBSE Board MCQ</span>
        {started && !answered && (
          <div
            className={`quiz-timer ${timeLeft <= 5 ? 'urgent' : ''}`}
            aria-label={`Time remaining: ${timeLeft} seconds`}
          >
            ⏱️ <span>{timeLeft}s</span>
          </div>
        )}
        {timedOut && (
          <div className="quiz-timer urgent" aria-label="Time is up">
            ⏰ <span>Time's Up!</span>
          </div>
        )}
      </div>

      <div className="quiz-question" id="quiz-question-text">
        <MathText>{quiz.question}</MathText>
      </div>

      {!started ? (
        <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
          <button
            type="button"
            id="start-quiz-btn"
            className="btn-quiz-start focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:outline-none"
            onClick={handleStart}
            aria-label={`Start Timed MCQ quiz with ${seconds} seconds limit`}
          >
            ▶ Start Timed MCQ ({seconds}s)
          </button>
        </div>
      ) : (
        <div
          className="quiz-options"
          role="radiogroup"
          aria-labelledby="quiz-question-text"
        >
          {quiz.options.map((option, idx) => {
            const isAnswer = option === quiz.answer;
            const isPicked = option === picked;

            let optClass = 'opt';
            if (answered) {
              if (isAnswer) {
                optClass += ' correct';
              } else if (isPicked && !isAnswer) {
                optClass += ' wrong';
              }
            }

            return (
              <button
                key={idx}
                ref={(el) => (optionRefs.current[idx] = el)}
                type="button"
                id={`quiz-opt-${idx}`}
                className={`${optClass} focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:ring-offset-2`}
                role="radio"
                aria-checked={isPicked}
                aria-label={`Option ${idx + 1}: ${option}`}
                tabIndex={focusedIndex === idx ? 0 : -1}
                disabled={answered}
                onClick={() => handlePick(option)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                <span><MathText>{option}</MathText></span>
                {answered && isAnswer && <span className="text-xs font-bold text-emerald-700 ml-2">✓ Correct</span>}
                {answered && isPicked && !isAnswer && <span className="text-xs font-bold text-red-700 ml-2">✕ Wrong</span>}
              </button>
            );
          })}
        </div>
      )}

      {answered && (
        <div className="quiz-explanation" role="region" aria-label="Answer explanation">
          <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: 'var(--navy-900)' }}>
            {picked === quiz.answer ? (
              '🎯 Correct! Well reasoned.'
            ) : timedOut ? (
              <>⏰ Time ran out! Correct answer: <MathText>{quiz.answer}</MathText></>
            ) : (
              <>❌ Incorrect. Correct answer: <MathText>{quiz.answer}</MathText></>
            )}
          </div>
          <div>
            <MathText>{quiz.explanation}</MathText>
          </div>
        </div>
      )}
    </div>
  );
}
