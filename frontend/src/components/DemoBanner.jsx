import React from 'react';

export default function DemoBanner({ onExit, featureName = 'Feed' }) {
  return (
    <div className="w-full bg-amber-400 text-amber-950 px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-xs sticky top-0 z-40 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2">
        <span className="text-sm">⚠️</span>
        <span>
          <strong>Sandbox Demo ({featureName}):</strong> Nothing here is saved or stored.
        </span>
      </div>
      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="px-2.5 py-1 rounded bg-amber-950 text-amber-100 hover:bg-black transition text-[11px] font-bold"
        >
          Exit Demo
        </button>
      )}
    </div>
  );
}
