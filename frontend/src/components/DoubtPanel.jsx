import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  Volume2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useDoubt, GUEST_SAMPLE_DOUBTS } from '../hooks/useDoubt.js';
import { useRecorder } from '../hooks/useRecorder.js';
import { useTTS } from '../hooks/useTTS.js';
import { transcribeAudioApi } from '../api.js';
import MicButton from './MicButton.jsx';
import MicOverlay from './MicOverlay.jsx';
import VoicePicker from './VoicePicker.jsx';
import ImageUploader from './ImageUploader.jsx';
import StepList from './StepList.jsx';
import DiagramRenderer from './DiagramRenderer.jsx';
import GraphRenderer from './GraphRenderer.jsx';
import Simulation3D from './Simulation3D.jsx';
import PracticeCard from './PracticeCard.jsx';
import MathText from './MathText.jsx';

export default function DoubtPanel({
  isOpen,
  onClose,
  initialPayload = null,
  activeVoice = 'teacher',
  onSelectVoice,
}) {
  const [activeTab, setActiveTab] = useState('ask'); // 'ask' | 'solution' | 'history'
  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState('Science');
  const [grade, setGrade] = useState(10);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    solution,
    setSolution,
    isLoading,
    error,
    history,
    askTextDoubt,
    askImageDoubt,
    clearSolution,
  } = useDoubt({ grade, subject });

  const { isRecording, audioLevel, startRecording, stopRecording, cancelRecording } = useRecorder();
  const { speak, isPlaying, stop: stopAudio } = useTTS({ defaultVoice: activeVoice, grade, subject });

  // Handle incoming context (e.g. from a post or quiz)
  useEffect(() => {
    if (initialPayload) {
      if (initialPayload.question) setQuestionText(initialPayload.question);
      if (initialPayload.subject) setSubject(initialPayload.subject);
      if (initialPayload.grade) setGrade(Number(initialPayload.grade));
      if (initialPayload.autoSolve) {
        askTextDoubt(initialPayload.question, {
          subject: initialPayload.subject || subject,
          grade: initialPayload.grade || grade,
        });
        setActiveTab('solution');
      }
    }
  }, [initialPayload, askTextDoubt, subject, grade]);

  // When solution arrives, switch to solution tab
  useEffect(() => {
    if (solution) {
      setActiveTab('solution');
    }
  }, [solution]);

  const handleStopRecording = async () => {
    try {
      setIsTranscribing(true);
      const audioBlob = await stopRecording();
      if (audioBlob) {
        const res = await transcribeAudioApi(audioBlob, {
          grade,
          subject,
          prompt: 'CBSE Science Maths SST board exam doubt question',
        });
        if (res && res.text) {
          setQuestionText((prev) => (prev ? `${prev} ${res.text}` : res.text));
        }
      }
    } catch (err) {
      console.warn('Audio transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSolve = async () => {
    if (selectedImage) {
      await askImageDoubt(selectedImage, questionText, { subject, grade });
    } else if (questionText.trim()) {
      await askTextDoubt(questionText, { subject, grade });
    }
  };

  const handleTrySample = (sample) => {
    setQuestionText(sample.question);
    setSubject(sample.subject);
    setGrade(sample.grade);
    setActiveTab('solution');
    askTextDoubt(sample.question, { subject: sample.subject, grade: sample.grade });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (520px max) */}
      <div className="relative z-10 w-full sm:max-w-[520px] h-full bg-white shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>StudyRot AI Tutor</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  CBSE 8–12
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Voice STT · 3D Sims · Pure SVG Graphs · Step-by-Step
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition"
            title="Close Tutor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-200 px-5 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('ask')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'ask'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ask Doubt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('solution')}
            disabled={!solution}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'solution'
                ? 'border-emerald-600 text-emerald-700'
                : !solution
                ? 'border-transparent text-slate-300 cursor-not-allowed'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solution & Sim</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: ASK DOUBT */}
          {activeTab === 'ask' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Grade and Subject selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Science">Science (Phy/Chem/Bio)</option>
                    <option value="Maths">Mathematics</option>
                    <option value="SST">Social Science (SST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Class / Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10 (Board)</option>
                    <option value={11}>Class 11</option>
                    <option value={12}>Class 12 (Board)</option>
                  </select>
                </div>
              </div>

              {/* Voice Picker */}
              <VoicePicker
                selectedVoice={activeVoice}
                onSelectVoice={onSelectVoice}
              />

              {/* Image Uploader */}
              <ImageUploader
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                onClear={() => setSelectedImage(null)}
              />

              {/* Question Input Textarea + Voice Record Trigger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Type or Speak your Question
                  </label>
                  <span className="text-[10px] text-slate-400">LaTeX equations supported</span>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. Derive 1/v + 1/u = 1/f or why is sky blue? Or speak your doubt in Hinglish..."
                    className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none pr-12 text-slate-900 bg-white"
                  />

                  <div className="absolute right-2.5 bottom-2.5">
                    <MicButton
                      size="sm"
                      isRecording={isRecording}
                      isProcessing={isTranscribing}
                      audioLevel={audioLevel}
                      onClick={isRecording ? handleStopRecording : startRecording}
                      title="Speak doubt via AssemblyAI"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                disabled={isLoading || (!questionText.trim() && !selectedImage)}
                onClick={handleSolve}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>StudyRot Tutor is Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Solve with Step-by-Step & 3D Sim</span>
                  </>
                )}
              </button>

              {/* Sample Doubts Quick Taps */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Try 1-Click Guest Concept Doubts:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GUEST_SAMPLE_DOUBTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleTrySample(s)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-[11px] font-medium text-slate-700 transition text-left"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOLUTION VIEW */}
          {activeTab === 'solution' && (
            isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 animate-in fade-in">
                <RotateCcw className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-bold text-slate-700">StudyRot Tutor is Solving...</p>
                <p className="text-xs text-slate-400">Synthesizing step-by-step CBSE solution & 3D simulation</p>
              </div>
            ) : solution ? (
              <div className="space-y-4 animate-in fade-in duration-200">
              {/* Understanding header */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Understanding
                  </span>
                  <button
                    type="button"
                    onClick={() => speak(solution.understanding || solution.final_answer, { voice: activeVoice })}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  <MathText>{solution.understanding || 'Here is the comprehensive CBSE solution:'}</MathText>
                </p>
              </div>

              {/* Interactive 3D Simulation (if provided) */}
              {solution.simulation_3d && (
                <Simulation3D simulationSpec={solution.simulation_3d} />
              )}

              {/* Interactive Diagram (if provided) */}
              {solution.diagram_spec && (
                <DiagramRenderer diagramSpec={solution.diagram_spec} />
              )}

              {/* Pure SVG Graph (if provided) */}
              {solution.graph_spec && (
                <GraphRenderer graphSpec={solution.graph_spec} />
              )}

              {/* Step-by-Step Breakdown */}
              {solution.steps && solution.steps.length > 0 && (
                <StepList steps={solution.steps} voice={activeVoice} />
              )}

              {/* Final Answer Card */}
              {solution.final_answer && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                    Final Answer / Conclusion
                  </span>
                  <div className="text-xs font-bold text-emerald-950">
                    <MathText>
                      {typeof solution.final_answer === 'object' && solution.final_answer !== null
                        ? Object.entries(solution.final_answer)
                            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                            .join(' · ')
                        : String(solution.final_answer || '')}
                    </MathText>
                  </div>
                </div>
              )}

              {/* Common CBSE Board Mistakes */}
              {solution.common_mistakes && solution.common_mistakes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-1.5 mb-1.5 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Common CBSE Mistakes to Avoid:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
                    {solution.common_mistakes.map((m, idx) => {
                      const mistakeText = typeof m === 'object' && m !== null ? (m.mistake || m.text || JSON.stringify(m)) : String(m);
                      return (
                        <li key={idx}>
                          <MathText>{mistakeText}</MathText>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Follow-up Practice MCQ */}
              {solution.next_practice && (
                <PracticeCard
                  practice={solution.next_practice}
                  subject={subject}
                  grade={grade}
                  voice={activeVoice}
                />
              )}
            </div>
          ) : null)}

          {/* TAB 3: HISTORY VIEW */}
          {activeTab === 'history' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No recent doubts</p>
                  <p className="text-[11px]">Ask a question to see your history here.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSolution(item.solution);
                      setQuestionText(item.question);
                      setActiveTab('solution');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition text-left"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Class {item.grade} · {item.subject}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                      {item.question}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-red-50 border-t border-red-200 text-red-800 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={clearSolution} className="font-bold underline">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Mic Overlay while recording */}
      <MicOverlay
        isOpen={isRecording}
        audioLevel={audioLevel}
        onStop={handleStopRecording}
        onCancel={cancelRecording}
      />
    </div>
  );
}
