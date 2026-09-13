import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider.jsx';

export default function KeysModal({ onClose }) {
  const { token, refreshKeysStatus } = useAuth();
  const [groqKey, setGroqKey] = useState(localStorage.getItem('studyrot_groq_key') || '');
  const [tavilyKey, setTavilyKey] = useState(localStorage.getItem('studyrot_tavily_key') || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      localStorage.setItem('studyrot_groq_key', groqKey.trim());
      localStorage.setItem('studyrot_tavily_key', tavilyKey.trim());

      await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'guest'}`,
        },
        body: JSON.stringify({
          groq_key: groqKey.trim(),
          tavily_key: tavilyKey.trim(),
        }),
      });

      refreshKeysStatus();
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Failed to save keys:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--white)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--off-white)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔑</span>
            <h3 className="text-base font-bold text-[var(--navy-900)]">Manage BYO API Keys</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--navy-400)] hover:text-[var(--navy-900)] hover:bg-[var(--navy-200)] transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <p className="text-xs text-[var(--navy-600)] leading-relaxed">
            Keys are encrypted and used only to synthesize NCERT curriculum feeds from Groq and ground them with Tavily.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--navy-800)] mb-1.5">
              Groq API Key (Llama 3.3 70B)
            </label>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--off-white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--navy-800)] mb-1.5">
              Tavily API Key <span className="text-[var(--navy-400)] font-normal">(Optional Grounding)</span>
            </label>
            <input
              type="password"
              placeholder="tvly-..."
              value={tavilyKey}
              onChange={(e) => setTavilyKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--off-white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
            />
          </div>

          {success && (
            <div className="p-3 bg-[var(--green-soft)] text-[#166534] text-xs font-bold rounded-xl flex items-center gap-2">
              <span>✓</span>
              <span>API keys encrypted & saved successfully!</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[var(--navy-600)] hover:bg-[var(--off-white)] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[var(--navy-900)] text-white text-xs font-bold rounded-xl hover:bg-[var(--navy-800)] transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Keys'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
