import { useState, useCallback, useEffect } from 'react';
import { solveTextDoubtApi, solveImageDoubtApi, generate3DConceptApi } from '../api.js';

// Pre-packaged CBSE NCERT demo doubts for instant 1-click try
export const GUEST_SAMPLE_DOUBTS = [
  {
    id: 'sample_mirror',
    title: 'Concave Mirror: Object between C and F',
    subject: 'Science',
    grade: 10,
    question: 'Where is the image formed when an object is placed between the center of curvature (C) and principal focus (F) of a concave mirror? Draw the ray diagram.',
  },
  {
    id: 'sample_projectile',
    title: 'Projectile Motion: Maximum Height',
    subject: 'Science',
    grade: 11,
    question: 'Derive the formula for the maximum height $H = \\frac{u^2 \\sin^2 \\theta}{2g}$ reached by a projectile launched with speed $u$ at angle $\\theta$.',
  },
  {
    id: 'sample_quadratic',
    title: 'Derivation of Quadratic Formula',
    subject: 'Maths',
    grade: 10,
    question: 'How do you derive the quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ by completing the square?',
  },
  {
    id: 'sample_trig',
    title: 'Unit Circle: Why $\\sin^2 \\theta + \\cos^2 \\theta = 1$',
    subject: 'Maths',
    grade: 11,
    question: 'Explain the fundamental Pythagorean trigonometric identity $\\sin^2 \\theta + \\cos^2 \\theta = 1$ using the unit circle and right triangles.',
  },
  {
    id: 'sample_lens',
    title: 'Convex Lens: Real & Inverted Image',
    subject: 'Science',
    grade: 10,
    question: 'A 5 cm tall object is placed 20 cm from a convex lens of focal length 10 cm. Find the image position and nature.',
  },
];

const LOCAL_STORAGE_KEY = 'studyrot_doubt_history_v1';

export function useDoubt({ grade = 10, subject = 'Science' } = {}) {
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToHistory = useCallback((entry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev.filter((item) => item.id !== entry.id)].slice(0, 25);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const askTextDoubt = useCallback(
    async (questionText, options = {}) => {
      if (!questionText || !questionText.trim()) return null;
      setIsLoading(true);
      setError(null);

      const targetGrade = options.grade || grade;
      const targetSubject = options.subject || subject;

      try {
        const res = await solveTextDoubtApi({
          question: questionText,
          grade: targetGrade,
          subject: targetSubject,
          student_context: options.student_context || {},
          openrouter_key: options.openrouter_key || '',
          groq_key: options.groq_key || '',
          nvidia_key: options.nvidia_key || '',
          token: options.token || '',
        });

        const sol = res?.data || res?.solution || res;
        setSolution(sol);

        const historyEntry = {
          id: `doubt_${Date.now()}`,
          timestamp: Date.now(),
          question: questionText,
          subject: targetSubject,
          grade: targetGrade,
          solution: sol,
        };
        saveToHistory(historyEntry);

        return sol;
      } catch (err) {
        console.error('Failed to solve doubt:', err);
        setError(err.message || 'Could not solve doubt. Please check your network.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [grade, subject, saveToHistory]
  );

  const askImageDoubt = useCallback(
    async (imageFile, questionText = '', options = {}) => {
      if (!imageFile) return null;
      setIsLoading(true);
      setError(null);

      const targetGrade = options.grade || grade;
      const targetSubject = options.subject || subject;

      const formData = new FormData();
      formData.append('image', imageFile);
      if (questionText) formData.append('question', questionText);
      formData.append('grade', String(targetGrade));
      formData.append('subject', targetSubject);
      if (options.nvidia_key) formData.append('nvidia_key', options.nvidia_key);
      if (options.groq_key) formData.append('groq_key', options.groq_key);
      if (options.openrouter_key) formData.append('openrouter_key', options.openrouter_key);

      try {
        const res = await solveImageDoubtApi(formData, options.token || '');
        const sol = res?.data || res?.solution || res;
        setSolution(sol);

        const historyEntry = {
          id: `doubt_img_${Date.now()}`,
          timestamp: Date.now(),
          question: questionText || 'Question from image',
          imageUrl: URL.createObjectURL(imageFile),
          subject: targetSubject,
          grade: targetGrade,
          solution: sol,
        };
        saveToHistory(historyEntry);

        return sol;
      } catch (err) {
        console.error('Failed to solve image doubt:', err);
        setError(err.message || 'Could not analyze image. Please try again.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [grade, subject, saveToHistory]
  );

  const request3DSimulation = useCallback(
    async (conceptName, options = {}) => {
      if (!conceptName) return null;
      setIsLoading(true);
      setError(null);

      try {
        const res = await generate3DConceptApi({
          concept: conceptName,
          grade: options.grade || grade,
          subject: options.subject || subject,
          nvidia_key: options.nvidia_key || '',
          token: options.token || '',
        });
        const sim = res?.simulation || res;
        return sim;
      } catch (err) {
        console.warn('3D simulation generation error:', err);
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [grade, subject]
  );

  const clearSolution = useCallback(() => {
    setSolution(null);
    setError(null);
  }, []);

  return {
    solution,
    setSolution,
    isLoading,
    error,
    history,
    askTextDoubt,
    askImageDoubt,
    request3DSimulation,
    clearSolution,
  };
}
