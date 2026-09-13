import React, { useEffect, useState } from 'react';
import { Mic, Square, X } from 'lucide-react';

export default function MicOverlay({
  isOpen = false,
  audioLevel = 0,
  transcript = '',
  onStop,
  onCancel,
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate 16 responsive audio waveform bars based on audioLevel
  const bars = Array.from({ length: 16 }, (_, i) => {
    const wave = Math.sin((i / 16) * Math.PI) * 0.8 + 0.2;
    const heightPercent = Math.max(15, Math.min(100, audioLevel * wave * 180));
    return heightPercent;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md text-white p-6 animate-in fade-in duration-200">
      {/* Top cancel button */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        title="Cancel recording"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main 200px animated orb */}
      <div className="relative flex items-center justify-center w-52 h-52 my-6">
        {/* Outer pulsing ripples */}
        <div
          className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
          style={{ animationDuration: '2s' }}
        />
        <div
          className="absolute inset-4 rounded-full bg-emerald-500/30 transition-transform duration-75"
          style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
        />
        <div className="relative flex flex-col items-center justify-center w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-2xl shadow-emerald-500/40 border-4 border-white/20">
          <Mic className="w-12 h-12 text-white animate-pulse" />
          <span className="text-xs font-bold tracking-wider mt-1 text-emerald-100">
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Waveform visualizer */}
      <div className="flex items-center gap-1.5 h-12 my-3 px-4 py-1 rounded-full bg-white/5 border border-white/10">
        {bars.map((h, idx) => (
          <div
            key={idx}
            className="w-1.5 rounded-full bg-gradient-to-t from-emerald-400 to-teal-300 transition-all duration-75"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* Prompt or live transcript preview */}
      <div className="max-w-md w-full text-center my-4 min-h-[50px] flex items-center justify-center">
        {transcript ? (
          <p className="text-lg font-medium text-emerald-300 animate-in fade-in">
            &ldquo;{transcript}&rdquo;
          </p>
        ) : (
          <p className="text-slate-300 text-sm animate-pulse">
            Listening to your CBSE doubt... Ask about mirrors, calculus, equations, or concepts!
          </p>
        )}
      </div>

      {/* Stop & Transcribe Button */}
      <button
        type="button"
        onClick={onStop}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30 transition active:scale-95"
      >
        <Square className="w-5 h-5 fill-current" />
        <span>Done Speaking</span>
      </button>
    </div>
  );
}
