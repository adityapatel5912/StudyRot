/**
 * StudyRot API client
 * Communicates with backend endpoints:
 * - POST /api/generate (BYO key JSON)
 * - POST /api/demo-generate (Demo Mode rate-limited)
 * - POST /api/upload (multipart)
 */

import { SAMPLE_FEEDS } from './sampleData.js';

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8000';

function getBackendCandidates() {
  const customUrl = (typeof window !== 'undefined' && window.__STUDYROT_API_URL__) || import.meta.env.VITE_API_URL || '';
  if (customUrl) return [customUrl.replace(/\/$/, ''), ''];
  
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return ['', DEFAULT_LOCAL_BACKEND];
    }
    return ['', DEFAULT_LOCAL_BACKEND];
  }
  return [DEFAULT_LOCAL_BACKEND];
}

async function requestWithFallback(path, options) {
  const candidates = getBackendCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    const fullUrl = `${baseUrl}${path}`;
    try {
      const response = await fetch(fullUrl, options);
      if (response.ok) {
        return await response.json();
      }
      const errorJson = await response.json().catch(() => null);
      const detail = errorJson?.detail || errorJson?.error || `Server returned ${response.status}: ${response.statusText}`;
      throw new Error(detail);
    } catch (err) {
      lastError = err;
      console.warn(`Attempt to fetch ${fullUrl} failed:`, err.message);
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to connect to backend.');
}

/**
 * Generate feed posts from text/topic
 */
export async function generateFromText({
  groq_key,
  tavily_key = '',
  text,
  vibe = 'Instagram',
  is_topic = false,
  subject = 'Science',
  grade = 10,
  isDemoMode = false,
  token = '',
}) {
  if (isDemoMode || !groq_key) {
    try {
      const demoRes = await requestWithFallback('/api/demo-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'guest'}`,
        },
        body: JSON.stringify({
          text,
          vibe,
          is_topic,
          subject,
          grade: Number(grade),
        }),
      });
      const posts = demoRes?.data?.posts || demoRes?.posts;
      if (Array.isArray(posts) && posts.length > 0) {
        return { posts };
      }
    } catch (demoErr) {
      console.warn('Demo generation API fallback:', demoErr.message);
      const lower = (text || '').toLowerCase();
      if (lower.includes('electric') || lower.includes('circuit') || lower.includes('ohm')) {
        return { posts: SAMPLE_FEEDS.electricity_10?.posts || SAMPLE_FEEDS.science_10.posts };
      }
      if (lower.includes('light') || lower.includes('refraction') || subject === 'Science') {
        return { posts: SAMPLE_FEEDS.science_10.posts };
      }
      if (lower.includes('parabola') || lower.includes('conic') || subject === 'Maths') {
        return { posts: SAMPLE_FEEDS.maths_12.posts };
      }
      if (lower.includes('national') || lower.includes('history') || subject === 'SST') {
        return { posts: SAMPLE_FEEDS.sst_10.posts };
      }
      return { posts: SAMPLE_FEEDS.science_10.posts };
    }
  }

  const res = await requestWithFallback('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || 'guest'}`,
    },
    body: JSON.stringify({
      groq_key,
      tavily_key,
      text,
      vibe,
      is_topic,
      subject,
      grade: Number(grade),
    }),
  });
  return { posts: res?.data?.posts || res?.posts || [] };
}

/**
 * Generate feed posts from uploaded file (multipart POST)
 */
export async function generateFromFile({
  groq_key,
  tavily_key = '',
  vibe = 'Instagram',
  subject = 'Science',
  grade = 10,
  file,
  token = '',
}) {
  const formData = new FormData();
  formData.append('groq_key', groq_key || '');
  if (tavily_key) {
    formData.append('tavily_key', tavily_key);
  }
  formData.append('vibe', vibe);
  formData.append('subject', subject);
  formData.append('grade', String(grade));
  formData.append('file', file);

  const res = await requestWithFallback('/api/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token || 'guest'}`,
    },
    body: formData,
  });
  return { posts: res?.data?.posts || res?.posts || [] };
}
