import React, { useState, useEffect, useRef } from 'react';
import useSound from 'use-sound';

/**
 * Web Audio synthesizer fallback helper.
 * Guarantees audio feedback in any browser environment even before MP3 buffers.
 */
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
  } catch (err) {
    // Silent fail if AudioContext is restricted
  }
}

export default function Quiz({ quiz, seconds = 20 }) {
  if (!quiz) return null;

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  // useSound hook setups with specified volumes and interrupt config
  const [playCorrectAudio] = useSound('/sounds/correct.mp3', {
    volume: 0.6,
    soundEnabled: true,
  });

  const [playWrongAudio] = useSound('/sounds/wrong.mp3', {
    volume: 0.5,
    soundEnabled: true,
  });

  const [playTickAudio] = useSound('/sounds/tick.mp3', {
    volume: 0.25,
    interrupt: true,
    soundEnabled: true,
  });

  const [playTimeUpAudio] = useSound('/sounds/timeup.mp3', {
    volume: 0.6,
    soundEnabled: true,
  });

  // Safe sound triggers with audio context synthesis fallback
  const triggerTick = () => {
    try {
      playTickAudio();
    } catch {
      playSynthSound('tick');
    }
  };

  const triggerCorrect = () => {
    try {
      playCorrectAudio();
    } catch {
      playSynthSound('correct');
    }
  };

  const triggerWrong = () => {
    try {
      playWrongAudio();
    } catch {
      playSynthSound('wrong');
    }
  };

  const triggerTimeUp = () => {
    try {
      playTimeUpAudio();
    } catch {
      playSynthSound('timeup');
    }
  };

  // Start button handler: plays first tick and unlocks audio
  const handleStart = () => {
    setStarted(true);
    setTimeLeft(seconds);
    setAnswered(false);
    setPicked(null);
    setTimedOut(false);
    triggerTick();
  };

  // Timer loop
  useEffect(() => {
    if (!started || answered || timedOut) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setAnswered(true);
          triggerTimeUp();
          return 0;
        }
        triggerTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, answered, timedOut]);

  // Option selection handler
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

  return (
    <div className="quiz-box">
      <div className="quiz-header">
        <span className="quiz-badge">⚡ CBSE Board MCQ</span>
        {started && !answered && (
          <div className={`quiz-timer ${timeLeft <= 5 ? 'urgent' : ''}`}>
            ⏱️ <span>{timeLeft}s</span>
          </div>
        )}
        {timedOut && (
          <div className="quiz-timer urgent">
            ⏰ <span>Time's Up!</span>
          </div>
        )}
      </div>

      <div className="quiz-question">{quiz.question}</div>

      {!started ? (
        <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
          <button
            type="button"
            id="start-quiz-btn"
            className="btn-quiz-start"
            onClick={handleStart}
          >
            ▶ Start Timed MCQ ({seconds}s)
          </button>
        </div>
      ) : (
        <div className="quiz-options">
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
                type="button"
                id={`quiz-opt-${idx}`}
                className={optClass}
                disabled={answered}
                onClick={() => handlePick(option)}
              >
                <span>{option}</span>
                {answered && isAnswer && <span>✓ Correct</span>}
                {answered && isPicked && !isAnswer && <span>✕ Wrong</span>}
              </button>
            );
          })}
        </div>
      )}

      {answered && (
        <div className="quiz-explanation">
          <div style={{ fontWeight: 700, marginBottom: '0.2rem', color: 'var(--navy-900)' }}>
            {picked === quiz.answer
              ? '🎯 Correct! Well reasoned.'
              : timedOut
              ? '⏰ Time ran out! Correct answer: ' + quiz.answer
              : '❌ Incorrect. Correct answer: ' + quiz.answer}
          </div>
          <div>{quiz.explanation}</div>
        </div>
      )}
    </div>
  );
}
