import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

export default function DiagramRenderer({ diagramSpec }) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!diagramSpec) return null;

  const svgContent = typeof diagramSpec === 'string' ? diagramSpec : diagramSpec.svg || '';
  const title = typeof diagramSpec === 'object' ? diagramSpec.title : 'Concept Diagram';
  const description = typeof diagramSpec === 'object' ? diagramSpec.description : '';

  if (!svgContent) return null;

  const sanitizedSvg = DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: [
      'svg', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
      'path', 'text', 'tspan', 'defs', 'linearGradient', 'stop', 'animate',
      'animateTransform', 'animateMotion', 'marker'
    ],
    ADD_ATTR: [
      'viewBox', 'xmlns', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
      'width', 'height', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
      'stroke-linecap', 'stroke-linejoin', 'opacity', 'transform', 'font-size',
      'font-family', 'font-weight', 'text-anchor', 'dominant-baseline', 'id', 'marker-end'
    ],
  });

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.25));
  const handleReset = () => setZoom(1);

  return (
    <div
      className={`my-4 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col bg-white/95 backdrop-blur-md' : 'w-full'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-800">{title}</h4>
          {description && <p className="text-[11px] text-slate-500">{description}</p>}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset Zoom"
            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Diagram'}
            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition ml-1"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="p-4 flex items-center justify-center overflow-auto min-h-[220px] bg-slate-900/5">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
          className="w-full flex items-center justify-center max-w-[500px]"
          dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
        />
      </div>
    </div>
  );
}
