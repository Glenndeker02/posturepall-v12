/**
 * Gauge Chart Component
 * Speedometer-style gauge for metrics like correction speed
 */

'use client';

import React from 'react';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  target?: number;
  size?: number;
  className?: string;
}

export function GaugeChart({
  value,
  max,
  label,
  unit = '',
  target,
  size = 200,
  className = '',
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180; // 180 degrees for semicircle

  const center = size / 2;
  const radius = (size / 2) - 20;
  const strokeWidth = 20;

  // Calculate arc path
  const startAngle = -180;
  const endAngle = startAngle + angle;

  const startX = center + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = center + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);

  const largeArc = angle > 180 ? 1 : 0;

  const pathData = [
    `M ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
  ].join(' ');

  // Determine color based on value
  const getColor = () => {
    if (target) {
      if (value <= target) return '#10b981'; // Green - good
      if (value <= target * 1.5) return '#f59e0b'; // Orange - fair
      return '#ef4444'; // Red - poor
    }
    // Default color gradient
    if (percentage <= 33) return '#10b981';
    if (percentage <= 66) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor();

  // Calculate needle position
  const needleAngle = startAngle + angle;
  const needleLength = radius - 10;
  const needleX = center + needleLength * Math.cos((needleAngle * Math.PI) / 180);
  const needleY = center + needleLength * Math.sin((needleAngle * Math.PI) / 180);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Background arc */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${
            center + radius * Math.cos(0)
          } ${center}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="dark:stroke-gray-700"
        />

        {/* Value arc */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={needleX}
          y2={needleY}
          stroke="#374151"
          strokeWidth={3}
          strokeLinecap="round"
          className="dark:stroke-gray-400"
        />

        {/* Center dot */}
        <circle cx={center} cy={center} r={6} fill="#374151" className="dark:fill-gray-400" />

        {/* Target marker if provided */}
        {target && (
          <g>
            {(() => {
              const targetPercentage = (target / max) * 100;
              const targetAngle = startAngle + (targetPercentage / 100) * 180;
              const markerX = center + (radius + 5) * Math.cos((targetAngle * Math.PI) / 180);
              const markerY = center + (radius + 5) * Math.sin((targetAngle * Math.PI) / 180);

              return (
                <>
                  <circle cx={markerX} cy={markerY} r={4} fill="#3b82f6" />
                  <text
                    x={markerX}
                    y={markerY - 15}
                    textAnchor="middle"
                    className="text-xs fill-blue-600 font-medium"
                  >
                    Target
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Value display */}
      <div className="mt-2 text-center">
        <div className="text-3xl font-bold" style={{ color }}>
          {value}
          <span className="text-lg text-muted-foreground ml-1">{unit}</span>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
        {target && (
          <div className="text-xs text-muted-foreground mt-1">
            Target: &lt;{target}
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}
