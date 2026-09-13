/** Master Classroom Battle controller coordinating WebSockets, state transitions, sound effects, and solo practice fallback. */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import useSound from 'use-sound';
import BattleLobby from './BattleLobby.jsx';
import BattleQuestion from './BattleQuestion.jsx';
import BattleReveal from './BattleReveal.jsx';
import BattlePodium from './BattlePodium.jsx';

// Fallback sample questions if feed has none
const DEFAULT_BATTLE_QUESTIONS = [
  {
    question: "What happens during photolysis in photosynthesis?",
    options: [
      "Water is split releasing oxygen",
      "Carbon dioxide is fixed into glucose",
      "Chlorophyll is decomposed",
      "Stomata permanently close"
    ],
    answer: "Water is split releasing oxygen",
    explanation: "Photolysis splits water ($2\\text{H}_2\\text{O} \\to 4\\text{H}^+ + 4e^- + \\text{O}_2$) in the presence of light and chlorophyll."
  },
  {
    question: "What is the focal length of a concave mirror of radius of curvature 20 cm?",
    options: ["-10 cm", "+10 cm", "-20 cm", "+40 cm"],
    answer: "-10 cm",
    explanation: "By convention, $f = R/2 = 20/2 = 10\\text{ cm}$. Concave mirror focal length is negative: $-10\\text{ cm}$."
  },
  {
    question: "Which gland secretes insulin in the human endocrine system?",
    options: ["Pancreas", "Thyroid", "Pituitary", "Adrenal"],
    answer: "Pancreas",
    explanation: "Beta cells in the Islets of Langerhans of the pancreas secrete insulin to regulate blood glucose."
  }
];

