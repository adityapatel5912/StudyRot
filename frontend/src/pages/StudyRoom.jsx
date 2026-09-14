import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudyRoom } from '../hooks/useStudyRoom.js';
import RoomLobby from '../components/RoomLobby.jsx';
import RoomChat from '../components/RoomChat.jsx';
import RoomPlayerList from '../components/RoomPlayerList.jsx';
import GroupQuizPanel from '../components/GroupQuizPanel.jsx';
import PostCard from '../components/PostCard.jsx';
import { Users, Share2, Copy, Check, LogOut, Sparkles } from 'lucide-react';

export default function StudyRoom() {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();

  const [activeCode, setActiveCode] = useState(routeCode || null);
  const [nickname, setNickname] = useState(() => localStorage.getItem('studyrot_nickname') || '');
  const [copied, setCopied] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [roomPosts, setRoomPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    players,
    hostId,
    currentPlayerId,
    mode,
    currentPostIndex,
    messages,
    quizState,
    connected,
    error: wsError,
    sendMessage,
    sendScroll,
    changeMode,
    startGroupQuiz,
    answerGroupQuiz,
    kickPlayer,
  } = useStudyRoom(activeCode, nickname);

  // Sync route code
  useEffect(() => {
    if (routeCode && routeCode !== activeCode) {
      setActiveCode(routeCode);
    }
  }, [routeCode]);

  // Fetch room details and generate feed content if available
  useEffect(() => {
    if (!activeCode) return;
    fetch(`/api/room/${activeCode}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data) {
          setRoomDetails(j.data);
          // Load demo feed for this topic
          fetch('/api/demo-generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: j.data.topic,
              subject: j.data.subject,
              grade: j.data.grade,
            }),
          })
            .then((res) => res.json())
            .then((feedJson) => {
              if (feedJson.data?.posts) {
                setRoomPosts(feedJson.data.posts);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [activeCode]);

  const handleCreateRoom = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setNickname(params.host_nickname);
        setActiveCode(json.data.room_code);
        navigate(`/room/${json.data.room_code}`);
      } else {
        setError(json.error || 'Failed to create room');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to room server');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (code, nick) => {
    setNickname(nick);
    setActiveCode(code);
    navigate(`/room/${code}`);
  };

  const handleCopyCode = () => {
    if (activeCode) {
      navigator.clipboard?.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveRoom = () => {
    setActiveCode(null);
    navigate('/room');
  };

  // If no room is active, render lobby
  if (!activeCode) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <RoomLobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          loading={loading}
          error={error}
        />
      </div>
    );
  }

  const activePost = roomPosts[currentPostIndex] || roomPosts[0];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-slate-100 dark:bg-slate-900">
      {/* Top Header Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200 dark:border-indigo-800">
            <span>Room: {activeCode}</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="hover:text-indigo-900 dark:hover:text-white"
              title="Copy room code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span className="hidden sm:inline-block font-semibold text-xs text-slate-700 dark:text-slate-200 truncate max-w-xs">
            {roomDetails?.topic || 'CBSE Study Session'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            Mode: {mode === 'sync' ? 'Host Sync 🔄' : 'Free Scroll 🔓'}
          </span>

          <button
            type="button"
            onClick={handleLeaveRoom}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Room Layout: Content Feed + Players Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Center: Content Area & Group Quiz */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start gap-4">
          {/* Active Group Quiz Banner */}
          {quizState && (
            <div className="w-full max-w-xl">
              <GroupQuizPanel
                quizState={quizState}
                onSelectAnswer={answerGroupQuiz}
                currentPlayerId={currentPlayerId}
              />
            </div>
          )}

          {/* Synced Post Card */}
          {activePost ? (
            <div className="w-full max-w-md flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Post {currentPostIndex + 1} of {roomPosts.length}
                </span>
                {mode === 'sync' && hostId === currentPlayerId && (
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                    You control the room's current post
                  </span>
                )}
              </div>

              <PostCard
                post={activePost}
                soundEnabled={false}
                index={currentPostIndex}
                active={true}
              />

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-2 px-1">
                <button
                  type="button"
                  disabled={currentPostIndex === 0 || (mode === 'sync' && hostId !== currentPlayerId)}
                  onClick={() => sendScroll(currentPostIndex - 1)}
                  className="px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-800 text-xs font-semibold disabled:opacity-40"
                >
                  Previous Post
                </button>
                <button
                  type="button"
                  disabled={currentPostIndex === roomPosts.length - 1 || (mode === 'sync' && hostId !== currentPlayerId)}
                  onClick={() => sendScroll(currentPostIndex + 1)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-40"
                >
                  Next Post
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-sm py-12">
              Loading study material for {roomDetails?.topic || 'session'}...
            </div>
          )}
        </div>

        {/* Right: Players Roster & Controls */}
        <div className="shrink-0 flex flex-col">
          <RoomPlayerList
            players={players}
            hostId={hostId}
            currentPlayerId={currentPlayerId}
            mode={mode}
            onModeChange={changeMode}
            onStartQuiz={startGroupQuiz}
            onKickPlayer={kickPlayer}
            quizActive={quizState && !quizState.finished}
          />
          {/* Bottom Chat Component */}
          <div className="w-full lg:w-64 flex-1">
            <RoomChat
              messages={messages}
              onSendMessage={sendMessage}
              currentPlayerId={currentPlayerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
