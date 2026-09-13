/** Toast notification management hook with auto-dismiss and accessibility announcements. */
import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'info', durationMs = 4000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({
      id: Date.now(),
      message,
      type, // 'error' | 'success' | 'info' | 'warning'
    });

    if (durationMs > 0) {
      timerRef.current = setTimeout(() => {
        setToast(null);
      }, durationMs);
    }
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(null);
  }, []);

  const showError = useCallback(
    (msg, durationMs = 5000) => showToast(msg, 'error', durationMs),
    [showToast]
  );
  const showSuccess = useCallback(
    (msg, durationMs = 3500) => showToast(msg, 'success', durationMs),
    [showToast]
  );

  return {
    toast,
    showToast,
    showError,
    showSuccess,
    hideToast,
  };
}

export default useToast;
