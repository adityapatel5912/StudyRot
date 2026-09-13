/**
 * StudyRot API client
 * Communicates with backend endpoints:
 * - POST /api/generate (BYO key JSON)
 * - POST /api/demo-generate (Guest rate-limited live generation)
 * - POST /api/upload (multipart)
 * - POST /api/feeds/share
 * - GET  /api/feeds/shared/{code}
 */

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
      const err = new Error(detail);
      err.code = errorJson?.code;
      throw err;
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
  groq_key = '',
  tavily_key = '',
  text,
  vibe = 'Instagram',
  is_topic = false,
  subject = 'Science',
  grade = 10,
  isDemoMode = false,
  token = '',
}) {
  const endpoint = (!groq_key || isDemoMode) ? '/api/demo-generate' : '/api/generate';
  const payload = {
    groq_key,
    tavily_key,
    text,
    topic: text,
    vibe,
    is_topic,
    subject,
    grade: Number(grade),
  };

  const res = await requestWithFallback(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || 'guest'}`,
    },
    body: JSON.stringify(payload),
  });

  const d = res?.data || res;
  return {
    posts: d?.posts || [],
    feed_code: d?.feed_code || '',
    feed_url: d?.feed_url || '',
    grounded: d?.grounded || false,
  };
}

/**
 * Generate feed posts from uploaded file (multipart POST)
 */
export async function generateFromFile({
  groq_key = '',
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

  const d = res?.data || res;
  return {
    posts: d?.posts || [],
    feed_code: d?.feed_code || '',
    feed_url: d?.feed_url || '',
    chars: d?.chars || 0,
  };
}

/**
 * Share a feed explicitly
 */
export async function shareFeedApi(feedData) {
  return await requestWithFallback('/api/feeds/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedData),
  });
}

/**
 * Get a shared feed by short code
 */
export async function getSharedFeedApi(shortCode) {
  return await requestWithFallback(`/api/feeds/shared/${shortCode}`, {
    method: 'GET',
  });
}
