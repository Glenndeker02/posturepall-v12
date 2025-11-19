/**
 * Break Reminder Component
 * Shows 2-minute warning and full break overlay
 */

'use client';

import React, { useState } from 'react';
import { BreakType } from '@/lib/breaks/break-scheduler';

interface BreakReminderProps {
  type: BreakType;
  mode: 'warning' | 'break';
  minutesUntil?: number;
  onStartBreak: () => void;
  onSnooze: () => void;
  onSkip: () => void;
  onDismiss?: () => void;
  maxSnoozesReached?: boolean;
}

const BREAK_TYPE_INFO = {
  micro: {
    title: 'Micro Break',
    duration: '2-3 minutes',
    description: 'Quick relief for your posture',
    emoji: '⚡',
  },
  standard: {
    title: 'Standard Break',
    duration: '5-7 minutes',
    description: 'Comprehensive posture reset',
    emoji: '🧘',
  },
  extended: {
    title: 'Extended Break',
    duration: '10-15 minutes',
    description: 'Physical and mental recharge',
    emoji: '🌟',
  },
};

export function BreakReminder({
  type,
  mode,
  minutesUntil,
  onStartBreak,
  onSnooze,
  onSkip,
  onDismiss,
  maxSnoozesReached = false,
}: BreakReminderProps) {
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const breakInfo = BREAK_TYPE_INFO[type];

  // 2-Minute Warning Banner
  if (mode === 'warning') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{breakInfo.emoji}</div>
              <div>
                <div className="font-semibold text-sm">
                  {breakInfo.title} coming up in {minutesUntil} minute{minutesUntil !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-blue-100">
                  Finish up your current task. Break duration: {breakInfo.duration}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!maxSnoozesReached && (
                <button
                  onClick={onSnooze}
                  className="px-4 py-1.5 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Snooze 5 min
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full-Screen Break Overlay
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Pulsing background circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-blue-300 dark:bg-blue-700 rounded-full opacity-30 animate-pulse delay-75" />
            </div>

            {/* Main emoji */}
            <div className="relative z-10 text-9xl animate-bounce-slow">
              {breakInfo.emoji}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Time for a Posture Pal Break!
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Your body will thank you
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full border">
              {breakInfo.title}
            </span>
            <span>•</span>
            <span>{breakInfo.duration}</span>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl mx-auto">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-2xl mb-2">💪</div>
            <div className="text-xs font-medium">Prevent Strain</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-xs font-medium">Boost Focus</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-xs font-medium">Restore Energy</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onStartBreak}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Break Now
          </button>

          <div className="flex gap-3">
            {!maxSnoozesReached && (
              <button
                onClick={onSnooze}
                className="flex-1 py-3 px-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 font-medium rounded-xl transition-colors"
              >
                Snooze 5 Minutes
              </button>
            )}

            {!showSkipConfirm ? (
              <button
                onClick={() => setShowSkipConfirm(true)}
                className="flex-1 py-3 px-6 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Skip this break
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <button
                  onClick={onSkip}
                  className="flex-1 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium rounded-xl transition-colors text-sm"
                >
                  Confirm Skip
                </button>
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Warning for max snoozes */}
        {maxSnoozesReached && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>You've already snoozed twice. Time to take care of your posture!</span>
            </div>
          </div>
        )}

        {/* Pro tip */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 Regular breaks improve productivity and reduce pain by up to 50%</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-75 {
          animation-delay: 0.75s;
        }
      `}</style>
    </div>
  );
}
