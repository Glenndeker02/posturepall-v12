/**
 * Body Heatmap Component
 * Visual body diagram showing problem areas with color intensity
 */

'use client';

import React from 'react';

export interface BodyProblemAreas {
  neck: number;
  upperBack: number;
  shoulders: number;
  lowerBack: number;
  head: number;
}

interface BodyHeatmapProps {
  problemAreas: BodyProblemAreas;
  maxValue?: number;
  className?: string;
}

export function BodyHeatmap({ problemAreas, maxValue, className = '' }: BodyHeatmapProps) {
  const max = maxValue || Math.max(...Object.values(problemAreas));

  const getIntensity = (value: number): number => {
    if (max === 0) return 0;
    return (value / max) * 100;
  };

  const getColor = (intensity: number): string => {
    if (intensity === 0) return '#e5e7eb'; // gray
    if (intensity < 33) return '#fbbf24'; // yellow
    if (intensity < 66) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getLabel = (intensity: number): string => {
    if (intensity === 0) return 'No issues';
    if (intensity < 33) return 'Minor';
    if (intensity < 66) return 'Moderate';
    return 'Frequent';
  };

  const areas = [
    { name: 'Head', key: 'head' as keyof BodyProblemAreas },
    { name: 'Neck', key: 'neck' as keyof BodyProblemAreas },
    { name: 'Shoulders', key: 'shoulders' as keyof BodyProblemAreas },
    { name: 'Upper Back', key: 'upperBack' as keyof BodyProblemAreas },
    { name: 'Lower Back', key: 'lowerBack' as keyof BodyProblemAreas },
  ];

  return (
    <div className={`flex gap-8 ${className}`}>
      {/* Body diagram */}
      <div className="flex-1">
        <svg viewBox="0 0 200 300" className="w-full max-w-[200px] mx-auto">
          {/* Head */}
          <ellipse
            cx="100"
            cy="40"
            rx="30"
            ry="35"
            fill={getColor(getIntensity(problemAreas.head))}
            stroke="#374151"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Neck */}
          <rect
            x="85"
            y="70"
            width="30"
            height="25"
            fill={getColor(getIntensity(problemAreas.neck))}
            stroke="#374151"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Shoulders */}
          <ellipse
            cx="100"
            cy="110"
            rx="60"
            ry="20"
            fill={getColor(getIntensity(problemAreas.shoulders))}
            stroke="#374151"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Upper back / torso */}
          <rect
            x="70"
            y="120"
            width="60"
            height="70"
            rx="10"
            fill={getColor(getIntensity(problemAreas.upperBack))}
            stroke="#374151"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Lower back / pelvis */}
          <rect
            x="75"
            y="185"
            width="50"
            height="50"
            rx="10"
            fill={getColor(getIntensity(problemAreas.lowerBack))}
            stroke="#374151"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Arms (simple lines) */}
          <line x1="40" y1="120" x2="40" y2="200" stroke="#9ca3af" strokeWidth="8" />
          <line x1="160" y1="120" x2="160" y2="200" stroke="#9ca3af" strokeWidth="8" />
        </svg>
      </div>

      {/* Legend and details */}
      <div className="flex-1 space-y-3">
        <div className="text-sm font-medium text-muted-foreground mb-4">Problem Areas</div>
        {areas.map(({ name, key }) => {
          const value = problemAreas[key];
          const intensity = getIntensity(value);
          const color = getColor(intensity);
          const label = getLabel(intensity);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${intensity}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Color legend */}
        <div className="pt-4 border-t mt-4">
          <div className="text-xs text-muted-foreground mb-2">Intensity</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e5e7eb' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>None</span>
            <span>Frequent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
