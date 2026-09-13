import React from 'react';
import { Volume2, Check } from 'lucide-react';
import { useTTS } from '../hooks/useTTS.js';

const VOICES = [
  {
    id: 'teacher',
    name: 'CBSE Mentor',
    role: 'Patient & Encouraging',
    emoji: '🎓',
    previewText: 'Namaste! Main hoon aapka StudyRot Tutor. Focus on the core formula and steps!',
  },
  {
    id: 'buddy',
    name: 'Study Buddy',
    role: 'Energetic Hinglish Peer',
    emoji: '⚡',
    previewText: 'Arey chill! This concept is super simple once you understand the intuition behind it.',
  },
  {
    id: 'narrator',
    name: 'Textbook Narrator',
    role: 'Authoritative & Structured',
    emoji: '🎙️',
    previewText: 'According to NCERT guidelines, let us break down each derivation step systematically.',
  },
];

export default function VoicePicker({
  selectedVoice = 'teacher',
  onSelectVoice,
  className = '',
}) {
  const { speak, isPlaying, currentText, stop } = useTTS();

  const handlePreview = (e, voice) => {
    e.stopPropagation();
    if (isPlaying && currentText === voice.previewText) {
      stop();
    } else {
      speak(voice.previewText, { voice: voice.id });
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <label className="block text-xs font-bold text-[var(--navy-700)] uppercase tracking-wider">
        Tutor Voice Preset
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          const isThisPreviewPlaying = isPlaying && currentText === v.previewText;

          return (
            <div
              key={v.id}
              onClick={() => onSelectVoice && onSelectVoice(v.id)}
              className={`cursor-pointer relative p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-400/40'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label={v.name}>
                    {v.emoji}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--navy-950)] flex items-center gap-1">
                      {v.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                    </h4>
                    <p className="text-[11px] text-slate-500">{v.role}</p>
                  </div>
                </div>

                {/* Listen sample button */}
                <button
                  type="button"
                  onClick={(e) => handlePreview(e, v)}
                  title="Preview this voice"
                  aria-label={`Preview ${v.name} voice`}
                  className={`p-1.5 rounded-full text-xs transition ${
                    isThisPreviewPlaying
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
