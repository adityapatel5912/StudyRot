/** Manages persistent browser storage for StudyRot feeds, user preferences, and offline state. */

const FEED_STORAGE_KEY = 'studyrot:lastFeed';
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

export function saveLastFeed(feed, metadata = {}) {
  try {
    const payload = {
      timestamp: Date.now(),
      metadata,
      feed,
    };
    localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to persist feed to localStorage:', err);
  }
}

export function getRestorableFeed() {
  try {
    const raw = localStorage.getItem(FEED_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || !data.feed || !data.timestamp) return null;

    const age = Date.now() - data.timestamp;
    if (age > MAX_AGE_MS) {
      return null;
    }

    return {
      feed: data.feed,
      metadata: data.metadata || {},
      timestamp: data.timestamp,
      ageMinutes: Math.round(age / 60000),
    };
  } catch (err) {
    console.warn('Failed to parse restorable feed from localStorage:', err);
    return null;
  }
}

export function clearLastFeed() {
  try {
    localStorage.removeItem(FEED_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear feed from localStorage:', err);
  }
}
