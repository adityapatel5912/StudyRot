import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.jsx';

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  const { token } = useAuth();
  const [examDate, setExamDate] = useState(() => {
    try {
      return localStorage.getItem('studyrot:examDate') || '';
    } catch {
      return '';
    }
  });

  const [reviewCount, setReviewCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('studyrot:reviewCount') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [queue, setQueue] = useState([]);
  const [cutoffs, setCutoffs] = useState(null);
  const [weakness, setWeakness] = useState(null);
  const [loading, setLoading] = useState(false);

  // Save exam date
  const saveExamDate = async (dateStr) => {
    setExamDate(dateStr);
    try {
      localStorage.setItem('studyrot:examDate', dateStr);
    } catch {}

    try {
      await fetch('/api/profile/exam-date', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'guest'}`,
        },
        body: JSON.stringify({ exam_date: dateStr }),
      });
      loadReviewData();
    } catch (err) {
      console.warn('Failed to sync exam date to backend:', err);
    }
  };

  const loadReviewData = async () => {
    setLoading(true);
    try {
      const [todayRes, cutoffsRes, weaknessRes] = await Promise.allSettled([
        fetch('/api/review/today', {
          headers: { Authorization: `Bearer ${token || 'guest'}` },
        }).then((r) => r.json()),
        fetch('/api/review/cutoffs', {
          headers: { Authorization: `Bearer ${token || 'guest'}` },
        }).then((r) => r.json()),
        fetch('/api/review/weakness', {
          headers: { Authorization: `Bearer ${token || 'guest'}` },
        }).then((r) => r.json()),
      ]);

      if (todayRes.status === 'fulfilled' && todayRes.value?.ok) {
        setQueue(todayRes.value.data.queue || []);
      }
      if (cutoffsRes.status === 'fulfilled' && cutoffsRes.value?.ok) {
        setCutoffs(cutoffsRes.value.data);
      }
      if (weaknessRes.status === 'fulfilled' && weaknessRes.value?.ok) {
        setWeakness(weaknessRes.value.data);
      }
    } catch (e) {
      console.warn('Review data fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewData();
  }, [examDate, token]);

  const recordRating = async ({ card_id, rating, subject, grade, topic }) => {
    setReviewCount((prev) => {
      const n = prev + 1;
      try {
        localStorage.setItem('studyrot:reviewCount', String(n));
      } catch {}
      return n;
    });

    try {
      await fetch('/api/review/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'guest'}`,
        },
        body: JSON.stringify({ card_id, rating, subject, grade, topic }),
      });
      loadReviewData();
    } catch (err) {
      console.warn('Failed to rate card:', err);
    }
  };

  const recordError = async ({ card_id, question, chosen_option, correct_answer, explanation }) => {
    try {
      await fetch('/api/review/record-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'guest'}`,
        },
        body: JSON.stringify({ card_id, question, chosen_option, correct_answer, explanation }),
      });
      loadReviewData();
    } catch (err) {
      console.warn('Failed to record error:', err);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        examDate,
        reviewCount,
        queue,
        cutoffs,
        weakness,
        loading,
        saveExamDate,
        recordRating,
        recordError,
        reloadReviewData: loadReviewData,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error('useReview must be used within ReviewProvider');
  }
  return ctx;
}
