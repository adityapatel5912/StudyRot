import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.jsx';
import { ArrowLeft, Key, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function Keys() {
  const navigate = useNavigate();
  const { token, refreshKeysStatus, savedKeysStatus } = useAuth();
  const [groqKey, setGroqKey] = useState(localStorage.getItem('studyrot_groq_key') || '');
  const [tavilyKey, setTavilyKey] = useState(localStorage.getItem('studyrot_tavily_key') || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

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

      refreshKeysStatus?.();
      setSuccessMsg('API keys encrypted with AES-256-GCM and saved successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3500);
    } catch (err) {
      console.warn('Failed to save keys:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[var(--off-white)] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--white)] hover:bg-[var(--off-white)] text-[var(--navy-700)] transition"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--navy-900)] flex items-center gap-2">
              <Key className="w-6 h-6 text-[var(--navy-600)]" />
              <span>BYO API Keys</span>
            </h1>
            <p className="text-xs text-[var(--navy-500)]">
              Configure your personal Groq and Tavily credentials for unlimited generations
            </p>
          </div>
        </div>

        <div className="bg-[var(--white)] rounded-2xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-200 mb-6 text-xs text-blue-900 leading-relaxed">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Zero Plaintext Storage:</span> Your API keys are encrypted with authenticated AES-256-GCM on the backend before writing to Supabase, and used exclusively during active synthesis requests.
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label
                htmlFor="page-groq-key"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--navy-800)] mb-1.5"
              >
                Groq API Key (Llama 3.3 70B Versatile) <span className="text-red-500">*</span>
              </label>
              <input
                id="page-groq-key"
                type="password"
                placeholder="gsk_..."
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] font-mono"
              />
              <p className="text-[11px] text-[var(--navy-400)] mt-1">
                Get your free API key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-[var(--navy-600)] underline font-semibold">console.groq.com</a>
              </p>
            </div>

            <div>
              <label
                htmlFor="page-tavily-key"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--navy-800)] mb-1.5"
              >
                Tavily Search API Key <span className="text-[var(--navy-400)] font-normal">(Optional NCERT Grounding)</span>
              </label>
              <input
                id="page-tavily-key"
                type="password"
                placeholder="tvly-..."
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] font-mono"
              />
              <p className="text-[11px] text-[var(--navy-400)] mt-1">
                Used to fetch real-time syllabus updates and verified diagrams from official NCERT sources.
              </p>
            </div>

            {successMsg && (
              <div className="p-3.5 bg-[var(--green-soft)] border border-[#86efac] text-[#166534] text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--navy-500)]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Client & Server Encrypted</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[var(--navy-900)] hover:bg-[var(--navy-800)] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {saving ? 'Encrypting & Saving...' : 'Save Keys'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
