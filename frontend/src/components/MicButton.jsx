import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function MicButton({
  isRecording = false,
  isProcessing = false,
  audioLevel = 0,
  onClick,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  title = 'Hold or click to talk',
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5 text-xs',
    md: 'w-11 h-11 p-2.5 text-sm',
    lg: 'w-16 h-16 p-4 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  // Scale pulse intensity based on audio level (0 to 1)
  const scale = isRecording ? Math.min(1.4, 1 + audioLevel * 0.6) : 1;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Dynamic sound wave ring when recording */}
      {isRecording && (
        <span
          className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"
          style={{ transform: `scale(${scale})` }}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        title={isRecording ? 'Stop recording' : title}
        aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
        style={{ transform: isRecording ? `scale(${scale})` : 'scale(1)' }}
        className={`relative z-10 flex items-center justify-center rounded-full font-semibold transition-all duration-150 shadow-md ${
          sizeClasses[size]
        } ${
          isRecording
            ? 'bg-red-600 text-white shadow-red-500/50 hover:bg-red-700 ring-4 ring-red-300'
            : isProcessing
            ? 'bg-amber-500 text-white cursor-wait'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30 hover:scale-105 active:scale-95'
        } ${className}`}
      >
        {isProcessing ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : isRecording ? (
          <MicOff className={`${iconSizes[size]} animate-bounce`} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>
    </div>
  );
}
