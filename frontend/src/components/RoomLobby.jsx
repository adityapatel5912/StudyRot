import React, { useState } from 'react';
import { Users, Plus, LogIn, Sparkles, Copy, Check } from 'lucide-react';
import { validateRoomCode } from '../utils/roomCode.js';

export default function RoomLobby({ onCreateRoom, onJoinRoom, loading, error }) {
  const [tab, setTab] = useState('join'); // 'join' or 'create'
  const [nickname, setNickname] = useState(() => localStorage.getItem('studyrot_nickname') || '');
  const [roomCode, setRoomCode] = useState('');
  const [topic, setTopic] = useState('Light — Reflection and Refraction');
  const [subject, setSubject] = useState('Science');
  const [grade, setGrade] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(8);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return alert('Please enter a nickname.');
    if (!validateRoomCode(roomCode)) return alert('Please enter a valid 6-character room code.');
    localStorage.setItem('studyrot_nickname', nickname.trim());
    onJoinRoom(roomCode.trim().toUpperCase(), nickname.trim());
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return alert('Please enter a nickname.');
    if (!topic.trim()) return alert('Please enter a topic.');
    localStorage.setItem('studyrot_nickname', nickname.trim());
    onCreateRoom({
      host_nickname: nickname.trim(),
      topic: topic.trim(),
      subject,
      grade: Number(grade),
      max_players: Number(maxPlayers),
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Collaborative Study Rooms
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Study together in real time: synced feed, shared chat & group quizzes.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold">
        <button
          type="button"
          onClick={() => setTab('join')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            tab === 'join'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Join Room</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('create')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
            tab === 'create'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Host New Room</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold border border-rose-200">
          {error}
        </div>
      )}

      {/* Join Form */}
      {tab === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Your Nickname:
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Aryan, Priya"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              6-Character Room Code:
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7K2M9P"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono tracking-widest text-center text-lg font-bold uppercase focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Joining Room...' : 'Enter Study Room'}
          </button>
        </form>
      )}

      {/* Create Form */}
      {tab === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Your Host Nickname:
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. StudyLeader"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Study Topic / Chapter:
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Light — Reflection and Refraction"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Subject:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Science">Science</option>
                <option value="Maths">Maths</option>
                <option value="SST">SST</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Class / Grade:
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>Class 10</option>
                <option value={12}>Class 12</option>
                <option value={8}>Class 8</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Max Students (2–8):
            </label>
            <input
              type="number"
              min={2}
              max={8}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Study Room...' : 'Create & Launch Room'}
          </button>
        </form>
      )}
    </div>
  );
}
