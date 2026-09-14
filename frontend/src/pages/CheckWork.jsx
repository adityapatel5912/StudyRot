import React, { useState } from 'react';
import { useCheckWork } from '../hooks/useCheckWork.js';
import ImageCropper from '../components/ImageCropper.jsx';
import ComparisonView from '../components/ComparisonView.jsx';
import {
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Key,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export default function CheckWork() {
  const {
    imageB64,
    setImageB64,
    questionText,
    setQuestionText,
    report,
    loadingStage,
    error,
    checkSolution,
    loadSample,
  } = useCheckWork();

  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedB64) => {
    setImageB64(croppedB64);
    setShowCropper(false);
  };

  const isLoading = loadingStage !== 'idle' && loadingStage !== 'done';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Camera className="w-7 h-7 text-indigo-600" />
            <span>Check My Work — Photo Feedback</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Snap your handwritten CBSE numerical or equation. The AI parses each step, flags sign errors, and explains exactly where you went wrong.
          </p>
        </div>

        {/* 1-Click Sample Demo */}
        <button
          type="button"
          onClick={loadSample}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Try 1-Click Sample Demo</span>
        </button>
      </div>

      {/* BYOK Info Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>BYOK Security:</strong> To check your own photos, add your Groq or NVIDIA NIM API key in{' '}
            <a href="/keys" className="underline text-indigo-600 dark:text-indigo-400 font-bold">
              Settings / Keys
            </a>
            . Sample problem operates with zero key required.
          </span>
        </div>
      </div>

      {/* Upload & Question Form */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Problem or Question Context (Optional):
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g. Concave mirror numerical: focal length 15 cm, object at 30 cm"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Upload Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <label className="flex-1 w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer transition">
            <Upload className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {imageB64 ? 'Replace Solution Photo' : 'Upload / Snap Handwritten Solution Photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {imageB64 && (
            <button
              type="button"
              onClick={() => checkSolution()}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {isLoading ? 'Diagnosing...' : 'Grade My Solution'}
            </button>
          )}
        </div>

        {/* Image Cropper Modal */}
        {showCropper && rawImageSrc && (
          <ImageCropper
            imageSrc={rawImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={() => setShowCropper(false)}
          />
        )}
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {loadingStage === 'ocr' && 'Step 1: Transcribing handwriting & equations (Nemotron-OCR)...'}
            {loadingStage === 'parsing' && 'Step 2: Identifying equations and calculation steps...'}
            {loadingStage === 'reasoning' && 'Step 3: Checking Cartesian sign conventions & arithmetic...'}
          </div>
          <span className="text-xs text-slate-400">
            Evaluating against CBSE Board marking schemes
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Result Report */}
      {report && (
        <div className="flex flex-col gap-6">
          {/* Top Score Banner */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    report.overall === 'correct'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : report.overall === 'mostly_correct'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                  }`}
                >
                  {report.overall?.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  Score Awarded: <strong className="text-indigo-600 text-sm">{report.score}</strong>
                </span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-100 font-medium mt-2">
                {report.final_verdict}
              </p>
            </div>

            {report.misconception_detected && report.misconception_detected !== 'none' && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-col gap-1 shrink-0 text-xs">
                <span className="font-bold text-rose-800 dark:text-rose-300">
                  Misconception: {report.misconception_detected.replace(/_/g, ' ')}
                </span>
                {report.recommended_drill && (
                  <a
                    href="/review"
                    className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                  >
                    <span>Launch remedial drill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Comparison / Steps View */}
          <ComparisonView report={report} imageB64={imageB64} />
        </div>
      )}
    </div>
  );
}
