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

/**
 * Transcribe recorded audio via AssemblyAI Universal-3.5 Pro
 */
export async function transcribeAudioApi(audioBlob, { language = 'en', grade = 10, subject = 'Science', prompt = '' } = {}) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'speech.webm');
  if (language) formData.append('language', language);
  if (grade) formData.append('grade', String(grade));
  if (subject) formData.append('subject', subject);
  if (prompt) formData.append('prompt', prompt);

  const candidates = getBackendCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    const fullUrl = `${baseUrl}/api/stt/sync`;
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        return await response.json();
      }
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.detail || `STT failed with status ${response.status}`);
    } catch (err) {
      lastError = err;
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Failed to transcribe audio.');
}

/**
 * Synthesize speech via Fish Audio S2.1 Pro / OpenRouter
 * Returns audio Blob
 */
export async function synthesizeSpeechApi({
  text,
  voice = 'teacher',
  grade = 10,
  subject = 'Science',
  openrouter_key = '',
}) {
  const candidates = getBackendCandidates();
  let lastError = null;

  const payload = {
    text,
    voice,
    grade: Number(grade),
    subject,
    openrouter_key: openrouter_key || undefined,
  };

  for (const baseUrl of candidates) {
    const fullUrl = `${baseUrl}/api/tts`;
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const blob = await response.blob();
        return blob;
      }
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.detail || `TTS failed with status ${response.status}`);
    } catch (err) {
      lastError = err;
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Failed to synthesize speech.');
}

/**
 * Fetch available TTS voices
 */
export async function getTTSVoicesApi() {
  return await requestWithFallback('/api/tts/voices', { method: 'GET' });
}

/**
 * Solve text doubt with multi-modal response (steps, LaTeX, diagrams, 3D sim, practice)
 */
export async function solveTextDoubtApi({
  question,
  grade = 10,
  subject = 'Science',
  student_context = {},
  openrouter_key = '',
  groq_key = '',
  nvidia_key = '',
  token = '',
}) {
  return await requestWithFallback('/api/doubt/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || 'guest'}`,
    },
    body: JSON.stringify({
      question,
      grade: Number(grade),
      subject,
      student_context,
      openrouter_key: openrouter_key || undefined,
      groq_key: groq_key || undefined,
      nvidia_key: nvidia_key || undefined,
    }),
  });
}

/**
 * Solve doubt with uploaded photo/diagram
 */
export async function solveImageDoubtApi(formData, token = '') {
  const candidates = getBackendCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    const fullUrl = `${baseUrl}/api/doubt/with-image`;
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || 'guest'}`,
        },
        body: formData,
      });
      if (response.ok) {
        return await response.json();
      }
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.detail || `Image doubt failed with status ${response.status}`);
    } catch (err) {
      lastError = err;
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
    }
  }
  throw lastError || new Error('Failed to solve image doubt.');
}

/**
 * Generate 3D simulation or model spec for a concept
 */
export async function generate3DConceptApi({ concept, grade = 10, subject = 'Science', nvidia_key = '', token = '' }) {
  return await requestWithFallback('/api/doubt/3d', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || 'guest'}`,
    },
    body: JSON.stringify({
      concept,
      grade: Number(grade),
      subject,
      nvidia_key: nvidia_key || undefined,
    }),
  });
}

/**
 * Get doubt history for user
 */
export async function getDoubtHistoryApi(token = '') {
  return await requestWithFallback('/api/doubt/history', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token || 'guest'}`,
    },
  });
}

/**
 * Construct WebSocket URL for Talk Mode
 */
export function getWebSocketUrl(path = '/ws/talk') {
  const customUrl = (typeof window !== 'undefined' && window.__STUDYROT_API_URL__) || import.meta.env.VITE_API_URL || '';
  if (customUrl) {
    const wsBase = customUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
    return `${wsBase.replace(/\/$/, '')}${path}`;
  }
  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}${path}`;
  }
  return `ws://localhost:8000${path}`;
}
