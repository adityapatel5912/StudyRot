import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Volume2, Bot, Sparkles, MessageSquare, VolumeX } from 'lucide-react';
import { useTalkMode } from '../hooks/useTalkMode.js';
import { useRecorder } from '../hooks/useRecorder.js';
import { useTTS } from '../hooks/useTTS.js';
import { transcribeAudioApi, solveTextDoubtApi } from '../api.js';
import MathText from './MathText.jsx';
import VoicePicker from './VoicePicker.jsx';

const SAMPLE_PROMPTS = [
  'Explain why the sky is blue during the day.',
  'Derive the mirror formula 1/v + 1/u = 1/f.',
  'How does projectile trajectory curve under gravity?',
  'Explain Pythagorean trigonometric identity using the unit circle.',
];

export default function TalkMode({ isOpen, onClose, activeVoice = 'teacher', onSelectVoice }) {
  const [grade, setGrade] = useState(10);
  const [subject, setSubject] = useState('Science');
  const [messages, setMessages] = useState([
    {
      role: 'tutor',
      text: 'Namaste! Main hoon aapka StudyRot Tutor. Ask me any CBSE question or formula, or tap the mic to speak!',
    },
  ]);
  const [isProcessingHttp, setIsProcessingHttp] = useState(false);

  const {
    status: wsStatus,
    userTranscript,
    aiText,
    connect,
    disconnect,
    sendTextMessage,
  } = useTalkMode({
    voice: activeVoice,
    grade,
    subject,
    onTranscript: (txt) => {
      setMessages((prev) => [...prev, { role: 'student', text: txt }]);
    },
    onAiResponse: (txt) => {
      setMessages((prev) => [...prev, { role: 'tutor', text: txt }]);
    },
  });

  const { isRecording, audioLevel, startRecording, stopRecording, cancelRecording } = useRecorder();
  const { speak, isPlaying, stop: stopTTS } = useTTS({ defaultVoice: activeVoice, grade, subject });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      connect();
    } else {
      disconnect();
      stopTTS();
    }
  }, [isOpen, connect, disconnect, stopTTS]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiText]);

  const handleStopVoiceInput = async () => {
    try {
      setIsProcessingHttp(true);
      const audioBlob = await stopRecording();
      if (!audioBlob) {
        setIsProcessingHttp(false);
        return;
      }

      // Transcribe using AssemblyAI
      const sttRes = await transcribeAudioApi(audioBlob, {
        grade,
        subject,
        prompt: 'CBSE Science Maths Doubt question in Hinglish and English',
      });

      const question = sttRes?.text || '';
      if (!question.trim()) {
        setIsProcessingHttp(false);
        return;
      }

      // Add student message
      setMessages((prev) => [...prev, { role: 'student', text: question }]);

      // Solve doubt
      const doubtRes = await solveTextDoubtApi({
        question,
        grade,
        subject,
      });

      const sol = doubtRes?.solution || doubtRes;
      const answer = sol.understanding || sol.final_answer || 'Here is the explanation for your doubt.';

      setMessages((prev) => [...prev, { role: 'tutor', text: answer }]);

      // Speak back
      await speak(answer, { voice: activeVoice });
    } catch (err) {
      console.warn('Voice talk error:', err);
    } finally {
      setIsProcessingHttp(false);
    }
  };

  const handleSendPrompt = async (prompt) => {
    setMessages((prev) => [...prev, { role: 'student', text: prompt }]);
    setIsProcessingHttp(true);
    try {
      const doubtRes = await solveTextDoubtApi({
        question: prompt,
        grade,
        subject,
      });
      const sol = doubtRes?.solution || doubtRes;
      const answer = sol.understanding || sol.final_answer || 'Here is the explanation for your doubt.';
      setMessages((prev) => [...prev, { role: 'tutor', text: answer }]);
      speak(answer, { voice: activeVoice });
    } catch (e) {
      console.warn('Prompt solve error:', e);
    } finally {
      setIsProcessingHttp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>StudyRot Tutor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-semibold">
                Live Voice Mode
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              AssemblyAI Universal-3.5 Pro + Fish Audio S2.1 Pro
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Exit Talk Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-6xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Column: Voice Orb & Quick Actions */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          {/* Animated 200px Voice Orb */}
          <div className="relative flex items-center justify-center w-52 h-52">
            {/* Outer rings when active or speaking */}
            {(isRecording || isPlaying) && (
              <>
                <div
                  className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
                  style={{ animationDuration: '2.5s' }}
                />
                <div
                  className="absolute inset-2 rounded-full bg-teal-500/25 transition-transform duration-75"
                  style={{ transform: `scale(${1 + (isRecording ? audioLevel : 0.3) * 0.4})` }}
                />
              </>
            )}

            <button
              type="button"
              onClick={isRecording ? handleStopVoiceInput : startRecording}
              className={`relative z-10 flex flex-col items-center justify-center w-40 h-40 rounded-full shadow-2xl transition-all duration-200 border-4 ${
                isRecording
                  ? 'bg-red-600 border-red-400 shadow-red-500/50 scale-105 ring-4 ring-red-400/30'
                  : isPlaying
                  ? 'bg-emerald-600 border-emerald-300 shadow-emerald-500/50 animate-pulse'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-white/20 shadow-emerald-500/30 hover:scale-105'
              }`}
            >
              {isRecording ? (
                <>
                  <Mic className="w-12 h-12 text-white animate-bounce" />
                  <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">Listening</span>
                </>
              ) : isPlaying ? (
                <>
                  <Volume2 className="w-12 h-12 text-white animate-pulse" />
                  <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">Speaking</span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12 text-white" />
                  <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">Tap to Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Quick status indicator */}
          <p className="text-xs text-slate-400 text-center font-medium">
            {isRecording
              ? 'Listening... Tap again when finished.'
              : isPlaying
              ? 'StudyRot Tutor is explaining...'
              : isProcessingHttp
              ? 'Analyzing your CBSE question...'
              : 'Tap the orb to ask anything in Hinglish or English'}
          </p>

          {/* Voice Picker */}
          <div className="w-full max-w-md bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <VoicePicker
              selectedVoice={activeVoice}
              onSelectVoice={onSelectVoice}
            />
          </div>

          {/* Quick Prompt Pills */}
          <div className="w-full max-w-md space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick CBSE Concept Doubts
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(prompt)}
                  className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 hover:text-emerald-300 border border-slate-700 text-left text-xs text-slate-300 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Conversation Transcript */}
        <div className="flex-1 flex flex-col bg-slate-900/70 rounded-2xl border border-slate-800 p-4 overflow-hidden h-[450px] md:h-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>Session Transcript</span>
            </div>
            {isPlaying && (
              <button
                type="button"
                onClick={stopTTS}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === 'student' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-500 mb-1 font-semibold">
                  {m.role === 'student' ? 'You' : 'StudyRot Tutor'}
                </span>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    m.role === 'student'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  <MathText>{m.text}</MathText>
                </div>
              </div>
            ))}
            {aiText && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-slate-500 mb-1 font-semibold">StudyRot Tutor</span>
                <div className="p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none">
                  <MathText>{aiText}</MathText>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
