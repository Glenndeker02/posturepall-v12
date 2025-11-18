/**
 * Circular Progress Ring Component
 * Used for dashboard hero score display
 */

'use client';

import React from 'react';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  subtitle?: string;
  animated?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  size = 240,
  strokeWidth = 20,
  showLabel = true,
  label,
  subtitle,
  animated = true,
  className = '',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Color based on value
  const getColor = (val: number): string => {
    if (val >= 80) return '#10b981'; // Green (excellent)
    if (val >= 70) return '#84cc16'; // Yellow-green (good)
    if (val >= 60) return '#f59e0b'; // Yellow (fair)
    if (val >= 50) return '#f97316'; // Orange
    return '#ef4444'; // Red (poor)
  };

  const color = getColor(value);

  // Get status text
  const getStatus = (val: number): string => {
    if (val >= 80) return 'Excellent';
    if (val >= 70) return 'Good';
    if (val >= 60) return 'Fair';
    if (val >= 50) return 'Needs Work';
    return 'Poor';
  };

  const status = getStatus(value);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="dark:stroke-gray-700"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${animated ? 'animate-draw' : ''}`}
          style={{
            transitionProperty: 'stroke-dashoffset',
          }}
        />

        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity={0.3}
          filter="blur(4px)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div
              className="text-6xl font-bold mb-1 transition-colors duration-500"
              style={{ color }}
            >
              {Math.round(value)}%
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {label || status}
            </div>
            {subtitle && (
              <div className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes draw {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${offset};
          }
        }
        .animate-draw {
          animation: draw 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
