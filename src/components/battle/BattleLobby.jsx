/** Classroom Battle Lobby component displaying room code, joined player roster, and game controls. */
import React, { useState } from 'react';
import { Copy, Check, Users, Play, ArrowLeft, User, Sparkles, Swords, Zap } from 'lucide-react';

export default function BattleLobby({
  roomCode,
  isHost,
  players = [],
  onStartBattle,
  onStartSolo,
  onJoinRoom,
  onLeave,
  joined = false,
  topicTitle = 'NCERT Chapter Battle',
  questionCount = 5,
  connected = true,
}) {
  const [copied, setCopied] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !playerNameInput.trim()) {
      setJoinError('Please enter both room PIN and your name.');
      return;
    }
    setJoinError('');
    onJoinRoom?.(joinCodeInput.trim(), playerNameInput.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6" id="battle-lobby-view">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Battle</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-xs font-semibold text-navy-600">
            {connected ? 'Live Sync Active' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Room Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3">
            <Swords className="w-3.5 h-3.5" />
            <span>Classroom Battle Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mb-1">
            {topicTitle}
          </h1>
          <p className="text-xs sm:text-sm text-navy-500">
            Rapid-fire live NCERT board exam battle · {questionCount} Questions
          </p>
        </div>

        {/* Room Code Display or Join Form */}
        {roomCode ? (
          <div className="bg-navy-900 text-white rounded-xl p-6 text-center mb-6 relative overflow-hidden shadow-inner">
            <div className="text-xs font-semibold tracking-wider uppercase text-navy-300 mb-1">
              Classroom Join PIN
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl sm:text-5xl font-black tracking-widest font-mono text-amber-400">
                {roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-200 border border-navy-700 transition"
                title="Copy Room PIN"
                aria-label="Copy Room PIN"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-navy-300 mt-2">
              Ask classmates to enter this PIN or join from their phone
            </p>
          </div>
        ) : (
          /* Join an existing room */
          <form onSubmit={handleJoinSubmit} className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
            <h2 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Enter Classroom PIN to Join</span>
            </h2>
            {joinError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mb-3 border border-red-200 font-medium">
                {joinError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-bold text-navy-700 uppercase tracking-wide mb-1">
                  6-Digit Room PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 481920"
                  className="w-full px-3 py-2 text-base font-mono font-bold tracking-wider rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-navy-700 uppercase tracking-wide mb-1">
                  Your Student Name
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-600"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-navy-900 text-white font-bold text-sm hover:bg-navy-800 transition shadow-sm"
            >
              Join Battle Arena
            </button>
          </form>
        )}

        {/* Players in Room */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy-700">
              <Users className="w-4 h-4 text-navy-500" />
              <span>Students in Arena ({players.length})</span>
            </div>
            <span className="text-[11px] text-navy-500">
              {players.length === 0 ? 'Waiting for students...' : 'Ready to start'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
            {players.length > 0 ? (
              players.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {p.name ? p.name.charAt(0).toUpperCase() : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-navy-900 truncate">
                      {p.name}
                    </p>
                    {p.isHost && (
                      <span className="text-[9px] font-bold text-red-600 uppercase tracking-wider">
                        Host
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-6 text-center text-xs text-navy-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                Share the 6-digit PIN with students or start solo practice below
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
          {/* Host Start Battle Button */}
          {isHost && (
            <button
              type="button"
              id="host-start-battle-btn"
              onClick={onStartBattle}
              disabled={players.length === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Battle ({players.length} Joined)</span>
            </button>
          )}

          {/* Instant Solo Practice Mode */}
          {onStartSolo && (
            <button
              type="button"
              id="solo-practice-btn"
              onClick={onStartSolo}
              className="py-3 px-5 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-900 border border-navy-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-navy-600" />
              <span>Solo Practice Mode (No Wait)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
