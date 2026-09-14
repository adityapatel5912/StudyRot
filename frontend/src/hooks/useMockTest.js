import { useState, useEffect, useCallback, useRef } from 'react';

const LOCAL_STORAGE_KEY = 'studyrot:mockTests';

export function useMockTest() {
  const [mockId, setMockId] = useState(null);
  const [paper, setPaper] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [timeLeftSec, setTimeLeftSec] = useState(180 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);

  // Flattened questions for linear navigation
  const flatQuestions = useCallback(() => {
    if (!paper || !paper.sections) return [];
    const list = [];
    paper.sections.forEach((sec) => {
      (sec.questions || []).forEach((q) => {
        list.push({ ...q, sectionId: sec.id, sectionName: sec.name });
      });
    });
    return list;
  }, [paper]);

  // Start new mock test
  const startMockTest = async (subject = 'Science', grade = 10, templateId = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mock/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, template_id: templateId }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setMockId(json.data.mock_id);
        setPaper(json.data.paper);
        setAnswers({});
        setMarkedForReview({});
        setVisitedQuestions({ 0: true });
        setCurrentQuestionIndex(0);
        setTimeLeftSec((json.data.paper.duration_min || 180) * 60);
        setResult(null);
      } else {
        setError(json.error || 'Failed to generate mock test paper');
      }
    } catch (err) {
      setError(err.message || 'Connection error creating mock test');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!paper || result || timeLeftSec <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [paper, result]);

  // Answer updater
  const setAnswer = (qId, ans) => {
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
    setVisitedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  // Toggle mark for review
  const toggleMarkForReview = (qId) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Select question index
  const selectQuestion = (idx) => {
    setCurrentQuestionIndex(idx);
    const qs = flatQuestions();
    if (qs[idx]) {
      setVisitedQuestions((prev) => ({ ...prev, [qs[idx].id]: true }));
    }
  };

  // Auto-save every 30s to backend + localStorage
  useEffect(() => {
    if (!mockId || !paper || result) return;

    const interval = setInterval(() => {
      // 1. LocalStorage auto-save
      try {
        const guestSaved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const existingIdx = guestSaved.findIndex((m) => m.mockId === mockId);
        const item = {
          mockId,
          paper,
          answers,
          markedForReview,
          timeLeftSec,
          savedAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) guestSaved[existingIdx] = item;
        else guestSaved.unshift(item);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(guestSaved.slice(0, 5)));
      } catch {}

      // 2. Server autosave
      fetch(`/api/mock/${mockId}/autosave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          duration_sec: (paper.duration_min || 180) * 60 - timeLeftSec,
        }),
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [mockId, paper, answers, markedForReview, timeLeftSec, result]);

  // Submit test
  const submitTest = async () => {
    if (!mockId || !paper) return;
    setIsSubmitting(true);
    const duration = (paper.duration_min || 180) * 60 - timeLeftSec;

    // Get user's custom groq key if stored in localStorage
    const savedGroqKey = localStorage.getItem('studyrot_groq_api_key') || null;

    try {
      const res = await fetch(`/api/mock/${mockId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedGroqKey ? { 'X-Groq-Key': savedGroqKey } : {}),
        },
        body: JSON.stringify({
          answers,
          duration_sec: duration,
          groq_key: savedGroqKey,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setResult(json.data);
      } else {
        setError(json.error || 'Failed to grade submission');
      }
    } catch (err) {
      setError(err.message || 'Error submitting mock test');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    mockId,
    paper,
    loading,
    error,
    currentQuestionIndex,
    answers,
    markedForReview,
    visitedQuestions,
    timeLeftSec,
    isSubmitting,
    result,
    flatQuestions: flatQuestions(),
    startMockTest,
    setAnswer,
    toggleMarkForReview,
    selectQuestion,
    submitTest,
    setResult,
  };
}
