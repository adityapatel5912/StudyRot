import React from 'react';
import { Volume2, Bot, User, VolumeX } from 'lucide-react';
import MathText from './MathText.jsx';
import { useTTS } from '../hooks/useTTS.js';

export default function ChatBubble({
  message,
  role = 'tutor', // 'student' | 'tutor'
  timestamp,
  voice = 'teacher',
  imageUrl,
}) {
  const isStudent = role === 'student';
  const { speak, isPlaying, currentText, stop } = useTTS();
  const isThisPlaying = isPlaying && currentText === message;

  const handleToggleSpeak = () => {
    if (isThisPlaying) {
      stop();
    } else {
      speak(message, { voice });
    }
  };

  return (
    <div className={`flex flex-col my-3 ${isStudent ? 'items-end' : 'items-start'}`}>
      {/* Sender Header */}
      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-semibold text-slate-500">
        {isStudent ? (
          <>
            <span>You</span>
            <User className="w-3.5 h-3.5 text-slate-400" />
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <Bot className="w-3.5 h-3.5 text-emerald-600" /> StudyRot Tutor
            </span>
          </>
        )}
        {timestamp && <span className="text-[10px] text-slate-400">· {timestamp}</span>}
      </div>

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed ${
          isStudent
            ? 'bg-[var(--navy-900)] text-white rounded-tr-none'
            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
        }`}
      >
        {/* Optional uploaded image */}
        {imageUrl && (
          <div className="mb-2.5 overflow-hidden rounded-lg border border-white/20 max-h-48">
            <img src={imageUrl} alt="Student uploaded doubt" className="w-full object-cover" />
          </div>
        )}

        {/* Message Content with Math */}
        <div className="space-y-1.5 font-normal">
          <MathText>{message}</MathText>
        </div>

        {/* Tutor audio play action */}
        {!isStudent && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full transition ${
                isThisPlaying
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isThisPlaying ? 'Stop audio' : 'Listen with StudyRot Tutor'}
            >
              {isThisPlaying ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px]">Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Read aloud</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-slate-400">CBSE AI Mentor</span>
          </div>
        )}
      </div>
    </div>
  );
}
