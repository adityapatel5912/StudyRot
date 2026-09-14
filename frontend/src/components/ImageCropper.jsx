import React, { useState, useRef } from 'react';
import { Crop, RotateCw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef(null);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleConfirm = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Constrain max dimension to 1600px
    const maxDim = 1600;
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    if (rotation === 90 || rotation === 270) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);

    const compressedB64 = canvas.toDataURL('image/jpeg', 0.85);
    onCropComplete(compressedB64);
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md max-w-md mx-auto">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 border-b pb-2">
        <span className="flex items-center gap-1.5">
          <Crop className="w-4 h-4 text-indigo-600" />
          <span>Adjust Solution Photo</span>
        </span>
        <button
          type="button"
          onClick={handleRotate}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Rotate ({rotation}°)</span>
        </button>
      </div>

      {/* Image Container */}
      <div className="w-full h-64 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center relative">
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Solution preview"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            transition: 'transform 0.2s ease',
          }}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Zoom and Actions Bar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-700"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 text-[11px] font-mono">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="p-1.5 rounded bg-slate-100 dark:bg-slate-700"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Use Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
