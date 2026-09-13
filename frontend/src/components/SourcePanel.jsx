import React, { useState, useRef } from 'react';
import { useAuth } from './AuthProvider.jsx';

export default function SourcePanel({
  onGenerate,
  isLoading,
  initialConfig = {},
  error,
}) {
  const { user, demoMode, savedKeysStatus } = useAuth();

  const [groqKey, setGroqKey] = useState(
    initialConfig.groq_key || localStorage.getItem('studyrot_groq_key') || ''
  );
  const [tavilyKey, setTavilyKey] = useState(
    initialConfig.tavily_key || localStorage.getItem('studyrot_tavily_key') || ''
  );
  const [subject, setSubject] = useState(initialConfig.subject || 'Science');
  const [grade, setGrade] = useState(initialConfig.grade || 10);
  const [mode, setMode] = useState(initialConfig.mode || 'topic');
  const [topicText, setTopicText] = useState('Light — Reflection and Refraction');
  const [pasteText, setPasteText] = useState('');
  const [file, setFile] = useState(null);
  const [vibe, setVibe] = useState(initialConfig.vibe || 'Instagram');
  const [quizTimer, setQuizTimer] = useState(initialConfig.quizTimer || 20);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const handleGroqChange = (e) => {
    const val = e.target.value;
    setGroqKey(val);
    try {
      localStorage.setItem('studyrot_groq_key', val);
    } catch {}
  };

  const handleTavilyChange = (e) => {
    const val = e.target.value;
    setTavilyKey(val);
    try {
      localStorage.setItem('studyrot_tavily_key', val);
    } catch {}
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let content = '';
    if (mode === 'topic') {
      content = topicText.trim();
    } else if (mode === 'paste') {
      content = pasteText.trim();
    } else if (mode === 'file') {
      if (!file) {
        alert('Please select or drop an NCERT file first.');
        return;
      }
    }

    onGenerate({
      groq_key: demoMode ? '' : groqKey.trim(),
      tavily_key: demoMode ? '' : tavilyKey.trim(),
      subject,
      grade: Number(grade),
      mode,
      text: content,
      file,
      vibe,
      quizTimer: Number(quizTimer),
      is_topic: mode === 'topic',
      isDemoMode: demoMode,
    });
  };

  const loadPreset = (presetSubject, presetGrade, presetTopic) => {
    if (isLoading) return;
    setSubject(presetSubject);
    setGrade(presetGrade);
    setMode('topic');
    setTopicText(presetTopic);

    onGenerate({
      groq_key: demoMode ? '' : groqKey.trim(),
      tavily_key: demoMode ? '' : tavilyKey.trim(),
      subject: presetSubject,
      grade: presetGrade,
      mode: 'topic',
      text: presetTopic,
      file: null,
      vibe,
      quizTimer: Number(quizTimer),
      is_topic: true,
      isDemoMode: demoMode,
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[var(--off-white)]">
      <div className="w-full max-w-2xl bg-[var(--white)] border border-[var(--border)] border-t-[3px] border-t-[var(--navy-600)] rounded-2xl shadow-[var(--shadow)] overflow-hidden">
        {isLoading && (
          <div className="w-full h-1 bg-[var(--off-white)] overflow-hidden">
            <div className="h-full bg-[var(--navy-600)] animate-pulse" style={{ width: '100%' }} />
          </div>
        )}

        <div className="p-5 sm:p-7 md:p-8 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--red)] mr-1.5 flex-shrink-0" />
              <h1 className="text-[22px] font-extrabold text-[var(--navy-900)] tracking-tight">
                StudyRot
              </h1>
            </div>
            <p className="text-[13px] italic text-[var(--navy-400)]">
              Turn NCERT chapters into an addictive, swipeable CBSE feed with animated SVGs & timed MCQs
            </p>
          </div>

          <div>
            <div className="text-[10px] font-bold text-[var(--navy-400)] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>⚡ QUICK DEMO TOPICS · 1-CLICK TEST</span>
              <span className="text-[10px] font-semibold text-[var(--navy-600)] bg-[var(--off-white)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                Instant Demo
              </span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>
              <button
                type="button"
                id="demo-card-science-1"
                onClick={() => loadPreset('Science', 10, 'Light — Reflection and Refraction')}
                className={`h-[112px] p-[14px] rounded-[14px] border text-left flex flex-col justify-between bg-[var(--white)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--navy-600)] ${
                  subject === 'Science' && topicText.includes('Light')
                    ? 'border-[var(--navy-900)] ring-1 ring-[var(--navy-900)] shadow-sm'
                    : 'border-[var(--border)] hover:border-[var(--navy-400)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="bg-[var(--navy-800)] text-white text-[10px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    Science Cl 10
                  </span>
                  <span className="border border-[var(--border)] text-[var(--navy-600)] text-[10px] font-bold uppercase px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    Optics
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[var(--navy-900)] line-clamp-2 leading-tight">
                    Light & Refraction
                  </h3>
                  <p className="text-[13px] text-[var(--navy-400)] truncate mt-0.5">
                    Snell's Law & Ray Diagrams
                  </p>
                </div>
              </button>

              <button
                type="button"
                id="demo-card-science-2"
                onClick={() => loadPreset('Science', 10, "Electricity — Circuits & Ohm's Law")}
                className={`h-[112px] p-[14px] rounded-[14px] border text-left flex flex-col justify-between bg-[var(--white)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--navy-600)] ${
                  subject === 'Science' && topicText.includes('Electricity')
                    ? 'border-[var(--navy-900)] ring-1 ring-[var(--navy-900)] shadow-sm'
                    : 'border-[var(--border)] hover:border-[var(--navy-400)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="bg-[var(--navy-800)] text-white text-[10px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    Science Cl 10
                  </span>
                  <span className="border border-[var(--border)] text-[var(--navy-600)] text-[10px] font-bold uppercase px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    Circuits
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[var(--navy-900)] line-clamp-2 leading-tight">
                    Electricity & Ohm's Law
                  </h3>
                  <p className="text-[13px] text-[var(--navy-400)] truncate mt-0.5">
                    Resistors, Voltage & Power
                  </p>
                </div>
              </button>

              <button
                type="button"
                id="demo-card-maths-1"
                onClick={() => loadPreset('Maths', 12, 'Parabola & Conic Sections')}
                className={`h-[112px] p-[14px] rounded-[14px] border text-left flex flex-col justify-between bg-[var(--white)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--navy-600)] ${
                  subject === 'Maths' && topicText.includes('Parabola')
                    ? 'border-[var(--red)] ring-1 ring-[var(--red)] shadow-sm'
                    : 'border-[var(--border)] hover:border-[var(--navy-400)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="bg-[var(--red)] text-white text-[10px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    Maths Cl 12
                  </span>
                  <span className="border border-[var(--border)] text-[var(--navy-600)] text-[10px] font-bold uppercase px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    Conics
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[var(--navy-900)] line-clamp-2 leading-tight">
                    Parabola & Conic Sections
                  </h3>
                  <p className="text-[13px] text-[var(--navy-400)] truncate mt-0.5">
                    Focus, Directrix & Latus Rectum
                  </p>
                </div>
              </button>

              <button
                type="button"
                id="demo-card-sst-1"
                onClick={() => loadPreset('SST', 10, 'Nationalism in India & Dandi March')}
                className={`h-[112px] p-[14px] rounded-[14px] border text-left flex flex-col justify-between bg-[var(--white)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[var(--navy-600)] ${
                  subject === 'SST' && topicText.includes('Nationalism')
                    ? 'border-[#15803d] ring-1 ring-[#15803d] shadow-sm'
                    : 'border-[var(--border)] hover:border-[var(--navy-400)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="bg-[#15803d] text-white text-[10px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    SST Cl 10
                  </span>
                  <span className="border border-[var(--border)] text-[var(--navy-600)] text-[10px] font-bold uppercase px-[10px] py-[4px] rounded-full whitespace-nowrap">
                    History
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[var(--navy-900)] line-clamp-2 leading-tight">
                    Nationalism in India
                  </h3>
                  <p className="text-[13px] text-[var(--navy-400)] truncate mt-0.5">
                    Dandi March & Non-Cooperation
                  </p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[var(--red-soft)] border border-[var(--red)] text-xs text-[var(--red)] font-medium flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {demoMode ? (
              <div className="p-3 rounded-xl bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--navy-800)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block" />
                  <span>Demo Mode Active (Server-side AI configured)</span>
                </div>
                <span className="text-[10px] text-[var(--navy-400)] font-bold uppercase tracking-wider">
                  No Key Needed
                </span>
              </div>
            ) : user && savedKeysStatus.has_groq ? (
              <div className="p-3 rounded-xl bg-[var(--green-soft)] border border-[#86efac] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#166534]">
                  <span>✓</span>
                  <span>Using your saved Groq API key</span>
                </div>
                <span className="text-[10px] text-[#166534] font-bold uppercase">
                  Encrypted
                </span>
              </div>
            ) : (
              <div className="space-y-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--off-white)]">
                <div>
                  <label
                    htmlFor="groq-key-input"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy-400)] mb-1.5"
                  >
                    1. Groq API Key <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    id="groq-key-input"
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={handleGroqChange}
                    className="w-full h-[44px] px-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                  />
                  <p className="text-[11px] text-[var(--navy-400)] mt-1">
                    Powered by Llama 3.3 70B Versatile.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="tavily-key-input"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy-400)] mb-1.5"
                  >
                    2. Tavily API Key <span className="text-[var(--navy-400)] font-normal text-[10px]">(Optional NCERT Search)</span>
                  </label>
                  <input
                    id="tavily-key-input"
                    type="password"
                    placeholder="tvly-..."
                    value={tavilyKey}
                    onChange={handleTavilyChange}
                    className="w-full h-[44px] px-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="subject-select"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy-400)] mb-1.5"
                >
                  Subject
                </label>
                <select
                  id="subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-[44px] px-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                >
                  <option value="Science">Science</option>
                  <option value="Maths">Maths</option>
                  <option value="SST">Social Science (SST)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="grade-select"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy-400)] mb-1.5"
                >
                  Class
                </label>
                <select
                  id="grade-select"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full h-[44px] px-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                >
                  <option value={8}>Class 8</option>
                  <option value={9}>Class 9</option>
                  <option value={10}>Class 10</option>
                  <option value={11}>Class 11</option>
                  <option value={12}>Class 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy-400)] mb-1.5">
                Input Mode
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  id="mode-topic-tab"
                  onClick={() => setMode('topic')}
                  className={`h-[44px] px-3 text-xs font-bold rounded-[10px] transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'topic'
                      ? 'bg-[var(--navy-800)] text-white shadow-sm'
                      : 'bg-[var(--white)] text-[var(--navy-700)] border border-[var(--border)] hover:bg-[var(--off-white)]'
                  }`}
                >
                  <span>💡</span>
                  <span>Topic</span>
                </button>
                <button
                  type="button"
                  id="mode-paste-tab"
                  onClick={() => setMode('paste')}
                  className={`h-[44px] px-3 text-xs font-bold rounded-[10px] transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'paste'
                      ? 'bg-[var(--navy-800)] text-white shadow-sm'
                      : 'bg-[var(--white)] text-[var(--navy-700)] border border-[var(--border)] hover:bg-[var(--off-white)]'
                  }`}
                >
                  <span>✍️</span>
                  <span>Paste Text</span>
                </button>
                <button
                  type="button"
                  id="mode-file-tab"
                  onClick={() => setMode('file')}
                  className={`h-[44px] px-3 text-xs font-bold rounded-[10px] transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'file'
                      ? 'bg-[var(--navy-800)] text-white shadow-sm'
                      : 'bg-[var(--white)] text-[var(--navy-700)] border border-[var(--border)] hover:bg-[var(--off-white)]'
                  }`}
                >
                  <span>📄</span>
                  <span>File Upload</span>
                </button>
              </div>

              {mode === 'topic' && (
                <input
                  id="topic-input"
                  type="text"
                  value={topicText}
                  onChange={(e) => setTopicText(e.target.value)}
                  placeholder="e.g. Chemical Reactions and Equations"
                  className="w-full h-[44px] px-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                />
              )}

              {mode === 'paste' && (
                <textarea
                  id="paste-textarea"
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste NCERT paragraphs, concepts, or formulas here..."
                  className="w-full p-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                />
              )}

              {mode === 'file' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    isDragOver
                      ? 'border-[var(--navy-600)] bg-[#edf2fb]'
                      : 'border-[var(--border)] bg-[var(--off-white)] hover:bg-[#f1f5fb]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-xs sm:text-sm font-semibold text-[var(--navy-900)]">
                    {file ? file.name : 'Click to select or drag & drop NCERT chapter file'}
                  </div>
                  <div className="text-[11px] text-[var(--navy-400)] mt-1">
                    Supports PDF, DOCX, TXT (up to 10MB)
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="vibe-select"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy-400)] mb-1.5"
                >
                  Vibe Tone
                </label>
                <select
                  id="vibe-select"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="w-full h-[44px] px-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                >
                  <option value="Instagram">Instagram (Punchy & Emojis)</option>
                  <option value="Twitter/X">Twitter/X (Sharp One-Liners)</option>
                  <option value="LinkedIn">LinkedIn (Structured Insight)</option>
                  <option value="ExamPrep">ExamPrep (Dry & Board-Ready)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="timer-input"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[var(--navy-400)] mb-1.5"
                >
                  Quiz Timer (s)
                </label>
                <input
                  id="timer-input"
                  type="number"
                  min={5}
                  max={60}
                  value={quizTimer}
                  onChange={(e) => setQuizTimer(Math.max(5, Math.min(60, Number(e.target.value) || 20)))}
                  className="w-full h-[44px] px-[14px] text-sm rounded-[10px] border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="generate-feed-btn"
                disabled={isLoading}
                className="w-full h-[50px] bg-[var(--navy-900)] text-white font-bold rounded-xl shadow-md hover:bg-[var(--navy-800)] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Rotting your notes…</span>
                  </>
                ) : (
                  <span>🚀 Generate Feed (14–18 Posts)</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
