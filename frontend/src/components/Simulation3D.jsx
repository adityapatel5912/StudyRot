import React, { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, Sliders } from 'lucide-react';
import MathText from './MathText.jsx';

export default function Simulation3D({ simulationSpec }) {
  const type = simulationSpec?.type || 'mirror';
  const title = simulationSpec?.title || 'Interactive Concept Simulation';

  // State for Projectile simulation
  const [projSpeed, setProjSpeed] = useState(25);
  const [projAngle, setProjAngle] = useState(45);

  // State for Optics simulation
  const [opticsU, setOpticsU] = useState(-30); // Object distance
  const [opticsF, setOpticsF] = useState(-15); // Focal length (concave = negative)

  // State for Unit Circle
  const [circleAngle, setCircleAngle] = useState(45);

  // Computed values for Projectile
  const projectileData = useMemo(() => {
    const g = 9.8;
    const rad = (projAngle * Math.PI) / 180;
    const tFlight = (2 * projSpeed * Math.sin(rad)) / g;
    const maxH = Math.pow(projSpeed * Math.sin(rad), 2) / (2 * g);
    const range = (Math.pow(projSpeed, 2) * Math.sin(2 * rad)) / g;

    const points = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tFlight;
      const x = projSpeed * Math.cos(rad) * t;
      const y = projSpeed * Math.sin(rad) * t - 0.5 * g * t * t;
      points.push({ x: Math.max(0, x), y: Math.max(0, y) });
    }

    return { tFlight, maxH, range, points };
  }, [projSpeed, projAngle]);

  // Computed values for Concave Mirror
  const opticsData = useMemo(() => {
    // 1/v = 1/f - 1/u => v = (f * u) / (u - f)
    const u = opticsU;
    const f = opticsF;
    let v = -Infinity;
    if (u !== f) {
      v = (f * u) / (u - f);
    }
    const m = -v / u;
    const objHeight = 25;
    const imgHeight = m * objHeight;

    return { u, f, v, m, objHeight, imgHeight };
  }, [opticsU, opticsF]);

  // Computed values for Unit Circle
  const circleData = useMemo(() => {
    const rad = (circleAngle * Math.PI) / 180;
    const cosVal = Math.cos(rad);
    const sinVal = Math.sin(rad);
    return { rad, cosVal, sinVal };
  }, [circleAngle]);

  return (
    <div className="my-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">{title}</h4>
            <span className="text-[11px] text-emerald-600 font-medium">
              StudyRot 3D / Interactive Simulator
            </span>
          </div>
        </div>
      </div>

      {/* RENDER SIMULATION ACCORDING TO TYPE */}
      {type === 'projectile' ? (
        <div className="space-y-4">
          {/* SVG Canvas for Projectile */}
          <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 450 200" className="w-full max-w-[440px] h-44 select-none">
              {/* Ground line */}
              <line x1="20" y1="180" x2="430" y2="180" stroke="#475569" strokeWidth="2" />
              {/* Path */}
              {projectileData.points.length > 1 && (
                <path
                  d={projectileData.points
                    .map((pt, i) => {
                      const sx = 30 + (pt.x / (projectileData.range || 1)) * 360;
                      const sy = 180 - (pt.y / (projectileData.maxH || 1)) * 140;
                      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
              )}
              {/* Launch Cannon / Point */}
              <circle cx="30" cy="180" r="5" fill="#f59e0b" />
              {/* Peak Height Indicator */}
              <circle
                cx="210"
                cy={180 - 140}
                r="4"
                fill="#ef4444"
              />
              <text x="210" y="32" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="bold">
                H = {projectileData.maxH.toFixed(1)} m
              </text>
              {/* Land Point */}
              <circle cx="390" cy="180" r="5" fill="#3b82f6" />
              <text x="390" y="196" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">
                R = {projectileData.range.toFixed(1)} m
              </text>
            </svg>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Launch Speed ($u$):</span>
                <span className="text-emerald-600 font-bold">{projSpeed} m/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={projSpeed}
                onChange={(e) => setProjSpeed(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Angle ($\theta$):</span>
                <span className="text-emerald-600 font-bold">{projAngle}°</span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                value={projAngle}
                onChange={(e) => setProjAngle(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      ) : type === 'unit_circle' ? (
        <div className="space-y-4">
          {/* Unit Circle Canvas */}
          <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
            <svg viewBox="0 0 300 240" className="w-full max-w-[320px] h-48 select-none">
              <circle cx="150" cy="120" r="80" fill="none" stroke="#475569" strokeWidth="2" />
              {/* Axes */}
              <line x1="40" y1="120" x2="260" y2="120" stroke="#64748b" strokeWidth="1.5" />
              <line x1="150" y1="20" x2="150" y2="220" stroke="#64748b" strokeWidth="1.5" />
              {/* Radius line */}
              <line
                x1="150"
                y1="120"
                x2={150 + circleData.cosVal * 80}
                y2={120 - circleData.sinVal * 80}
                stroke="#10b981"
                strokeWidth="2.5"
              />
              {/* Sin vertical leg */}
              <line
                x1={150 + circleData.cosVal * 80}
                y1="120"
                x2={150 + circleData.cosVal * 80}
                y2={120 - circleData.sinVal * 80}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
              {/* Cos horizontal leg */}
              <line
                x1="150"
                y1="120"
                x2={150 + circleData.cosVal * 80}
                y2="120"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {/* Dot on circle */}
              <circle
                cx={150 + circleData.cosVal * 80}
                cy={120 - circleData.sinVal * 80}
                r="5"
                fill="#fbbf24"
              />
            </svg>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Angle ($\theta$): {circleAngle}°</span>
              <span className="text-emerald-700 font-bold">
                $\cos$: {circleData.cosVal.toFixed(2)}, $\sin$: {circleData.sinVal.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={circleAngle}
              onChange={(e) => setCircleAngle(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      ) : (
        /* Default: Concave Mirror Ray Optics Simulator */
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
            <svg viewBox="0 0 420 180" className="w-full max-w-[420px] h-44 select-none">
              {/* Principal Axis */}
              <line x1="20" y1="90" x2="380" y2="90" stroke="#64748b" strokeWidth="1.5" />
              {/* Concave Mirror Arc */}
              <path
                d="M 340 30 Q 360 90 340 150"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="4"
              />
              {/* Pole P, Focus F, Center C */}
              <circle cx="348" cy="90" r="3" fill="#cbd5e1" />
              <text x="352" y="104" fill="#94a3b8" fontSize="10">P</text>

              <circle cx="270" cy="90" r="3" fill="#38bdf8" />
              <text x="268" y="104" fill="#38bdf8" fontSize="10" fontWeight="bold">F</text>

              <circle cx="190" cy="90" r="3" fill="#a78bfa" />
              <text x="188" y="104" fill="#a78bfa" fontSize="10" fontWeight="bold">C</text>

              {/* Object Arrow (Green) */}
              <g transform={`translate(${Math.max(40, Math.min(320, 348 + opticsData.u * 5))}, 90)`}>
                <line x1="0" y1="0" x2="0" y2="-45" stroke="#10b981" strokeWidth="3" />
                <polygon points="-4,-45 4,-45 0,-52" fill="#10b981" />
                <text x="-4" y="-56" fill="#10b981" fontSize="9" fontWeight="bold">Obj</text>
              </g>

              {/* Image Arrow (Red inverted or upright) */}
              {isFinite(opticsData.v) && (
                <g transform={`translate(${Math.max(30, Math.min(370, 348 + opticsData.v * 5))}, 90)`}>
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={-opticsData.imgHeight * 1.5}
                    stroke="#ef4444"
                    strokeWidth="3"
                  />
                  <polygon
                    points={`-4,${-opticsData.imgHeight * 1.5} 4,${-opticsData.imgHeight * 1.5} 0,${-opticsData.imgHeight * 1.5 + (opticsData.imgHeight > 0 ? -6 : 6)}`}
                    fill="#ef4444"
                  />
                  <text
                    x="-6"
                    y={-opticsData.imgHeight * 1.5 + (opticsData.imgHeight > 0 ? -8 : 14)}
                    fill="#ef4444"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    Img
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Object Distance ($u$): {opticsU} cm</span>
              <span className="text-emerald-700 font-bold">
                Image ($v$): {isFinite(opticsData.v) ? `${opticsData.v.toFixed(1)} cm` : 'At $\\infty$'} · Nature:{' '}
                {opticsData.v < 0 ? 'Real & Inverted' : 'Virtual & Erect'}
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="-5"
              value={opticsU}
              onChange={(e) => setOpticsU(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
