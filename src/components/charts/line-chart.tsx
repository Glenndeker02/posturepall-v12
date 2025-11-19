/**
 * Line Chart Component
 * Shows posture quality over time with color-coded zones
 */

'use client';

import React from 'react';

export interface LineChartData {
  timestamp: number;
  score: number;
}

interface LineChartProps {
  data: LineChartData[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showZones?: boolean;
  className?: string;
}

export function LineChart({
  data,
  width = 600,
  height = 200,
  showGrid = true,
  showZones = true,
  className = '',
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minScore = 0;
  const maxScore = 100;
  const minTime = data[0].timestamp;
  const maxTime = data[data.length - 1].timestamp;

  // Scale functions
  const scaleX = (timestamp: number) => {
    return ((timestamp - minTime) / (maxTime - minTime)) * chartWidth;
  };

  const scaleY = (score: number) => {
    return chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;
  };

  // Generate line path
  const linePath = data
    .map((point, index) => {
      const x = scaleX(point.timestamp);
      const y = scaleY(point.score);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate area path (for gradient fill)
  const areaPath = `${linePath} L ${scaleX(maxTime)} ${chartHeight} L 0 ${chartHeight} Z`;

  // Generate time labels (every 15 minutes)
  const duration = (maxTime - minTime) / 1000 / 60; // in minutes
  const timeLabels: { x: number; label: string }[] = [];
  const interval = duration > 60 ? 30 : 15; // 30min for long sessions, 15min for short

  for (let i = 0; i <= Math.ceil(duration / interval); i++) {
    const minutes = i * interval;
    const timestamp = minTime + minutes * 60 * 1000;
    timeLabels.push({
      x: scaleX(timestamp),
      label: minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`,
    });
  }

  // Color zones
  const zones = [
    { min: 85, max: 100, color: '#10b981', label: 'Excellent' }, // Green
    { min: 60, max: 85, color: '#84cc16', label: 'Good' }, // Lime
    { min: 40, max: 60, color: '#f59e0b', label: 'Fair' }, // Orange
    { min: 0, max: 40, color: '#ef4444', label: 'Poor' }, // Red
  ];

  return (
    <div className={`${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Background zones */}
          {showZones &&
            zones.map((zone, index) => (
              <rect
                key={index}
                x={0}
                y={scaleY(zone.max)}
                width={chartWidth}
                height={scaleY(zone.min) - scaleY(zone.max)}
                fill={zone.color}
                opacity={0.1}
              />
            ))}

          {/* Grid lines */}
          {showGrid && (
            <>
              {/* Horizontal grid */}
              {[0, 25, 50, 75, 100].map((score) => (
                <line
                  key={score}
                  x1={0}
                  y1={scaleY(score)}
                  x2={chartWidth}
                  y2={scaleY(score)}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  className="dark:stroke-gray-700"
                />
              ))}

              {/* Vertical grid */}
              {timeLabels.map((label, index) => (
                <line
                  key={index}
                  x1={label.x}
                  y1={0}
                  x2={label.x}
                  y2={chartHeight}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  className="dark:stroke-gray-700"
                />
              ))}
            </>
          )}

          {/* Area fill with gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data
            .filter((_, index) => index % Math.ceil(data.length / 50) === 0) // Sample points
            .map((point, index) => (
              <circle
                key={index}
                cx={scaleX(point.timestamp)}
                cy={scaleY(point.score)}
                r={3}
                fill="#3b82f6"
                stroke="white"
                strokeWidth={2}
              />
            ))}

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((score) => (
            <text
              key={score}
              x={-10}
              y={scaleY(score)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {score}
            </text>
          ))}

          {/* X-axis labels */}
          {timeLabels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {label.label}
            </text>
          ))}

          {/* Y-axis title */}
          <text
            x={-chartHeight / 2}
            y={-35}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400 font-medium"
          >
            Posture Score
          </text>

          {/* X-axis title */}
          <text
            x={chartWidth / 2}
            y={chartHeight + 35}
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400 font-medium"
          >
            Session Time
          </text>
        </g>
      </svg>

      {/* Zone legend */}
      {showZones && (
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          {zones.map((zone) => (
            <div key={zone.label} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: zone.color, opacity: 0.6 }}
              />
              <span className="text-muted-foreground">{zone.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
