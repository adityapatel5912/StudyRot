import React from 'react';

export default function BotBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold uppercase tracking-wider ${className}`}
      title="Simulated AI opponent"
    >
      <span>🤖</span>
      <span>BOT</span>
    </span>
  );
}
