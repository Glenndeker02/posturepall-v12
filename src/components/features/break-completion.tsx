/**
 * Break Completion Component
 * Celebration screen with summary and feedback survey
 */

'use client';

import React, { useState, useEffect } from 'react';
import { BreakType } from '@/lib/breaks/break-scheduler';
import { BreakFeedback } from './break-routine';

interface BreakCompletionProps {
  breakType: BreakType;
  exercisesCompleted: number;
  totalExercises: number;
  duration: number; // in minutes
  pointsEarned: number;
  streak?: number;
  onReturnToWork: (feedback: CompleteFeedback) => void;
  onDoAnotherBreak?: () => void;
}

export interface CompleteFeedback {
  rating: 'much_better' | 'better' | 'same' | 'worse';
  energyLevel: number; // 1-5
  willingToDoAgain: boolean;
  comments?: string;
}

const BREAK_TYPE_EMOJI = {
  micro: '⚡',
  standard: '🧘',
  extended: '🌟',
};

const CELEBRATION_MESSAGES = [
  "Way to go! Your posture thanks you! 💪",
  "Break complete! You're building healthy habits! 🎉",
  "Fantastic! Your body is thanking you! ✨",
  "You did it! Keep up the great work! 🌟",
  "Awesome! You're on the path to better posture! 🚀",
];

const RATING_OPTIONS = [
  { value: 'much_better', label: 'Much Better', emoji: '😊', color: 'green' },
  { value: 'better', label: 'Better', emoji: '🙂', color: 'lime' },
  { value: 'same', label: 'Same', emoji: '😐', color: 'gray' },
  { value: 'worse', label: 'Worse', emoji: '😔', color: 'red' },
] as const;

export function BreakCompletion({
  breakType,
  exercisesCompleted,
  totalExercises,
  duration,
  pointsEarned,
  streak,
  onReturnToWork,
  onDoAnotherBreak,
}: BreakCompletionProps) {
  const [showCelebration, setShowCelebration] = useState(true);
  const [rating, setRating] = useState<CompleteFeedback['rating'] | null>(null);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [willingToDoAgain, setWillingToDoAgain] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [celebrationMessage] = useState(
    CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)]
  );

  // Auto-hide celebration after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (!rating || willingToDoAgain === null) {
      alert('Please complete the feedback survey');
      return;
    }

    const feedback: CompleteFeedback = {
      rating,
      energyLevel,
      willingToDoAgain,
      comments: comments.trim() || undefined,
    };

    onReturnToWork(feedback);
  };

  const completionRate = Math.round((exercisesCompleted / totalExercises) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Celebration overlay */}
          {showCelebration && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="text-center animate-scale-in">
                <div className="text-9xl mb-4 animate-bounce-in">🎉</div>
                <h1 className="text-4xl font-bold mb-2">Break Complete!</h1>
                <p className="text-xl text-muted-foreground">{celebrationMessage}</p>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{BREAK_TYPE_EMOJI[breakType]}</div>
              <h2 className="text-3xl font-bold mb-2">Break Complete!</h2>
              <p className="text-muted-foreground">
                {exercisesCompleted} of {totalExercises} exercises completed
              </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {duration}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Minutes</div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  +{pointsEarned}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Points Earned</div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {completionRate}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">Completion</div>
              </div>
            </div>

            {/* Streak badge */}
            {streak && streak > 1 && (
              <div className="mb-8 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🔥</div>
                  <div>
                    <div className="font-bold text-orange-900 dark:text-orange-200">
                      {streak} Day Streak!
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      You're building a consistent habit
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback survey */}
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">How do you feel now?</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RATING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRating(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        rating === option.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.emoji}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy level */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Energy Level: {energyLevel}/5
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setEnergyLevel(level)}
                      className={`flex-1 h-12 rounded-lg transition-all ${
                        level <= energyLevel
                          ? 'bg-gradient-to-t from-yellow-400 to-yellow-300 shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      aria-label={`Energy level ${level}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Willingness to repeat */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Would you do this break again?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setWillingToDoAgain(true)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                      willingToDoAgain === true
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">👍</div>
                    <div className="text-sm font-medium">Yes</div>
                  </button>
                  <button
                    onClick={() => setWillingToDoAgain(false)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                      willingToDoAgain === false
                        ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">👎</div>
                    <div className="text-sm font-medium">No</div>
                  </button>
                </div>
              </div>

              {/* Optional comments */}
              <div>
                <label htmlFor="comments" className="block text-sm font-medium mb-2">
                  Any additional feedback? (optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Let us know how we can improve..."
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                disabled={!rating || willingToDoAgain === null}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Return to Posture Monitoring
              </button>

              {onDoAnotherBreak && (
                <button
                  onClick={onDoAnotherBreak}
                  className="w-full py-3 px-6 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border font-medium rounded-xl transition-colors"
                >
                  Do Another Break
                </button>
              )}
            </div>

            {/* Quick tips */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm">
                <div className="font-semibold mb-1">💡 Quick Tip:</div>
                <p className="text-muted-foreground">
                  Taking regular breaks can reduce musculoskeletal pain by up to 50% and improve
                  focus throughout the day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
