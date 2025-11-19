/**
 * Exercise Card Component
 * Displays individual exercise in grid format
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Exercise } from '@/lib/breaks/exercise-library';
import { Heart, Play, Clock, TrendingUp } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
  onFavorite: (exerciseId: string) => void;
  isFavorite: boolean;
  highlighted?: boolean;
}

export function ExerciseCard({
  exercise,
  onStart,
  onFavorite,
  isFavorite,
  highlighted = false,
}: ExerciseCardProps) {
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      neck: '🦴',
      shoulder: '💪',
      back: '🧘',
      chest: '🫁',
      eye: '👁️',
      lower_body: '🦵',
    };
    return icons[category] || '✨';
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 ${
        highlighted
          ? 'bg-white border-2 border-indigo-300 shadow-md'
          : 'bg-white border border-gray-200'
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Icon and Favorite */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl shadow-sm">
            {getCategoryIcon(exercise.category)}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(exercise.id);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </button>
        </div>

        {/* Exercise Name */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {exercise.name}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2">
            {exercise.targetArea}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={`text-xs capitalize ${getDifficultyColor(exercise.difficulty)}`}
          >
            {exercise.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            {exercise.duration}s
          </Badge>
          {exercise.repetitions && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp className="w-3 h-3 mr-1" />
              {exercise.repetitions} reps
            </Badge>
          )}
        </div>

        {/* Category Tag */}
        <div className="text-xs text-gray-500 capitalize">
          {exercise.category} exercise
        </div>

        {/* Start Button */}
        <Button
          onClick={() => onStart(exercise)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-sm group-hover:shadow-md transition-all"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Exercise
        </Button>

        {/* Benefits Preview */}
        {exercise.benefits.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 line-clamp-2">
              ✓ {exercise.benefits[0]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
