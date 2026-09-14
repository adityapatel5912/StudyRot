import { useState, useEffect, useCallback } from 'react';

const LOCAL_PLAN_KEY = 'studyrot:plan';

export function usePlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plan/current');
      const json = await res.json();
      if (json.ok && json.data) {
        setPlan(json.data);
        try {
          localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(json.data));
        } catch {}
      } else {
        // Fallback to local cache
        const local = localStorage.getItem(LOCAL_PLAN_KEY);
        if (local) setPlan(JSON.parse(local));
      }
    } catch (err) {
      const local = localStorage.getItem(LOCAL_PLAN_KEY);
      if (local) setPlan(JSON.parse(local));
      else setError('Could not load study pathway plan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const toggleSessionComplete = async (sessionId, completed) => {
    if (!plan) return;

    // Optimistic UI update
    const updatedDays = (plan.days || []).map((d) => {
      const updatedSessions = (d.sessions || []).map((s) => {
        if (s.id === sessionId) return { ...s, completed };
        return s;
      });
      const completedMin = updatedSessions
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + s.minutes, 0);
      return {
        ...d,
        sessions: updatedSessions,
        completed: (completedMin / Math.max(1, d.total_minutes || 45)) >= 0.70,
      };
    });

    const nextPlan = { ...plan, days: updatedDays };
    setPlan(nextPlan);
    try {
      localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(nextPlan));
    } catch {}

    try {
      await fetch(`/api/plan/session/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
    } catch (err) {
      console.warn('Session complete sync failed:', err);
    }
  };

  const regeneratePlan = async (dailyBudgetMin = 45) => {
    setLoading(true);
    try {
      const examDate = localStorage.getItem('studyrot_exam_date') || null;
      const res = await fetch('/api/plan/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_budget_min: dailyBudgetMin, exam_date: examDate }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setPlan(json.data);
        try {
          localStorage.setItem(LOCAL_PLAN_KEY, JSON.stringify(json.data));
        } catch {}
      }
    } catch (err) {
      setError('Failed to regenerate plan.');
    } finally {
      setLoading(false);
    }
  };

  // Compute streak count: consecutive completed days up to today
  const computeStreak = () => {
    if (!plan || !plan.days) return 0;
    return plan.days.filter((d) => d.completed).length;
  };

  return {
    plan,
    loading,
    error,
    toggleSessionComplete,
    regeneratePlan,
    streakCount: computeStreak(),
    refresh: fetchPlan,
  };
}
