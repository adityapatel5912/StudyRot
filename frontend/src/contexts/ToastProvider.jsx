import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-lg text-xs font-semibold transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-[var(--green-soft)] border-[var(--green)] text-[var(--green-dark)]'
                : toast.type === 'error'
                ? 'bg-[var(--red-soft)] border-[var(--red)] text-red-900'
                : 'bg-white border-[var(--border)] text-[var(--navy-900)]'
            }`}
            role="alert"
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[var(--green-dark)] flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[var(--navy-600)] flex-shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-75 transition ml-2"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