export default function BattleContainer({
  feedQuestions = [],
  topicTitle = 'NCERT Chapter Battle',
  onExit,
  soundEnabled = true,
  initialRoomCode = null,
  initialPlayerName = 'Student',
}) {
  // Extract quiz posts from feed
  const questions = (feedQuestions && feedQuestions.length > 0)
    ? feedQuestions.filter(p => p && p.quiz).map(p => p.quiz)
    : DEFAULT_BATTLE_QUESTIONS;

  const validQuestions = questions.length > 0 ? questions : DEFAULT_BATTLE_QUESTIONS;

  const [gameState, setGameState] = useState('lobby'); // 'lobby' | 'question' | 'reveal' | 'podium'
  const [isSolo, setIsSolo] = useState(false);
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [isHost, setIsHost] = useState(!initialRoomCode);
  const [players, setPlayers] = useState([]);
  const [connected, setConnected] = useState(false);

  // Active question state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nextCountdown, setNextCountdown] = useState(5);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Sound effects
  const [playCorrectAudio] = useSound('/sounds/correct.mp3', { volume: 0.6, soundEnabled });
  const [playWrongAudio] = useSound('/sounds/wrong.mp3', { volume: 0.5, soundEnabled });
  const [playTickAudio] = useSound('/sounds/tick.mp3', { volume: 0.2, interrupt: true, soundEnabled });
  const [playTimeUpAudio] = useSound('/sounds/timeup.mp3', { volume: 0.5, soundEnabled });

  // Generate or fetch room PIN
  const createRoom = useCallback(async () => {
    try {
      const res = await fetch('/api/battle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicTitle,
          questions: validQuestions,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoomCode(data.room_code || data.code);
        setIsHost(true);
        connectWebSocket(data.room_code || data.code, playerName);
      } else {
        // Fallback local room code
        const localCode = String(Math.floor(100000 + Math.random() * 900000));
        setRoomCode(localCode);
        setPlayers([{ name: playerName, score: 0, isHost: true }]);
        setConnected(true);
      }
    } catch {
      const localCode = String(Math.floor(100000 + Math.random() * 900000));
      setRoomCode(localCode);
      setPlayers([{ name: playerName, score: 0, isHost: true }]);
      setConnected(true);
    }
  }, [topicTitle, validQuestions, playerName]);

  const connectWebSocket = (code, name) => {
    if (!code) return;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/battle/${code}?name=${encodeURIComponent(name)}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleServerMessage(data);
        } catch (err) {
          console.warn('Failed to parse battle WS message:', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
      };

      ws.onerror = () => {
        setConnected(false);
      };
    } catch {
      setConnected(false);
    }
  };

  const handleServerMessage = (data) => {
    if (data.type === 'room_state') {
      setPlayers(data.players || []);
      if (data.status === 'in_progress' && gameState === 'lobby') {
        startQuestion(data.question_index || 0);
      }
    } else if (data.type === 'start_battle') {
      startQuestion(0);
    } else if (data.type === 'question') {
      setCurrentQIndex(data.index);
      startQuestion(data.index);
    } else if (data.type === 'reveal') {
      revealAnswer();
    } else if (data.type === 'leaderboard') {
      setLeaderboard(data.leaderboard || []);
    }
  };

  useEffect(() => {
    if (!initialRoomCode && !roomCode && !isSolo) {
      createRoom();
    }
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [createRoom, initialRoomCode, roomCode, isSolo]);

  // Solo Practice start
  const handleStartSolo = () => {
    setIsSolo(true);
    const soloPlayers = [
      { name: playerName || 'You', score: 0, isHost: true },
      { name: 'Rohan (Class 10)', score: 0 },
      { name: 'Priya (CBSE Topper)', score: 0 },
    ];
    setPlayers(soloPlayers);
    setLeaderboard(soloPlayers);
    startQuestion(0);
  };

  // Host starts battle
  const handleStartBattle = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'start_battle' }));
    }
    startQuestion(0);
  };

  // Start question timer
  const startQuestion = (qIndex) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCurrentQIndex(qIndex);
    setSelectedAnswer(null);
    setIsCorrect(false);
    setPointsEarned(0);
    setTimeLeft(15);
    setGameState('question');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        if (soundEnabled && prev <= 5) {
          try { playTickAudio(); } catch {}
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Answer submission
  const handleSubmitAnswer = (answer) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(answer);

    const activeQ = validQuestions[currentQIndex];
    const correct = answer === activeQ.answer;
    setIsCorrect(correct);

    let pts = 0;
    if (correct) {
      // 500 base + up to 500 speed bonus
      const speedBonus = Math.round((timeLeft / 15) * 500);
      pts = 500 + speedBonus;
      setPointsEarned(pts);
      setStreak((s) => s + 1);
      if (soundEnabled) try { playCorrectAudio(); } catch {}
    } else {
      setStreak(0);
      if (soundEnabled) try { playWrongAudio(); } catch {}
    }

    // Update scoreboard
    updateScoreboard(pts);

    // Send to WS if open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'submit_answer',
        question_index: currentQIndex,
        answer,
        time_left: timeLeft,
      }));
    }

    // Auto reveal after brief pause
    setTimeout(() => {
      revealAnswer(pts);
    }, 1200);
  };

  const handleTimeExpired = () => {
    if (soundEnabled) try { playTimeUpAudio(); } catch {}
    setIsCorrect(false);
    setPointsEarned(0);
    setStreak(0);
    revealAnswer(0);
  };

  const updateScoreboard = (myPts) => {
    setLeaderboard((prev) => {
      let list = prev.length > 0 ? [...prev] : [...players];
      const myIdx = list.findIndex(p => p.name === (playerName || 'You'));
      if (myIdx >= 0) {
        list[myIdx] = {
          ...list[myIdx],
          score: (list[myIdx].score || 0) + myPts,
          correctCount: (list[myIdx].correctCount || 0) + (myPts > 0 ? 1 : 0),
        };
      } else {
        list.push({
          name: playerName || 'You',
          score: myPts,
          correctCount: myPts > 0 ? 1 : 0,
        });
      }

      // If solo mode, simulate simulated classmate scores
      if (isSolo) {
        list = list.map(p => {
          if (p.name !== (playerName || 'You')) {
            const added = Math.random() > 0.35 ? Math.floor(400 + Math.random() * 450) : 0;
            return {
              ...p,
              score: (p.score || 0) + added,
              correctCount: (p.correctCount || 0) + (added > 0 ? 1 : 0),
            };
          }
          return p;
        });
      }

      return list.sort((a, b) => (b.score || 0) - (a.score || 0));
    });
  };

  const revealAnswer = () => {
    setGameState('reveal');
    setNextCountdown(5);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setNextCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current);
          handleNextQuestion();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const nextIdx = currentQIndex + 1;
    if (nextIdx >= validQuestions.length) {
      setGameState('podium');
    } else {
      startQuestion(nextIdx);
    }
  };

  const handlePlayAgain = () => {
    setLeaderboard([]);
    setCurrentQIndex(0);
    setGameState('lobby');
  };

  const currentQ = validQuestions[currentQIndex] || validQuestions[0];
  const isLastQuestion = currentQIndex >= validQuestions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fc] to-[#eef3fb] py-6 px-4 flex flex-col justify-center">
      {gameState === 'lobby' && (
        <BattleLobby
          roomCode={roomCode}
          isHost={isHost}
          players={players}
          onStartBattle={handleStartBattle}
          onStartSolo={handleStartSolo}
          onLeave={onExit}
          topicTitle={topicTitle}
          questionCount={validQuestions.length}
          connected={connected}
        />
      )}

      {gameState === 'question' && (
        <BattleQuestion
          question={currentQ}
          questionIndex={currentQIndex}
          totalQuestions={validQuestions.length}
          timeLeft={timeLeft}
          totalTime={15}
          selectedAnswer={selectedAnswer}
          onSubmitAnswer={handleSubmitAnswer}
          soundEnabled={soundEnabled}
        />
      )}

      {gameState === 'reveal' && (
        <BattleReveal
          question={currentQ}
          userAnswer={selectedAnswer}
          isCorrect={isCorrect}
          pointsEarned={pointsEarned}
          streak={streak}
          leaderboard={leaderboard}
          nextCountdown={nextCountdown}
          isHost={isHost || isSolo}
          onNextQuestion={handleNextQuestion}
          isLastQuestion={isLastQuestion}
        />
      )}

      {gameState === 'podium' && (
        <BattlePodium
          leaderboard={leaderboard}
          topicTitle={topicTitle}
          totalQuestions={validQuestions.length}
          onPlayAgain={handlePlayAgain}
          onExit={onExit}
        />
      )}
    </div>
  );
}
