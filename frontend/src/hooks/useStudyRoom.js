import { useState, useEffect, useRef, useCallback } from 'react';

export function useStudyRoom(roomCode, nickname) {
  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [mode, setMode] = useState('sync'); // 'sync' or 'free'
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [quizState, setQuizState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!roomCode || !nickname) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/room/ws/${roomCode.toUpperCase()}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      // Send join message
      ws.send(JSON.stringify({ type: 'join', nickname }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const type = msg.type;

        if (type === 'room_state') {
          setPlayers(msg.players || []);
          setHostId(msg.host_id);
          setCurrentPlayerId(msg.player_id);
          setMode(msg.mode || 'sync');
          setCurrentPostIndex(msg.current_post_index || 0);
        } else if (type === 'player_joined') {
          setPlayers((prev) => {
            const exists = prev.some((p) => p.id === msg.player.id);
            return exists ? prev : [...prev, msg.player];
          });
        } else if (type === 'player_left') {
          setPlayers((prev) => prev.filter((p) => p.id !== msg.player_id));
          if (msg.new_host_id) setHostId(msg.new_host_id);
        } else if (type === 'scroll') {
          setCurrentPostIndex(msg.post_index);
        } else if (type === 'mode_change') {
          setMode(msg.mode);
        } else if (type === 'chat') {
          setMessages((prev) => [...prev, msg]);
        } else if (type === 'ai_message') {
          setMessages((prev) => [...prev, msg]);
        } else if (type === 'group_quiz_start') {
          setQuizState({
            question_index: msg.question_index,
            total_questions: msg.total_questions,
            question: msg.question,
            deadline_ms: msg.deadline_ms,
            reveal: false,
          });
        } else if (type === 'group_quiz_reveal') {
          setQuizState((prev) => ({
            ...prev,
            reveal: true,
            correct_idx: msg.correct_idx,
            correct_answer: msg.correct_answer,
            per_player_results: msg.per_player_results,
            combined_accuracy: msg.combined_accuracy,
          }));
        } else if (type === 'group_quiz_finished') {
          setQuizState({
            finished: true,
            mvp: msg.mvp,
            high_score: msg.high_score,
          });
        } else if (type === 'error') {
          setError(msg.message);
        }
      } catch (err) {
        console.error('Error parsing room websocket message:', err);
      }
    };

    ws.onerror = () => {
      setError('Connection to study room failed.');
    };

    ws.onclose = () => {
      setConnected(false);
    };
  }, [roomCode, nickname]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  // Load chat history from REST API on join
  useEffect(() => {
    if (!roomCode) return;
    fetch(`/api/room/${roomCode}/chat`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.data)) {
          setMessages(j.data);
        }
      })
      .catch(() => {});
  }, [roomCode]);

  const sendMessage = (text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const savedGroqKey = localStorage.getItem('studyrot_groq_api_key') || null;
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        text,
        groq_key: savedGroqKey,
      }));
    }
  };

  const sendScroll = (postIndex) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'scroll',
        post_index: postIndex,
      }));
    }
  };

  const changeMode = (newMode) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mode_change',
        mode: newMode,
      }));
    }
  };

  const startGroupQuiz = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_group_quiz' }));
    }
  };

  const answerGroupQuiz = (qIdx, optionIdx) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'group_quiz_answer',
        q_idx: qIdx,
        option_idx: optionIdx,
      }));
    }
  };

  const kickPlayer = (targetId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'kick_player',
        target_id: targetId,
      }));
    }
  };

  return {
    players,
    hostId,
    currentPlayerId,
    mode,
    currentPostIndex,
    messages,
    quizState,
    connected,
    error,
    sendMessage,
    sendScroll,
    changeMode,
    startGroupQuiz,
    answerGroupQuiz,
    kickPlayer,
  };
}
