/**
 * Exercise Player Component
 * Full-screen guided exercise experience with step-by-step instructions
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Exercise } from '@/lib/breaks/exercise-library';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

interface ExercisePlayerProps {
  exercise: Exercise;
  onClose: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}

export function ExercisePlayer({
  exercise,
  onClose,
  onFavorite,
  isFavorite,
}: ExercisePlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = exercise.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying || isComplete) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev >= exercise.duration) {
          setIsPlaying(false);
          setIsComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isComplete, exercise.duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setTimer(0);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'gentle':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'deep':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-50 overflow-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </Button>
              <Badge
                variant="outline"
                className={`capitalize ${getDifficultyColor(exercise.difficulty)}`}
              >
                {exercise.difficulty}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className="rounded-xl"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </Button>
          </div>

          {/* Main Exercise Card */}
          <Card className="bg-white shadow-xl mb-6">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{exercise.name}</CardTitle>
                  <p className="text-gray-600">{exercise.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {exercise.duration}s total
                </div>
                {exercise.repetitions && (
                  <div className="text-sm text-gray-600">
                    {exercise.repetitions} repetitions
                  </div>
                )}
                <div className="text-sm text-gray-600 capitalize">
                  {exercise.category} exercise
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {!isComplete ? (
                <>
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Step {currentStep + 1} of {totalSteps}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatTime(timer)} / {formatTime(exercise.duration)}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Current Step */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {exercise.steps[currentStep].stepNumber}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-indigo-900 mb-3">
                          {exercise.steps[currentStep].instruction}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handlePreviousStep}
                      disabled={currentStep === 0}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="w-32 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Start
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleNextStep}
                      disabled={currentStep === totalSteps - 1}
                      className="rounded-xl"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleReset}
                      className="rounded-xl"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* All Steps Overview */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      All Steps:
                    </h4>
                    {exercise.steps.map((step, index) => (
                      <div
                        key={step.stepNumber}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                          index === currentStep
                            ? 'bg-indigo-100 border-2 border-indigo-300'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            index === currentStep
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          {step.stepNumber}
                        </div>
                        <p
                          className={`text-sm pt-1 ${
                            index === currentStep
                              ? 'text-indigo-900 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {step.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Completion Screen */
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Exercise Complete!
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Great job completing {exercise.name}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="rounded-xl"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Do Again
                    </Button>
                    <Button
                      onClick={onClose}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits & Tips */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Benefits */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-green-600" />
                  Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {exercise.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Common Mistakes */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Avoid These Mistakes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {exercise.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <X className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      {mistake}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Target Area Info */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Target Area</h4>
                  <p className="text-blue-800 text-sm">{exercise.targetArea}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
