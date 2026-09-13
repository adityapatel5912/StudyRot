import React, { useEffect } from 'react';

const TOUR_STEPS = [
  {
    title: "1. The Feed",
    copy: "Swipe through a feed of NCERT concepts. Each card snaps to your screen.",
    badge: "DEMO POST — your own feed will look like this",
    snippet: {
      type: "key_point",
      title: "Reflection & Real Images",
      body: "Concave mirrors form real, inverted images when object is placed beyond the focus $F$.",
    },
  },
  {
    title: "2. Quiz with Timer",
    copy: "Answer timed MCQs. Green means correct, red means wrong.",
    badge: "DEMO POST — your own feed will look like this",
    snippet: {
      type: "quiz",
      question: "Which mirror is used in dental examination?",
      options: ["Concave mirror", "Convex mirror", "Plane mirror", "Bifocal mirror"],
      answer: "Concave mirror",
    },
  },
  {
    title: "3. Animated Diagrams",
    copy: "Every concept comes with an AI-generated diagram that replays when you scroll back.",
    badge: "DEMO POST — your own feed will look like this",
    snippet: {
      type: "diagram",
      title: "Ray Diagram: Center of Curvature",
      svg: `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" class="w-full h-24">
        <rect width="300" height="120" fill="#f1f5f9" rx="8" />
        <line x1="20" y1="60" x2="280" y2="60" stroke="#94a3b8" stroke-width="2" />
        <path d="M 240 20 Q 200 60 240 100" stroke="#1e3a6b" stroke-width="4" fill="none" />
        <circle cx="120" cy="60" r="4" fill="#ef4444" />
        <text x="115" y="80" font-size="10" fill="#ef4444">C</text>
        <circle cx="180" cy="60" r="4" fill="#1e3a6b" />
        <text x="175" y="80" font-size="10" fill="#1e3a6b">F</text>
      </svg>`,
    },
  },
  {
    title: "4. Exam-Date Review",
    copy: "Set your exam date once. StudyRot tells you exactly what to review each morning.",
    badge: "DEMO POST — your own feed will look like this",
    snippet: {
      type: "review",
      title: "Daily Spaced Repetition",
      body: "Calculated by FSRS-6 scheduler to maximize retention on board exam day.",
    },
  },
  {
    title: "5. Solo Battle",
    copy: "Challenge 3 AI bots. Leaderboards update live. Losers study harder.",
    badge: "DEMO POST — your own feed will look like this",
    snippet: {
      type: "battle",
      title: "You vs. 3 Bots",
      body: "Speed and accuracy determine your place on the live podium!",
    },
  },
];

export default function Tour({ isOpen, currentStep, onNext, onSkip }) {
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep === 0) {
      // Step 1 auto-advances after 8 seconds if no interaction
      const timer = setTimeout(() => {
        onNext();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep, onNext]);

  if (!isOpen) return null;

  const stepData = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Step indicator header */}
        <div className="px-5 py-3.5 bg-[var(--navy-900)] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🚀</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Feature Tour • Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Skip
          </button>
        </div>

        {/* Demo Post Labeled Container */}
        <div className="p-5 flex-1 space-y-4">
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-center">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
              🏷️ {stepData.badge}
            </span>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--off-white)] p-4 shadow-inner space-y-2">
            <h4 className="text-sm font-bold text-[var(--navy-900)]">
              {stepData.snippet.title || stepData.title}
            </h4>
            {stepData.snippet.body && (
              <p className="text-xs text-[var(--navy-700)] leading-relaxed">
                {stepData.snippet.body}
              </p>
            )}
            {stepData.snippet.question && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-[var(--navy-900)]">
                  {stepData.snippet.question}
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {stepData.snippet.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-center font-medium ${
                        opt === stepData.snippet.answer
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-white border-[var(--border)] text-slate-600'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stepData.snippet.svg && (
              <div
                className="py-1 flex justify-center"
                dangerouslySetInnerHTML={{ __html: stepData.snippet.svg }}
              />
            )}
          </div>

          {/* Tour step copy */}
          <div className="space-y-1 pt-1">
            <h3 className="text-sm font-bold text-[var(--navy-900)]">
              {stepData.title}
            </h3>
            <p className="text-xs text-[var(--navy-600)] leading-relaxed">
              {stepData.copy}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-[var(--navy-900)]' : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-4 py-1.5 rounded-xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-xs"
            >
              {isLast ? "Generate your own →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
