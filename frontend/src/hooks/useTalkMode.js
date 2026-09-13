import { useState, useRef, useCallback, useEffect } from 'react';
import { getWebSocketUrl } from '../api.js';

export function useTalkMode({
  voice = 'teacher',
  grade = 10,
  subject = 'Science',
  onTranscript,
  onAiResponse,
} = {}) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'connecting' | 'connected' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [userTranscript, setUserTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const wsRef = useRef(null);
  const audioQueueRef = useRef([]);
  const currentAudioRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Play queued audio chunks seamlessly
  const playNextInQueue = useCallback(() => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      if (audioQueueRef.current.length === 0 && !isPlayingRef.current) {
        setStatus((s) => (s === 'speaking' ? 'connected' : s));
      }
      return;
    }

    const nextBase64 = audioQueueRef.current.shift();
    if (!nextBase64) return;

    try {
      const binaryString = window.atob(nextBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      isPlayingRef.current = true;
      setStatus('speaking');

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        playNextInQueue();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        playNextInQueue();
      };

      audio.play().catch(() => {
        isPlayingRef.current = false;
        playNextInQueue();
      });
    } catch (err) {
      console.warn('Failed to decode audio chunk:', err);
      isPlayingRef.current = false;
      playNextInQueue();
    }
  }, []);

  const stopAudio = useCallback(() => {
    audioQueueRef.current = [];
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');
    setErrorMessage('');
    const wsUrl = getWebSocketUrl('/ws/talk');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        // Send initial setup config
        ws.send(
          JSON.stringify({
            type: 'config',
            voice,
            grade: Number(grade),
            subject,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'transcript':
              setUserTranscript(data.text || '');
              if (data.is_final && onTranscript) {
                onTranscript(data.text);
              }
              break;

            case 'ai_status':
              if (data.status === 'thinking') {
                setStatus('thinking');
              }
              break;

            case 'ai_text_chunk':
              setAiText((prev) => prev + (data.chunk || ''));
              break;

            case 'ai_full_text':
              setAiText(data.text || '');
              if (onAiResponse) onAiResponse(data.text);
              break;

            case 'audio_chunk':
              if (data.data) {
                audioQueueRef.current.push(data.data);
                playNextInQueue();
              }
              break;

            case 'error':
              setErrorMessage(data.message || 'Voice tutor error');
              setStatus('error');
              break;

            default:
              break;
          }
        } catch (e) {
          console.warn('Failed to parse websocket message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error in Talk Mode:', err);
        setErrorMessage('Connection error. Retrying or using fallback.');
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus('idle');
      };
    } catch (e) {
      console.warn('WebSocket init exception:', e);
      setStatus('error');
      setErrorMessage(e.message);
    }
  }, [voice, grade, subject, onTranscript, onAiResponse, playNextInQueue]);

  const disconnect = useCallback(() => {
    stopAudio();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('idle');
  }, [stopAudio]);

  const sendAudioChunk = useCallback((base64Audio) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'audio_chunk',
          data: base64Audio,
        })
      );
    }
  }, []);

  const sendTextMessage = useCallback((text) => {
    if (!text || !text.trim()) return;
    setUserTranscript(text);
    setAiText('');
    stopAudio();
    setStatus('thinking');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text_input',
          text,
        })
      );
    }
  }, [stopAudio]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    userTranscript,
    aiText,
    errorMessage,
    connect,
    disconnect,
    sendAudioChunk,
    sendTextMessage,
    stopAudio,
  };
}
