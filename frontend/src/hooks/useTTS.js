import { useState, useRef, useCallback, useEffect } from 'react';
import { synthesizeSpeechApi } from '../api.js';

export function useTTS({ defaultVoice = 'teacher', grade = 10, subject = 'Science' } = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const audioRef = useRef(null);
  const urlCacheRef = useRef(new Map());

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentText('');
  }, []);

  const fallbackBrowserTTS = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#$`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try finding an Indian English or Hindi-English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.lang === 'en-IN' || v.name.includes('India')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentText('');
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text, options = {}) => {
      if (!text || !text.trim()) return;
      stop();

      const voice = options.voice || defaultVoice;
      const targetGrade = options.grade || grade;
      const targetSubject = options.subject || subject;
      const openrouterKey = options.openrouter_key || '';

      setCurrentText(text);
      setIsLoading(true);
      setError(null);

      const cacheKey = `${voice}_${text.slice(0, 100)}`;
      let audioUrl = urlCacheRef.current.get(cacheKey);

      try {
        if (!audioUrl) {
          const blob = await synthesizeSpeechApi({
            text,
            voice,
            grade: targetGrade,
            subject: targetSubject,
            openrouter_key: openrouterKey,
          });
          audioUrl = URL.createObjectURL(blob);
          urlCacheRef.current.set(cacheKey, audioUrl);
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentText('');
          audioRef.current = null;
        };

        audio.onerror = (e) => {
          console.warn('Backend audio playback failed, trying browser TTS fallback:', e);
          fallbackBrowserTTS(text);
        };

        await audio.play();
      } catch (err) {
        console.warn('TTS request error, using browser TTS fallback:', err.message);
        fallbackBrowserTTS(text);
      }
    },
    [defaultVoice, grade, subject, stop, fallbackBrowserTTS]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    currentText,
    error,
  };
}
