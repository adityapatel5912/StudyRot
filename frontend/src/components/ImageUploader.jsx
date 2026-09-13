import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, UploadCloud } from 'lucide-react';

export default function ImageUploader({ onImageSelect, selectedImage, onClear }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit.');
      return;
    }
    onImageSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const previewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;

  return (
    <div className="w-full">
      {selectedImage && previewUrl ? (
        <div className="relative rounded-2xl border border-emerald-300 bg-emerald-50/20 p-2 overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Uploaded doubt"
              className="w-14 h-14 object-cover rounded-xl border border-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                {selectedImage.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {(selectedImage.size / 1024).toFixed(0)} KB · Ready to analyze
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-2 text-slate-400">
              <UploadCloud className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-slate-700">
              <span className="text-emerald-700 font-bold">Snap or upload</span> textbook question / diagram
            </p>
            <p className="text-[10px] text-slate-400">
              Supports handwritten homework, diagrams & CBSE board papers (PNG, JPG)
            </p>

            {/* Mobile Snap Button */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Camera</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
