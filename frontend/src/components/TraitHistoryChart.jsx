// src/components/TraitHistoryChart.jsx
// A custom responsive SVG line chart to visualize trait progression over time without external libraries.

import { useMemo } from "react";

const TRAIT_THEME = {
  confidence: { color: "#eab308", label: "Conf" },
  empathy:    { color: "#ec4899", label: "Emp" },
  aggression: { color: "#ef4444", label: "Aggr" },
  humor:      { color: "#22c55e", label: "Hum" },
};

export default function TraitHistoryChart({ traitHistory = [] }) {
  // Ensure we have at least one data point.
  // If only 1 point, duplicate it so we can draw a horizontal starting line.
  const dataPoints = useMemo(() => {
    if (!traitHistory || traitHistory.length === 0) return [];
    if (traitHistory.length === 1) {
      return [traitHistory[0], traitHistory[0]];
    }
    return traitHistory;
  }, [traitHistory]);

  const chartWidth = 280;
  const chartHeight = 150;
  const paddingLeft = 28;
  const paddingRight = 10;
  const paddingTop = 12;
  const paddingBottom = 20;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate coordinates for a specific value and turn index
  const getCoordinates = (value, index, totalPoints) => {
    const x = paddingLeft + (index / Math.max(1, totalPoints - 1)) * graphWidth;
    // Invert Y so that 100 is at the top
    const y = paddingTop + graphHeight - (value / 100) * graphHeight;
    return { x, y };
  };

  const lines = useMemo(() => {
    if (dataPoints.length === 0) return [];
    const keys = ["confidence", "empathy", "aggression", "humor"];

    return keys.map((key) => {
      const points = dataPoints.map((snapshot, index) =>
        getCoordinates(snapshot[key] ?? 50, index, dataPoints.length)
      );

      // Create SVG Path string
      const pathD = points.reduce(
        (acc, p, index) => (index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
        ""
      );

      return {
        key,
        pathD,
        points,
        color: TRAIT_THEME[key].color,
        label: TRAIT_THEME[key].label,
      };
    });
  }, [dataPoints, graphWidth, graphHeight]);

  if (traitHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[150px] text-forge-muted text-xs bg-forge-bg/30 rounded-xl border border-forge-border border-dashed">
        No conversation history yet.
      </div>
    );
  }

  // Generate X-axis turn labels
  const totalTurns = traitHistory.length;
  const xLabelsIndices = [];
  if (totalTurns <= 5) {
    for (let i = 0; i < totalTurns; i++) xLabelsIndices.push(i);
  } else {
    // Label start, middle, and end to avoid overlap
    xLabelsIndices.push(0);
    xLabelsIndices.push(Math.floor(totalTurns / 2));
    xLabelsIndices.push(totalTurns - 1);
  }

  return (
    <div className="space-y-2.5">
      {/* Dynamic SVG Canvas */}
      <div className="relative bg-forge-bg/60 border border-forge-border rounded-xl p-2 select-none overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Drop-shadow glow filter for lines */}
          <defs>
            <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 50, 100].map((val) => {
            const y = paddingTop + graphHeight - (val / 100) * graphHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#2A2A3E"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                {/* Y-Axis Label */}
                <text
                  x={paddingLeft - 6}
                  y={y + 3.5}
                  fill="#64748B"
                  fontSize="9.5"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Trait line paths */}
          {lines.map((line) => (
            <g key={line.key}>
              {/* Thick line pathway with glow */}
              <path
                d={line.pathD}
                fill="none"
                stroke={line.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#chart-glow)"
                className="transition-all duration-500 ease-out"
              />
              {/* Highlight circle on final/current data point */}
              {line.points.length > 0 && (
                <circle
                  cx={line.points[line.points.length - 1].x}
                  cy={line.points[line.points.length - 1].y}
                  r="4.5"
                  fill="#0A0A0F"
                  stroke={line.color}
                  strokeWidth="2.2"
                />
              )}
            </g>
          ))}

          {/* X-axis line */}
          <line
            x1={paddingLeft}
            y1={paddingTop + graphHeight}
            x2={chartWidth - paddingRight}
            y2={paddingTop + graphHeight}
            stroke="#2A2A3E"
            strokeWidth="1.5"
          />

          {/* X-Axis labels (turn counters) */}
          {xLabelsIndices.map((idx) => {
            // map indices to actual points
            const pointIdx = traitHistory.length === 1 ? 0 : idx;
            const xCoord = paddingLeft + (pointIdx / Math.max(1, dataPoints.length - 1)) * graphWidth;
            return (
              <text
                key={idx}
                x={xCoord}
                y={chartHeight - 4}
                fill="#64748B"
                fontSize="9"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {idx === 0 ? "Start" : `Turn ${idx}`}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Trait Color Legend */}
      <div className="flex flex-wrap justify-between items-center gap-1.5 px-1 bg-forge-surface/30 p-1.5 rounded-lg border border-forge-border/40">
        {Object.entries(TRAIT_THEME).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5 text-[10px]">
            <span
              className="w-2.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: meta.color }}
            />
            <span className="text-forge-muted font-medium capitalize">
              {meta.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
