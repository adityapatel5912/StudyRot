/**
 * StudyRot API client
 * Communicates with backend endpoints:
 * - POST /api/generate (JSON)
 * - POST /api/upload (multipart)
 */

import { SAMPLE_FEEDS } from './sampleData.js';

// Determine backend base URL:
// In local dev with separate FastAPI backend, points to http://localhost:8000.
// In container preview or production, points to current origin / proxy.
const DEFAULT_LOCAL_BACKEND = 'http://localhost:8000';

function getBackendCandidates() {
  const customUrl = (typeof window !== 'undefined' && window.__STUDYROT_API_URL__) || '';
  if (customUrl) return [customUrl];
  
  if (typeof window !== 'undefined') {
    // If running in browser on localhost:5173, try localhost:8000 first, then relative ''
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return [DEFAULT_LOCAL_BACKEND, ''];
    }
    // If running in cloud preview or production, prefer relative origin first, then localhost
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
      // If server returned a 4xx/5xx error message, parse it
      const errorJson = await response.json().catch(() => null);
      const detail = errorJson?.detail || `Server returned ${response.status}: ${response.statusText}`;
      throw new Error(detail);
    } catch (err) {
      lastError = err;
      console.warn(`Attempt to fetch ${fullUrl} failed:`, err.message);
      // If it's a validation error from server (400, 422, etc.), don't failover blindly to another port
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }

  // If both failed and user didn't provide a working key, check if we have a sample fallback
  throw lastError || new Error('Failed to connect to backend.');
}

/**
 * Generate feed posts from text/topic
 * @param {Object} params
 * @param {string} params.groq_key
 * @param {string} [params.tavily_key]
 * @param {string} params.text
 * @param {string} params.vibe
 * @param {boolean} params.is_topic
 * @param {string} params.subject
 * @param {number} params.grade
 * @returns {Promise<{posts: Array}>}
 */
export async function generateFromText({
  groq_key,
  tavily_key = '',
  text,
  vibe = 'Instagram',
  is_topic = false,
  subject = 'Science',
  grade = 10,
}) {
  // If user selected demo sample or no key provided and text matches demo topic, provide immediate preview
  if ((!groq_key || groq_key === 'DEMO') && text) {
    const lower = text.toLowerCase();
    if (lower.includes('light') || lower.includes('refraction')) {
      return { posts: SAMPLE_FEEDS.science_10.posts };
    }
    if (lower.includes('parabola') || lower.includes('conic')) {
      return { posts: SAMPLE_FEEDS.maths_12.posts };
    }
    if (lower.includes('national') || lower.includes('gandhi') || lower.includes('movement')) {
      return { posts: SAMPLE_FEEDS.sst_10.posts };
    }
  }

  return await requestWithFallback('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
}

/**
 * Generate feed posts from uploaded file (multipart POST)
 * @param {Object} params
 * @param {string} params.groq_key
 * @param {string} [params.tavily_key]
 * @param {string} params.vibe
 * @param {string} params.subject
 * @param {number} params.grade
 * @param {File} params.file
 * @returns {Promise<{posts: Array, chars?: number}>}
 */
export async function generateFromFile({
  groq_key,
  tavily_key = '',
  vibe = 'Instagram',
  subject = 'Science',
  grade = 10,
  file,
}) {
  const formData = new FormData();
  formData.append('groq_key', groq_key);
  if (tavily_key) {
    formData.append('tavily_key', tavily_key);
  }
  formData.append('vibe', vibe);
  formData.append('subject', subject);
  formData.append('grade', String(grade));
  formData.append('file', file);

  return await requestWithFallback('/api/upload', {
    method: 'POST',
    body: formData,
  });
}
