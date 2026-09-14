import React, { useState, useRef, useEffect } from 'react';
import MathText from './MathText.jsx';
import { Send, Bot, Sparkles } from 'lucide-react';

export default function RoomChat({ messages = [], onSendMessage, currentPlayerId }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    onSendMessage(clean);
    setInputText('');
  };

  const insertAiTag = () => {
    if (!inputText.includes('@ai')) {
      setInputText((prev) => `@ai ${prev}`.trim());
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      {/* Quick AI Mention Suggestion Pill */}
      <div className="px-3 py-1.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
        <span className="flex items-center gap-1 text-[11px] font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Tip: Type <strong className="font-mono">@ai</strong> to ask StudyRot Tutor a question
        </span>
        <button
          type="button"
          onClick={insertAiTag}
          className="px-2 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 font-bold text-[10px] transition"
        >
          + Add @ai
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 max-h-64 sm:max-h-72">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-6">
            No messages yet. Say hi to the room or ask @ai!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.player_id === currentPlayerId;
            const isAi = msg.is_ai || msg.nickname?.includes('🤖');

            if (isAi) {
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-emerald-600" />
                      <span>{msg.nickname || 'StudyRot AI Tutor 🤖'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600/70 font-normal">
                      {msg.timestamp || ''}
                    </span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-100 leading-relaxed font-sans">
                    <MathText>{msg.text}</MathText>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex flex-col text-xs ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                  <span
                    className="font-bold"
                    style={{ color: msg.color || '#4f46e5' }}
                  >
                    {msg.nickname}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  <MathText>{msg.text}</MathText>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <input
          type="text"
          maxLength={200}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message room or ask @ai..."
          className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
