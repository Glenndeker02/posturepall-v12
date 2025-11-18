/**
 * Break Routine Component
 * Guides users through exercise routine with step-by-step instructions
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@/lib/breaks/exercise-library';

interface BreakRoutineProps {
  exercises: Exercise[];
  onComplete: (completedExercises: string[], feedback: BreakFeedback) => void;
  onExit: () => void;
}

export interface BreakFeedback {
  rating: 'much_better' | 'better' | 'same' | 'worse' | null;
  intensity: 'gentle' | 'moderate' | 'deep';
  painReported: boolean;
  skippedCount: number;
}

export function BreakRoutine({ exercises, onComplete, onExit }: BreakRoutineProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [skippedExercises, setSkippedExercises] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<'gentle' | 'moderate' | 'deep'>('moderate');
  const [showPainCheck, setShowPainCheck] = useState(false);
  const [painReported, setPainReported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;

  // Initialize timer when exercise starts
  useEffect(() => {
    if (currentExercise) {
      setTimeRemaining(currentExercise.duration);
      setCurrentStep(0);
    }
  }, [currentExerciseIndex, currentExercise]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-advance to next step or exercise
          handleNextStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isPaused, currentStep]);

  // Voice instructions (text-to-speech)
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Announce step change
  useEffect(() => {
    if (currentExercise && currentStep < currentExercise.steps.length) {
      speak(currentExercise.steps[currentStep].instruction);
    }
  }, [currentStep, currentExercise, speak]);

  const handleNextStep = () => {
    if (!currentExercise) return;

    if (currentStep < currentExercise.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setTimeRemaining(Math.floor(currentExercise.duration / currentExercise.steps.length));
    } else {
      handleCompleteExercise();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCompleteExercise = () => {
    setCompletedExercises((prev) => [...prev, currentExercise.id]);

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      // All exercises complete
      handleFinishRoutine();
    }
  };

  const handleSkipExercise = () => {
    setSkippedExercises((prev) => [...prev, currentExercise.id]);

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      handleFinishRoutine();
    }
  };

  const handlePainCheck = (hasPain: boolean) => {
    setPainReported(hasPain);
    setShowPainCheck(false);

    if (hasPain) {
      // Reduce intensity
      if (intensity === 'deep') setIntensity('moderate');
      else if (intensity === 'moderate') setIntensity('gentle');

      // Skip current exercise
      handleSkipExercise();
    }
  };

  const handleFinishRoutine = () => {
    const feedback: BreakFeedback = {
      rating: null,
      intensity,
      painReported,
      skippedCount: skippedExercises.length,
    };
    onComplete(completedExercises, feedback);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  if (!currentExercise) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onExit}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Exit break"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-sm font-medium">
                Exercise {currentExerciseIndex + 1} of {totalExercises}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                }`}
                aria-label="Toggle voice instructions"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  {voiceEnabled ? (
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  )}
                </svg>
              </button>

              {/* Pain check button */}
              <button
                onClick={() => setShowPainCheck(true)}
                className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Feeling pain?
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Exercise header */}
          <div className="mb-8 text-center">
            <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full mb-3">
              {currentExercise.category.toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold mb-2">{currentExercise.name}</h1>
            <p className="text-muted-foreground">{currentExercise.targetArea}</p>
          </div>

          {/* Visual placeholder (would be image/gif in production) */}
          <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900 rounded-2xl p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">🧘</div>
              <p className="text-sm text-muted-foreground">
                {currentExercise.gifUrl ? 'Animation playing...' : 'Exercise demonstration'}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {isPaused ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="text-4xl font-bold tabular-nums">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Current step */}
          <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {currentStep + 1}
              </div>
              <div className="flex-1">
                <p className="text-lg leading-relaxed">
                  {currentExercise.steps[currentStep].instruction}
                </p>
                {currentExercise.steps[currentStep].duration && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Hold for {currentExercise.steps[currentStep].duration} seconds
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* All steps */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">All Steps:</h3>
            <div className="space-y-2">
              {currentExercise.steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : index < currentStep
                      ? 'opacity-50'
                      : 'opacity-70'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <p className="text-sm flex-1">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity adjustment */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <label className="block text-sm font-medium mb-3">Intensity Level:</label>
            <div className="flex gap-2">
              {(['gentle', 'moderate', 'deep'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    intensity === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Adjust based on your comfort level. Stop if you feel pain.
            </p>
          </div>

          {/* Common mistakes */}
          {currentExercise.commonMistakes.length > 0 && (
            <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
                ⚠️ Avoid These Common Mistakes:
              </h3>
              <ul className="space-y-1">
                {currentExercise.commonMistakes.map((mistake, index) => (
                  <li key={index} className="text-sm text-amber-800 dark:text-amber-300">
                    • {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {currentExercise.benefits.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                ✓ Benefits:
              </h3>
              <ul className="space-y-1">
                {currentExercise.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-green-800 dark:text-green-300">
                    • {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="border-t bg-white dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous Step
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSkipExercise}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip Exercise
            </button>

            <button
              onClick={handleNextStep}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {currentStep < currentExercise.steps.length - 1
                ? 'Next Step'
                : currentExerciseIndex < exercises.length - 1
                ? 'Next Exercise'
                : 'Finish Break'}
            </button>
          </div>
        </div>
      </div>

      {/* Pain check modal */}
      {showPainCheck && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Are you experiencing pain?</h3>
            <p className="text-muted-foreground mb-6">
              If you're feeling pain during this exercise, we'll reduce the intensity and skip to the next one.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handlePainCheck(true)}
                className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium rounded-lg transition-colors"
              >
                Yes, I feel pain
              </button>
              <button
                onClick={() => handlePainCheck(false)}
                className="flex-1 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 font-medium rounded-lg transition-colors"
              >
                No, I'm okay
              </button>
            </div>
            <button
              onClick={() => setShowPainCheck(false)}
              className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
