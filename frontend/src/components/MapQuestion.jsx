import React, { useState } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';

export default function MapQuestion({ question, selectedRegions = [], onSelectRegion }) {
  const regions = [
    { id: 'Gujarat', name: 'Gujarat (Dandi / Salt March)', x: 90, y: 220 },
    { id: 'Maharashtra', name: 'Maharashtra (Nagpur INC Session)', x: 140, y: 260 },
    { id: 'Punjab', name: 'Punjab (Amritsar / Jallianwala Bagh)', x: 130, y: 110 },
    { id: 'Bihar', name: 'Bihar (Champaran Satyagraha)', x: 260, y: 180 },
    { id: 'Tamil Nadu', name: 'Tamil Nadu (Kalpakkam Nuclear Plant)', x: 170, y: 380 },
    { id: 'Jammu and Kashmir', name: 'Jammu & Kashmir (Salal Dam)', x: 120, y: 60 },
    { id: 'Karnataka', name: 'Karnataka (Vijayanagar / Iron & Steel)', x: 140, y: 330 },
    { id: 'West Bengal', name: 'West Bengal (Kolkata Port)', x: 290, y: 220 },
  ];

  const handleToggle = (regionId) => {
    let next;
    if (selectedRegions.includes(regionId)) {
      next = selectedRegions.filter((r) => r !== regionId);
    } else {
      next = [...selectedRegions, regionId];
    }
    onSelectRegion(next);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      {/* SVG Outline Representation */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg relative overflow-hidden min-h-[360px]">
        <svg
          viewBox="0 0 380 460"
          className="w-full max-w-[320px] h-auto drop-shadow-md select-none"
        >
          {/* Stylized Political India Silhouette */}
          <path
            d="M 120 40 Q 150 20 170 50 L 190 90 L 230 110 L 280 130 Q 320 140 330 170 L 310 200 L 330 220 L 290 230 L 260 270 L 230 330 L 190 410 Q 170 430 160 410 L 130 360 L 110 300 L 70 240 L 70 200 L 100 170 L 100 120 Z"
            fill="currentColor"
            className="text-emerald-100 dark:text-emerald-950/60 stroke-emerald-400 dark:stroke-emerald-600"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Clickable Map Regions */}
          {regions.map((reg) => {
            const isSelected = selectedRegions.includes(reg.id);
            return (
              <g
                key={reg.id}
                onClick={() => handleToggle(reg.id)}
                className="cursor-pointer group transition-transform hover:scale-110"
              >
                <circle
                  cx={reg.x}
                  cy={reg.y}
                  r={isSelected ? 10 : 7}
                  className={
                    isSelected
                      ? 'fill-indigo-600 stroke-white stroke-2 animate-pulse'
                      : 'fill-amber-500 hover:fill-amber-600 stroke-white stroke-1'
                  }
                />
                <text
                  x={reg.x + 12}
                  y={reg.y + 4}
                  className={`text-[9px] font-bold ${
                    isSelected
                      ? 'fill-indigo-700 dark:fill-indigo-300'
                      : 'fill-slate-600 dark:fill-slate-300'
                  }`}
                >
                  {reg.id}
                </text>
              </g>
            );
          })}
        </svg>
        <span className="text-[11px] text-slate-400 mt-2">
          Click the map locations or buttons below to place pins
        </span>
      </div>

      {/* Region Selection Options List */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Target Locations:
        </h4>
        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
          {regions.map((reg) => {
            const isSelected = selectedRegions.includes(reg.id);
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => handleToggle(reg.id)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium border text-left transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {reg.name}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-slate-500 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
          Selected: <strong className="text-indigo-600">{selectedRegions.length}</strong> location(s)
        </div>
      </div>
    </div>
  );
}
