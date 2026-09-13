import React, { useState, useRef } from 'react';

export default function SourcePanel({
  onGenerate,
  isLoading,
  initialConfig = {},
  error,
}) {
  const [groqKey, setGroqKey] = useState(
    initialConfig.groq_key || localStorage.getItem('studyrot_groq_key') || ''
  );
  const [tavilyKey, setTavilyKey] = useState(
    initialConfig.tavily_key || localStorage.getItem('studyrot_tavily_key') || ''
  );
  const [subject, setSubject] = useState(initialConfig.subject || 'Science');
  const [grade, setGrade] = useState(initialConfig.grade || 10);
  const [mode, setMode] = useState(initialConfig.mode || 'topic'); // 'file' | 'paste' | 'topic'
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
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
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
        alert('Please select or drop a PDF, DOCX, TXT, or MD file first.');
        return;
      }
    }

    onGenerate({
      groq_key: groqKey.trim(),
      tavily_key: tavilyKey.trim(),
      subject,
      grade: Number(grade),
      mode,
      text: content,
      file,
      vibe,
      quizTimer: Number(quizTimer),
      is_topic: mode === 'topic',
    });
  };

  // Quick preset loader helper
  const loadPreset = (presetSubject, presetGrade, presetTopic) => {
    setSubject(presetSubject);
    setGrade(presetGrade);
    setMode('topic');
    setTopicText(presetTopic);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 py-8 sm:py-12 bg-[var(--off-white)]">
      <div className="w-full max-w-3xl bg-[var(--white)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-6 sm:p-8 md:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--navy-200)] text-[var(--navy-800)] text-xs font-bold uppercase tracking-wider mb-3">
            <span>⚡ CBSE Class 8–12 NCERT Feed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy-900)] tracking-tight">
            StudyRot
          </h1>
          <p className="text-sm sm:text-base text-[var(--navy-600)] mt-2 max-w-lg mx-auto leading-relaxed">
            Turn NCERT chapters into a scrollable, TikTok-style study feed with animated SVGs & timed board MCQs.
          </p>
        </div>

        {/* Quick Demo Presets (5 Curriculum Presets with Spacious Responsive Grid) */}
        <div className="mb-8 p-4 sm:p-5 bg-[var(--off-white)] rounded-2xl border border-[var(--border)]">
          <div className="text-xs sm:text-sm font-bold text-[var(--navy-800)] uppercase tracking-wide mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <span>✨ Quick Demo Topics (1-Click Test)</span>
            <span className="text-[11px] font-semibold text-[var(--navy-400)] bg-[var(--white)] px-2.5 py-1 rounded-full border border-[var(--border)]">
              5 Pre-calibrated NCERT Feeds
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {/* Preset 1: Science Cl 10 - Light */}
            <button
              type="button"
              id="preset-science-btn"
              onClick={() => loadPreset('Science', 10, 'Light — Reflection and Refraction')}
              className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all duration-150 flex flex-col justify-between min-h-[82px] ${
                subject === 'Science' && topicText.includes('Light')
                  ? 'border-[var(--navy-600)] bg-[var(--white)] shadow-md text-[var(--navy-900)] ring-1 ring-[var(--navy-600)]'
                  : 'border-[var(--border)] bg-[var(--white)] hover:border-[var(--navy-400)] hover:shadow-sm text-[var(--navy-700)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm text-[var(--navy-700)] flex items-center gap-1.5">
                  🔬 Science Cl 10
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--navy-400)] bg-[var(--navy-200)] px-1.5 py-0.5 rounded">Optics</span>
              </div>
              <div className="text-xs text-[var(--navy-600)] font-medium leading-tight">Light & Refraction</div>
            </button>

            {/* Preset 2: Science Cl 10 - Electricity (NEW) */}
            <button
              type="button"
              id="preset-electricity-btn"
              onClick={() => loadPreset('Science', 10, "Electricity — Circuits & Ohm's Law")}
              className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all duration-150 flex flex-col justify-between min-h-[82px] ${
                subject === 'Science' && topicText.includes('Electricity')
                  ? 'border-[var(--navy-600)] bg-[var(--white)] shadow-md text-[var(--navy-900)] ring-1 ring-[var(--navy-600)]'
                  : 'border-[var(--border)] bg-[var(--white)] hover:border-[var(--navy-400)] hover:shadow-sm text-[var(--navy-700)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm text-[var(--navy-700)] flex items-center gap-1.5">
                  ⚡ Science Cl 10
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Circuits</span>
              </div>
              <div className="text-xs text-[var(--navy-600)] font-medium leading-tight">Ohm's Law & Power</div>
            </button>

            {/* Preset 3: Maths Cl 12 - Parabola */}
            <button
              type="button"
              id="preset-maths-btn"
              onClick={() => loadPreset('Maths', 12, 'Parabola & Conic Sections')}
              className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all duration-150 flex flex-col justify-between min-h-[82px] ${
                subject === 'Maths' && topicText.includes('Parabola')
                  ? 'border-[var(--red)] bg-[var(--white)] shadow-md text-[var(--navy-900)] ring-1 ring-[var(--red)]'
                  : 'border-[var(--border)] bg-[var(--white)] hover:border-[var(--navy-400)] hover:shadow-sm text-[var(--navy-700)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm text-[var(--red)] flex items-center gap-1.5">
                  📐 Maths Cl 12
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--red)] bg-[var(--red-soft)] px-1.5 py-0.5 rounded">Conics</span>
              </div>
              <div className="text-xs text-[var(--navy-600)] font-medium leading-tight">Parabola & Directrix</div>
            </button>

            {/* Preset 4: Maths Cl 10 - Trigonometry (NEW) */}
            <button
              type="button"
              id="preset-trig-btn"
              onClick={() => loadPreset('Maths', 10, 'Trigonometry & Heights and Distances')}
              className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all duration-150 flex flex-col justify-between min-h-[82px] ${
                subject === 'Maths' && topicText.includes('Trigonometry')
                  ? 'border-[var(--red)] bg-[var(--white)] shadow-md text-[var(--navy-900)] ring-1 ring-[var(--red)]'
                  : 'border-[var(--border)] bg-[var(--white)] hover:border-[var(--navy-400)] hover:shadow-sm text-[var(--navy-700)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm text-[var(--red)] flex items-center gap-1.5">
                  📐 Maths Cl 10
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--red)] bg-[var(--red-soft)] px-1.5 py-0.5 rounded">Heights</span>
              </div>
              <div className="text-xs text-[var(--navy-600)] font-medium leading-tight">Sin, Cos & Elevation</div>
            </button>

            {/* Preset 5: SST Cl 10 - Nationalism in India */}
            <button
              type="button"
              id="preset-sst-btn"
              onClick={() => loadPreset('SST', 10, 'Indian National Movement')}
              className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all duration-150 flex flex-col justify-between min-h-[82px] sm:col-span-2 lg:col-span-1 ${
                subject === 'SST' && topicText.includes('National')
                  ? 'border-[var(--green)] bg-[var(--white)] shadow-md text-[var(--navy-900)] ring-1 ring-[var(--green)]'
                  : 'border-[var(--border)] bg-[var(--white)] hover:border-[var(--navy-400)] hover:shadow-sm text-[var(--navy-700)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-xs sm:text-sm text-[var(--green)] flex items-center gap-1.5">
                  🕰️ SST Cl 10
                </span>
                <span className="text-[10px] uppercase font-bold text-[#166534] bg-[var(--green-soft)] px-1.5 py-0.5 rounded">History</span>
              </div>
              <div className="text-xs text-[var(--navy-600)] font-medium leading-tight">Dandi March & Satyagraha</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--red-soft)] border border-[var(--red)] text-sm text-[var(--red)] font-medium flex items-start gap-2">
            <span className="text-lg leading-none">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1: Groq API Key */}
          <div>
            <label
              htmlFor="groq-key-input"
              className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--navy-800)] mb-2"
            >
              1. Groq API Key <span className="text-[var(--red)]">*</span>
            </label>
            <input
              id="groq-key-input"
              type="password"
              placeholder="gsk_... (or leave blank to test with instant 1-click demos)"
              value={groqKey}
              onChange={handleGroqChange}
              className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
            />
            <p className="text-xs text-[var(--navy-400)] mt-1.5">
              Powered by Groq Llama-3.3-70b-versatile (BYO key for live AI generation).
            </p>
          </div>

          {/* Field 2: Tavily API Key (optional) */}
          <div>
            <label
              htmlFor="tavily-key-input"
              className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--navy-800)] mb-2"
            >
              2. Tavily API Key <span className="text-[var(--navy-400)] font-normal text-xs">(Optional NCERT Search Grounding)</span>
            </label>
            <input
              id="tavily-key-input"
              type="password"
              placeholder="tvly-... (optional live syllabus search)"
              value={tavilyKey}
              onChange={handleTavilyChange}
              className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
            />
          </div>

          {/* Field 3 & 4: Subject Select & Class Select (Spacious 2-column grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="subject-select"
                className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--navy-800)] mb-2"
              >
                3. Subject
              </label>
              <select
                id="subject-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
              >
                <option value="Science">Science</option>
                <option value="Maths">Maths</option>
                <option value="SST">SST</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="grade-select"
                className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--navy-800)] mb-2"
              >
                4. Class
              </label>
              <select
                id="grade-select"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
              >
                <option value={8}>Class 8</option>
                <option value={9}>Class 9</option>
                <option value={10}>Class 10</option>
                <option value={11}>Class 11</option>
                <option value={12}>Class 12</option>
              </select>
            </div>
          </div>

          {/* Field 5: Mode Tabs (Spacious distinct buttons with comfortable gap) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--navy-800)] mb-2.5">
              5. Input Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2 bg-[var(--off-white)] rounded-xl border border-[var(--border)] mb-4">
              <button
                type="button"
                id="mode-file-tab"
                onClick={() => setMode('file')}
                className={`py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 min-h-[46px] ${
                  mode === 'file'
                    ? 'bg-[var(--white)] text-[var(--navy-900)] shadow-sm border border-[var(--border)]'
                    : 'text-[var(--navy-600)] hover:text-[var(--navy-900)] hover:bg-[var(--white)]/60'
                }`}
              >
                <span>📄</span>
                <span>File Upload</span>
              </button>
              <button
                type="button"
                id="mode-paste-tab"
                onClick={() => setMode('paste')}
                className={`py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 min-h-[46px] ${
                  mode === 'paste'
                    ? 'bg-[var(--white)] text-[var(--navy-900)] shadow-sm border border-[var(--border)]'
                    : 'text-[var(--navy-600)] hover:text-[var(--navy-900)] hover:bg-[var(--white)]/60'
                }`}
              >
                <span>✍️</span>
                <span>Paste Text</span>
              </button>
              <button
                type="button"
                id="mode-topic-tab"
                onClick={() => setMode('topic')}
                className={`py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 min-h-[46px] ${
                  mode === 'topic'
                    ? 'bg-[var(--white)] text-[var(--navy-900)] shadow-sm border border-[var(--border)]'
                    : 'text-[var(--navy-600)] hover:text-[var(--navy-900)] hover:bg-[var(--white)]/60'
                }`}
              >
                <span>💡</span>
                <span>Topic Name</span>
              </button>
            </div>

            {/* Mode: File Drop with generous padding */}
            {mode === 'file' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition ${
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
                <div className="text-3xl sm:text-4xl mb-2">📄</div>
                <div className="text-sm sm:text-base font-semibold text-[var(--navy-900)]">
                  {file ? file.name : 'Click to browse or drag & drop NCERT chapter file'}
                </div>
                <div className="text-xs text-[var(--navy-400)] mt-2">
                  Supports PDF, DOCX, TXT, MD (up to 10MB)
                </div>
              </div>
            )}

            {/* Mode: Paste */}
            {mode === 'paste' && (
              <textarea
                id="paste-textarea"
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste NCERT textbook paragraphs, formulas, or study notes here..."
                className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
              />
            )}

            {/* Mode: Topic */}
            {mode === 'topic' && (
              <input
                id="topic-input"
                type="text"
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                placeholder="e.g. Light — Reflection and Refraction"
                className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
              />
            )}
          </div>

          {/* Field 6 & 7: Vibe Select & Quiz Timer (Spacious 2-column grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label
                htmlFor="vibe-select"
                className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--navy-800)] mb-2"
              >
                6. Vibe
              </label>
              <select
                id="vibe-select"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
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
                className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--navy-800)] mb-2"
              >
                7. Quiz Timer (sec)
              </label>
              <input
                id="timer-input"
                type="number"
                min={5}
                max={60}
                value={quizTimer}
                onChange={(e) => setQuizTimer(Math.max(5, Math.min(60, Number(e.target.value) || 20)))}
                className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-[var(--border)] bg-[var(--white)] text-[var(--navy-900)] focus:outline-none focus:ring-2 focus:ring-[var(--navy-600)] transition"
              />
            </div>
          </div>

          {/* Field 8: Primary Submit Button with generous padding and top spacing */}
          <div className="pt-4 sm:pt-6">
            <button
              type="submit"
              id="generate-feed-btn"
              disabled={isLoading}
              className="w-full btn-primary py-4 px-6 text-base sm:text-lg font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all min-h-[54px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Synthesizing NCERT Feed...</span>
                </>
              ) : (
                <span>🚀 Generate Feed</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
