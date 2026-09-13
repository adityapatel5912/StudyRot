import React, { useState, useMemo } from 'react';

/**
 * Pure SVG Graph Renderer
 * Supports line plots, bar charts, and scatter plots without external dependencies
 */
export default function GraphRenderer({ graphSpec }) {
  const [hoverPoint, setHoverPoint] = useState(null);

  if (!graphSpec) return null;

  const width = 500;
  const height = 300;
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const title = graphSpec.title || 'Mathematical Function / Data Graph';
  const xLabel = graphSpec.x_label || 'x';
  const yLabel = graphSpec.y_label || 'y';
  const graphType = graphSpec.type || 'line';

  // Normalize data points
  const series = useMemo(() => {
    if (!graphSpec.series || !Array.isArray(graphSpec.series)) {
      if (graphSpec.data && Array.isArray(graphSpec.data)) {
        return [{ name: 'Data', color: '#059669', data: graphSpec.data }];
      }
      return [];
    }
    const colors = ['#059669', '#2563eb', '#dc2626', '#d97706', '#9333ea'];
    return graphSpec.series.map((s, idx) => ({
      name: s.name || `Series ${idx + 1}`,
      color: s.color || colors[idx % colors.length],
      data: (s.data || []).map((pt) => {
        if (Array.isArray(pt)) return { x: Number(pt[0]), y: Number(pt[1]) };
        return { x: Number(pt.x), y: Number(pt.y) };
      }),
    }));
  }, [graphSpec]);

  // Compute min/max bounds
  const { minX, maxX, minY, maxY } = useMemo(() => {
    let allPoints = [];
    series.forEach((s) => allPoints.push(...s.data));

    if (allPoints.length === 0) {
      return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
    }

    let minX = graphSpec.domain ? graphSpec.domain[0] : Math.min(...allPoints.map((p) => p.x));
    let maxX = graphSpec.domain ? graphSpec.domain[1] : Math.max(...allPoints.map((p) => p.x));
    let minY = graphSpec.range ? graphSpec.range[0] : Math.min(...allPoints.map((p) => p.y));
    let maxY = graphSpec.range ? graphSpec.range[1] : Math.max(...allPoints.map((p) => p.y));

    if (minX === maxX) {
      minX -= 1;
      maxX += 1;
    }
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    // Add 5% headroom
    const yBuffer = (maxY - minY) * 0.05 || 1;
    minY = Math.min(minY, 0); // Ground to 0 if close
    maxY += yBuffer;

    return { minX, maxX, minY, maxY };
  }, [series, graphSpec.domain, graphSpec.range]);

  // Coordinate scales
  const scaleX = (x) => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
  const scaleY = (y) => padding.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

  // Generate tick marks
  const xTicks = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }, (_, i) => {
      const val = minX + (i / (count - 1)) * (maxX - minX);
      return { val: Number(val.toFixed(1)), px: scaleX(val) };
    });
  }, [minX, maxX, plotWidth, padding.left]);

  const yTicks = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }, (_, i) => {
      const val = minY + (i / (count - 1)) * (maxY - minY);
      return { val: Number(val.toFixed(1)), py: scaleY(val) };
    });
  }, [minY, maxY, plotHeight, padding.top]);

  return (
    <div className="my-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm w-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
        {/* Legend */}
        {series.length > 1 && (
          <div className="flex items-center gap-3 text-xs">
            {series.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 text-[11px] font-medium">{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[500px] h-auto select-none"
        >
          {/* Background grid */}
          {yTicks.map((tick, i) => (
            <line
              key={`y-grid-${i}`}
              x1={padding.left}
              y1={tick.py}
              x2={width - padding.right}
              y2={tick.py}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          ))}
          {xTicks.map((tick, i) => (
            <line
              key={`x-grid-${i}`}
              x1={tick.px}
              y1={padding.top}
              x2={tick.px}
              y2={height - padding.bottom}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          ))}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#475569"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* X Tick Labels */}
          {xTicks.map((tick, i) => (
            <g key={`x-tick-${i}`}>
              <line
                x1={tick.px}
                y1={height - padding.bottom}
                x2={tick.px}
                y2={height - padding.bottom + 5}
                stroke="#475569"
              />
              <text
                x={tick.px}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                fontWeight="500"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Y Tick Labels */}
          {yTicks.map((tick, i) => (
            <g key={`y-tick-${i}`}>
              <line
                x1={padding.left - 5}
                y1={tick.py}
                x2={padding.left}
                y2={tick.py}
                stroke="#475569"
              />
              <text
                x={padding.left - 8}
                y={tick.py + 3}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
                fontWeight="500"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Axis Labels */}
          <text
            x={padding.left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#334155"
            fontWeight="bold"
          >
            {xLabel}
          </text>
          <text
            x={15}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${padding.top + plotHeight / 2})`}
            fontSize="11"
            fill="#334155"
            fontWeight="bold"
          >
            {yLabel}
          </text>

          {/* Render Series Data */}
          {series.map((s, sIdx) => {
            if (s.data.length === 0) return null;

            if (graphType === 'bar') {
              const barWidth = (plotWidth / s.data.length) * 0.6;
              return s.data.map((pt, ptIdx) => {
                const px = scaleX(pt.x) - barWidth / 2;
                const py = scaleY(pt.y);
                const barH = scaleY(0) - py;
                return (
                  <rect
                    key={`bar-${sIdx}-${ptIdx}`}
                    x={px}
                    y={py}
                    width={barWidth}
                    height={Math.max(0, barH)}
                    fill={s.color}
                    rx="3"
                    className="hover:opacity-80 transition cursor-pointer"
                    onMouseEnter={() => setHoverPoint({ x: pt.x, y: pt.y, px: px + barWidth / 2, py })}
                    onMouseLeave={() => setHoverPoint(null)}
                  />
                );
              });
            }

            if (graphType === 'scatter') {
              return s.data.map((pt, ptIdx) => {
                const px = scaleX(pt.x);
                const py = scaleY(pt.y);
                return (
                  <circle
                    key={`dot-${sIdx}-${ptIdx}`}
                    cx={px}
                    cy={py}
                    r="4.5"
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="hover:r-6 transition cursor-pointer"
                    onMouseEnter={() => setHoverPoint({ x: pt.x, y: pt.y, px, py })}
                    onMouseLeave={() => setHoverPoint(null)}
                  />
                );
              });
            }

            // Default: Line chart
            const pathPoints = s.data
              .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.x).toFixed(1)} ${scaleY(pt.y).toFixed(1)}`)
              .join(' ');

            return (
              <g key={`line-${sIdx}`}>
                <path
                  d={pathPoints}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {s.data.map((pt, ptIdx) => {
                  const px = scaleX(pt.x);
                  const py = scaleY(pt.y);
                  return (
                    <circle
                      key={`pt-${sIdx}-${ptIdx}`}
                      cx={px}
                      cy={py}
                      r="3.5"
                      fill={s.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="cursor-pointer hover:scale-150 transition"
                      onMouseEnter={() => setHoverPoint({ x: pt.x, y: pt.y, px, py })}
                      onMouseLeave={() => setHoverPoint(null)}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Hover Tooltip */}
          {hoverPoint && (
            <g transform={`translate(${hoverPoint.px}, ${hoverPoint.py - 12})`}>
              <rect
                x="-36"
                y="-22"
                width="72"
                height="20"
                rx="4"
                fill="#0f172a"
                className="opacity-90"
              />
              <text
                x="0"
                y="-8"
                textAnchor="middle"
                fontSize="10"
                fill="#ffffff"
                fontWeight="bold"
              >
                ({hoverPoint.x}, {hoverPoint.y})
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
