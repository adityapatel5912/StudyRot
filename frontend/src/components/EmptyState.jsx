import React from 'react';

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  sandboxLabel,
  onSandbox,
  className = '',
}) {
  return (
    <div className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-white/70 shadow-xs ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[var(--off-white)] border border-[var(--border)] flex items-center justify-center text-2xl mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[var(--navy-900)] mb-1.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--navy-600)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-5 py-2.5 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-sm"
          >
            {actionLabel}
          </button>
        )}
        {sandboxLabel && onSandbox && (
          <button
            type="button"
            onClick={onSandbox}
            className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-100 transition"
          >
            {sandboxLabel}
          </button>
        )}
      </div>
    </div>
  );
}
