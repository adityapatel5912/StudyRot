import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSoloBattle } from '../hooks/useSoloBattle.js';
import { useSandbox } from '../contexts/SandboxProvider.jsx';
import SoloBattleLobby from '../components/SoloBattleLobby.jsx';
import SoloBattleArena from '../components/SoloBattleArena.jsx';
import BattlePodium from '../components/BattlePodium.jsx';
import BattleSummary from '../components/BattleSummary.jsx';
import DemoBanner from '../components/DemoBanner.jsx';

export default function SoloBattle({ soundEnabled = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSandbox, sandboxMode, exitSandbox } = useSandbox();
  const isBattleSandbox = isSandbox && sandboxMode === 'battle';

  const customQuestions = location.state?.questions || null;
  const initialTopic = location.state?.topic || 'CBSE Chapter';

  const [chosenDifficulty, setChosenDifficulty] = useState('medium');

  const {
    state,
    bots,
    currentQuestion,
    currentQIndex,
    totalQuestions = 8,
    timerSeconds,
    selectedOption,
    hasSubmitted,
    roundResult,
    leaderboard,
    commentary,
    finalSummary,
    loading,
    startBattle,
    submitAnswer,
  } = useSoloBattle({
    soundEnabled,
    isSandbox: isBattleSandbox,
  });

  const handleStart = (diff) => {
    startBattle(diff, customQuestions);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[var(--off-white)] flex flex-col">
      {isBattleSandbox && (
        <DemoBanner featureName="Solo Battle vs Bots" onExit={() => { exitSandbox(); navigate('/'); }} />
      )}

      <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {state === 'config' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-md text-center space-y-6 animate-in zoom-in-95">
            <div className="space-y-2">
              <span className="text-3xl">⚔️</span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--navy-900)]">
                Solo Battle vs AI Bots
              </h2>
              <p className="text-xs sm:text-sm text-[var(--navy-600)] max-w-md mx-auto leading-relaxed">
                Test your CBSE mastery against 3 simulated AI bots in real time. Speed counts: faster correct answers score up to 1000 points.
              </p>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2 text-left max-w-sm mx-auto">
              <label className="text-xs font-bold text-[var(--navy-800)] uppercase tracking-wider block">
                Select Bot Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Easy', acc: '55%', speed: '8-12s' },
                  { id: 'medium', label: 'Medium', acc: '75%', speed: '4-7s' },
                  { id: 'hard', label: 'Hard', acc: '90%', speed: '2-5s' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setChosenDifficulty(d.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      chosenDifficulty === d.id
                        ? 'bg-[var(--navy-900)] text-white border-[var(--navy-900)] font-bold shadow-xs'
                        : 'bg-white border-[var(--border)] text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">{d.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{d.acc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStart(chosenDifficulty)}
                className="px-6 py-3 rounded-2xl bg-[var(--navy-900)] text-white text-xs font-bold hover:bg-[var(--navy-800)] transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Joining Lobby...' : 'Enter Arena (You vs 3 Bots) →'}
              </button>
            </div>
          </div>
        )}

        {(state === 'lobby' || state === 'countdown') && (
          <SoloBattleLobby
            bots={bots}
            isCountdown={state === 'countdown'}
          />
        )}

        {(state === 'question' || state === 'reveal') && (
          <SoloBattleArena
            question={currentQuestion}
            questionIndex={currentQIndex}
            totalQuestions={8}
            timerSeconds={timerSeconds}
            selectedOption={selectedOption}
            hasSubmitted={hasSubmitted}
            roundResult={roundResult}
            leaderboard={leaderboard}
            commentary={commentary}
            onSubmitAnswer={submitAnswer}
          />
        )}

        {state === 'podium' && finalSummary && (
          <div className="space-y-4 animate-in fade-in">
            <BattlePodium
              summary={finalSummary}
              onPlayAgain={() => handleStart(chosenDifficulty)}
              onNewBattle={() => {
                if (isBattleSandbox) exitSandbox();
                navigate('/');
              }}
              isSandbox={isBattleSandbox}
            />
            <BattleSummary
              summary={finalSummary}
              onStartReview={() => navigate('/review')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
