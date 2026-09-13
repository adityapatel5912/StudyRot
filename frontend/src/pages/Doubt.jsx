import React, { useState } from 'react';
import { Sparkles, Mic, BookOpen, Clock, AlertTriangle, Send } from 'lucide-react';
import { useDoubt, GUEST_SAMPLE_DOUBTS } from '../hooks/useDoubt.js';
import { useRecorder } from '../hooks/useRecorder.js';
import { useTTS } from '../hooks/useTTS.js';
import { transcribeAudioApi } from '../api.js';
import MicButton from '../components/MicButton.jsx';
import MicOverlay from '../components/MicOverlay.jsx';
import VoicePicker from '../components/VoicePicker.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import StepList from '../components/StepList.jsx';
import DiagramRenderer from '../components/DiagramRenderer.jsx';
import GraphRenderer from '../components/GraphRenderer.jsx';
import Simulation3D from '../components/Simulation3D.jsx';
import PracticeCard from '../components/PracticeCard.jsx';
import MathText from '../components/MathText.jsx';

export default function Doubt() {
  const [activeTab, setActiveTab] = useState('solve'); // 'solve' | 'history'
  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState('Science');
  const [grade, setGrade] = useState(10);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeVoice, setActiveVoice] = useState('teacher');
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
        if (res?.text) {
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
    askTextDoubt(sample.question, { subject: sample.subject, grade: sample.grade });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-900">
                StudyRot AI Doubt Solver & Voice Tutor
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              CBSE Class 8–12 · Hinglish STT (AssemblyAI) · Natural Speech (Fish Audio) · 3D Sims & Pure SVG Graphs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('solve')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'solve'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Solver & Simulation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History ({history.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'solve' ? (
          <div className="space-y-6">
            {/* Input card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Science">Science (Phy/Chem/Bio)</option>
                    <option value="Maths">Mathematics</option>
                    <option value="SST">Social Science (SST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Class / Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value={8}>Class 8</option>
                    <option value={9}>Class 9</option>
                    <option value={10}>Class 10 (Board Exam)</option>
                    <option value={11}>Class 11</option>
                    <option value={12}>Class 12 (Board Exam)</option>
                  </select>
                </div>
              </div>

              {/* Voice Picker */}
              <VoicePicker
                selectedVoice={activeVoice}
                onSelectVoice={setActiveVoice}
              />

              {/* Image Uploader */}
              <ImageUploader
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                onClear={() => setSelectedImage(null)}
              />

              {/* Question Text Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Your Question
                  </label>
                  <span className="text-[11px] text-slate-400">Supports equations & LaTeX</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Type or click the mic to ask any NCERT question or derivation..."
                    className="w-full text-sm p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none pr-14 text-slate-900"
                  />
                  <div className="absolute right-3 bottom-3">
                    <MicButton
                      size="md"
                      isRecording={isRecording}
                      isProcessing={isTranscribing}
                      audioLevel={audioLevel}
                      onClick={isRecording ? handleStopRecording : startRecording}
                      title="Speak question via AssemblyAI"
                    />
                  </div>
                </div>
              </div>

              {/* Solve Button */}
              <button
                type="button"
                disabled={isLoading || (!questionText.trim() && !selectedImage)}
                onClick={handleSolve}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                {isLoading ? (
                  <span>StudyRot Tutor is Solving...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Get Step-by-Step Solution & 3D Sim</span>
                  </>
                )}
              </button>

              {/* Quick sample chips */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Try 1-Click CBSE Concept Doubts:
                </span>
                <div className="flex flex-wrap gap-2">
                  {GUEST_SAMPLE_DOUBTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleTrySample(s)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-medium text-slate-700 transition"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Solution Display Card */}
            {solution && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>StudyRot Tutor Solution</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => speak(solution.understanding || solution.final_answer, { voice: activeVoice })}
                    className="px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Read Aloud</span>
                  </button>
                </div>

                {/* Understanding */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed">
                  <MathText>{solution.understanding || ''}</MathText>
                </div>

                {/* 3D Simulation */}
                {solution.simulation_3d && (
                  <Simulation3D simulationSpec={solution.simulation_3d} />
                )}

                {/* SVG Diagram */}
                {solution.diagram_spec && (
                  <DiagramRenderer diagramSpec={solution.diagram_spec} />
                )}

                {/* Pure SVG Graph */}
                {solution.graph_spec && (
                  <GraphRenderer graphSpec={solution.graph_spec} />
                )}

                {/* Step-by-Step Breakdown */}
                {solution.steps && solution.steps.length > 0 && (
                  <StepList steps={solution.steps} voice={activeVoice} />
                )}

                {/* Final Answer */}
                {solution.final_answer && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
                      Final Answer
                    </span>
                    <div className="text-sm font-bold text-emerald-950">
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

                {/* Common CBSE Mistakes */}
                {solution.common_mistakes && solution.common_mistakes.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-1.5 mb-2 text-amber-800 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Common CBSE Mistakes:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900">
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

                {/* Follow-up practice */}
                {solution.next_practice && (
                  <PracticeCard
                    practice={solution.next_practice}
                    subject={subject}
                    grade={grade}
                    voice={activeVoice}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          /* History Tab */
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Your Recent Doubts</h2>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No doubts solved yet. Ask a question or try one of the samples!
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSolution(item.solution);
                      setQuestionText(item.question);
                      setActiveTab('solve');
                    }}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Class {item.grade} · {item.subject}</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.question}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <MicOverlay
        isOpen={isRecording}
        audioLevel={audioLevel}
        onStop={handleStopRecording}
        onCancel={cancelRecording}
      />
    </div>
  );
}
