import React, { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';
import MathText from './MathText.jsx';
import { Maximize2, Sparkles } from 'lucide-react';
import { useTalk } from '../contexts/TalkProvider.jsx';

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
    // blocked by browser audio policy until user gesture
  }
}

export default function Quiz({
  quiz,
  seconds = 20,
  soundEnabled = true,
  onOpenFullscreen,
  isFullscreen = false,
}) {
  if (!quiz) return null;

  const { openDoubt } = useTalk();
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
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
    triggerTick();
  };

  // Timer countdown
  useEffect(() => {
    if (!started || answered || timedOut) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setAnswered(true);
          triggerTimeUp();
          return 0;
        }
        if (next <= 5) {
          triggerTick();
        }
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
      triggerCorrect();
    } else {
      triggerWrong();
    }
  };

  // Keyboard navigation: 1-4 to pick option, Arrow keys to navigate, Enter to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!started || answered) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < quiz.options.length) {
          e.preventDefault();
          handlePick(quiz.options[idx]);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = (prev + 1) % quiz.options.length;
          optionRefs.current[next]?.focus();
          return next;
        });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = (prev - 1 + quiz.options.length) % quiz.options.length;
          optionRefs.current[next]?.focus();
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, answered, timedOut, quiz.options]);

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / seconds) * 100));
  const isUrgent = timeLeft <= 5 && started && !answered;

  const letterLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="quiz-container-box" id="quiz-container" role="region" aria-label="CBSE Board Quiz">
      {/* Header Bar */}
      <div className="quiz-header-bar">
        <span className="quiz-badge-label">⚡ CBSE BOARD MCQ</span>
        <div className="flex items-center gap-2">
          {started && !answered && (
            <span className={`quiz-timer-monospace ${isUrgent ? 'warning' : ''}`}>
              ⏱ {timeLeft}s
            </span>
          )}
          {timedOut && (
            <span className="quiz-timer-monospace warning">
              ⏰ Time's Up!
            </span>
          )}
          {onOpenFullscreen && !isFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              className="p-1 rounded hover:bg-[#eef3fc] text-[var(--navy-600)] transition"
              title="Expand to Fullscreen"
              aria-label="Expand Quiz to Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3px Progress Bar */}
      {started && !answered && (
        <div className="quiz-progress-track">
          <div
            className={`quiz-progress-fill ${isUrgent ? 'warning' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Question Text */}
      <div className="quiz-question-text">
        <MathText>{quiz.question}</MathText>
      </div>

      {/* Start Button or Options */}
      {!started ? (
        <button
          type="button"
          id="start-quiz-btn"
          className="btn-start-quiz"
          onClick={handleStart}
          aria-label={`Start Timed MCQ quiz with ${seconds} seconds limit`}
        >
          ▶ Start Quiz ({seconds}s)
        </button>
      ) : (
        <div className="quiz-options-column" role="radiogroup" aria-label="Answer options">
          {quiz.options.map((option, idx) => {
            const isAnswer = option === quiz.answer;
            const isPicked = option === picked;

            let optStateClass = '';
            if (answered) {
              if (isAnswer) {
                optStateClass = 'revealed-correct';
              } else if (isPicked && !isAnswer) {
                optStateClass = 'revealed-wrong';
              } else {
                optStateClass = 'revealed-dimmed';
              }
            }

            return (
              <button
                key={idx}
                ref={(el) => (optionRefs.current[idx] = el)}
                type="button"
                className={`quiz-option-button ${optStateClass}`}
                role="radio"
                aria-checked={isPicked}
                aria-label={`Option ${letterLabels[idx]}: ${option}`}
                tabIndex={focusedIndex === idx ? 0 : -1}
                disabled={answered}
                onClick={() => handlePick(option)}
              >
                <div className="flex items-center">
                  <span className="quiz-option-prefix">{letterLabels[idx]}.</span>
                  <span className="text-left leading-snug">
                    <MathText>{option}</MathText>
                  </span>
                </div>
                {answered && isAnswer && (
                  <span className="text-xs font-bold text-[var(--green-dark)] flex-shrink-0 ml-2">
                    ✓ Correct
                  </span>
                )}
                {answered && isPicked && !isAnswer && (
                  <span className="text-xs font-bold text-red-700 flex-shrink-0 ml-2">
                    ✗ Wrong
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Answer Feedback & Explanation */}
      {answered && (
        <div
          className={`quiz-feedback-box ${picked === quiz.answer ? 'correct' : 'wrong'}`}
          role="region"
          aria-label="Quiz results"
        >
          <div className="quiz-feedback-heading">
            {picked === quiz.answer ? (
              '🎯 Correct! Well reasoned.'
            ) : timedOut ? (
              <span>⏰ Time ran out! Correct answer: <MathText>{quiz.answer}</MathText></span>
            ) : (
              <span>❌ Incorrect. Correct answer: <MathText>{quiz.answer}</MathText></span>
            )}
          </div>
          <div className="quiz-feedback-explanation">
            <MathText>{quiz.explanation}</MathText>
          </div>
          <button
            type="button"
            onClick={() =>
              openDoubt({
                question: `Explain this CBSE MCQ with diagrams or 3D simulation: "${quiz.question}". Options were: ${quiz.options?.join(', ')}. The correct answer is: ${quiz.answer}. Explanation: ${quiz.explanation}`,
                autoSolve: true,
              })
            }
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Explain with 3D Simulation & Diagram</span>
          </button>
        </div>
      )}
    </div>
  );
}
