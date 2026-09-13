import { useState, useEffect, useRef } from 'react';
import { useReview } from '../contexts/ReviewProvider.jsx';

export function useSoloBattle({
  soundEnabled = true,
  isSandbox = false,
  onBattleFinish,
}) {
  const { recordError, recordRating } = useReview();

  const [state, setState] = useState('config'); // 'config' | 'lobby' | 'countdown' | 'question' | 'reveal' | 'podium'
  const [difficulty, setDifficulty] = useState('medium');
  const [battleId, setBattleId] = useState('');
  const [bots, setBots] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const [timerSeconds, setTimerSeconds] = useState(15);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [roundResult, setRoundResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [commentary, setCommentary] = useState('');
  const [finalSummary, setFinalSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);
  const qStartTimeRef = useRef(Date.now());

  // Sound players
  const playSound = (soundName) => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}
  };

  const startBattle = async (chosenDifficulty = 'medium', customQuestions = null) => {
    setLoading(true);
    setDifficulty(chosenDifficulty);
    try {
      const res = await fetch('/api/battle/solo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: chosenDifficulty,
          questions: customQuestions,
        }),
      });
      const json = await res.json();
      if (json?.ok && json?.data) {
        const d = json.data;
        setBattleId(d.battle_id);
        setBots(d.bots || []);
        setQuestions(d.questions || []);
        setCurrentQIndex(0);

        // Enter 2-second lobby
        setState('lobby');
        playSound('tick');
        setTimeout(() => {
          setState('countdown');
          setTimeout(() => {
            beginQuestion(0, d.questions);
          }, 3000); // 3-2-1 countdown
        }, 2000);
      } else {
        throw new Error('Failed to create battle session');
      }
    } catch (e) {
      console.warn('Solo battle create failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const beginQuestion = (qIdx, qList = questions) => {
    setCurrentQIndex(qIdx);
    setSelectedOption(null);
    setHasSubmitted(false);
    setRoundResult(null);
    setTimerSeconds(15);
    setState('question');
    qStartTimeRef.current = Date.now();

    // Start 15s timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout(qIdx);
          return 0;
        }
        if (prev <= 6) {
          playSound('tick');
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = (qIdx) => {
    if (!hasSubmitted) {
      submitAnswer(null, 15000, qIdx);
    }
  };

  const submitAnswer = async (optionIdx, elapsedMs = null, qIdx = currentQIndex) => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(optionIdx);
    const timeMs = elapsedMs !== null ? elapsedMs : Math.min(15000, Date.now() - qStartTimeRef.current);

    try {
      const res = await fetch('/api/battle/solo/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battle_id: battleId,
          question_idx: qIdx,
          option_idx: optionIdx,
          time_ms: timeMs,
        }),
      });
      const json = await res.json();
      if (json?.ok && json?.data) {
        const result = json.data;
        setRoundResult(result);
        setLeaderboard(result.leaderboard || []);
        setCommentary(result.commentary || '');
        setState('reveal');

        if (result.user?.is_correct) {
          playSound('correct');
        } else {
          playSound('wrong');
          // Feed wrong answer to FSRS error detector & review queue (if not sandbox)
          if (!isSandbox) {
            const currentQ = questions[qIdx] || {};
            recordError({
              card_id: `${battleId}-q${qIdx}`,
              question: currentQ.question || '',
              chosen_option: result.user?.user_pick || 'None',
              correct_answer: result.correct_answer || '',
              explanation: result.explanation || '',
            });
            recordRating({
              card_id: `${battleId}-q${qIdx}`,
              rating: optionIdx === null ? 1 : 2, // 1 for timeout (forgot), 2 for wrong (hard)
              topic: 'Solo Battle Review',
            });
          }
        }

        // Advance to next question or podium after 4 seconds
        setTimeout(() => {
          if (result.is_last_question) {
            finishBattle();
          } else {
            beginQuestion(qIdx + 1);
          }
        }, 4000);
      }
    } catch (err) {
      console.warn('Solo battle submit error:', err);
    }
  };

  const finishBattle = async () => {
    try {
      const res = await fetch(`/api/battle/solo/${battleId}`);
      const json = await res.json();
      if (json?.ok && json?.data) {
        setFinalSummary(json.data);
        setState('podium');
        playSound('win');
        if (onBattleFinish) onBattleFinish(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch battle summary:', e);
      setState('podium');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    state,
    setState,
    difficulty,
    battleId,
    bots,
    questions,
    currentQIndex,
    currentQuestion: questions[currentQIndex],
    timerSeconds,
    selectedOption,
    hasSubmitted,
    roundResult,
    leaderboard,
    commentary,
    finalSummary,
    loading,
    startBattle,
    submitAnswer,
  };
}
