/**
 * Pie Chart Component
 * Simple SVG-based pie chart for posture quality distribution
 */

'use client';

import React from 'react';

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  showLabels?: boolean;
  className?: string;
}

export function PieChart({
  data,
  size = 200,
  showLabels = true,
  className = '',
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <p className="text-sm text-muted-foreground">No data</p>
      </div>
    );
  }

  let currentAngle = -90; // Start at top
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  const center = size / 2;
  const radius = (size / 2) - 10;

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, index) => {
          const { startAngle, endAngle, color } = segment;
          const largeArc = endAngle - startAngle > 180 ? 1 : 0;

          const startX = center + radius * Math.cos((startAngle * Math.PI) / 180);
          const startY = center + radius * Math.sin((startAngle * Math.PI) / 180);
          const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
          const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);

          const pathData = [
            `M ${center} ${center}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
            'Z',
          ].join(' ');

          return (
            <path
              key={index}
              d={pathData}
              fill={color}
              stroke="white"
              strokeWidth={2}
              className="transition-opacity hover:opacity-80"
            />
          );
        })}

        {/* Center circle for donut effect */}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.6}
          fill="white"
          className="dark:fill-gray-900"
        />
      </svg>

      {/* Labels */}
      {showLabels && (
        <div className="mt-4 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                />
                <span>{segment.label}</span>
              </div>
              <span className="font-semibold">{segment.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
