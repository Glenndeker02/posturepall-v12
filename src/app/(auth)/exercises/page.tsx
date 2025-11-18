/**
 * Exercises Page
 * Shows users how to conduct simple exercises based on posture detection issues
 * Users are routed here from dashboard based on current posture problems
 */

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { ExercisePlayer } from '@/components/exercises/exercise-player';
import { ExerciseCard } from '@/components/exercises/exercise-card';
import {
  EXERCISE_LIBRARY,
  getExercisesByCategory,
  type Exercise,
  type ExerciseCategory,
} from '@/lib/breaks/exercise-library';
import {
  Play,
  Clock,
  Target,
  Zap,
  Heart,
  Eye,
  Timer,
  Activity,
  User,
  Home,
  Dumbbell,
  Settings,
  LogOut,
  Search,
  Sparkles,
  Filter,
  TrendingUp,
} from 'lucide-react';

function ExercisesContent() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [difficulty, setDifficulty] = useState<'all' | 'gentle' | 'moderate' | 'deep'>('all');
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemArea = searchParams.get('area'); // For routing from dashboard

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('exercise_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (exerciseId: string) => {
    const newFavorites = favorites.includes(exerciseId)
      ? favorites.filter(id => id !== exerciseId)
      : [...favorites, exerciseId];

    setFavorites(newFavorites);
    localStorage.setItem('exercise_favorites', JSON.stringify(newFavorites));
  };

  // Filter exercises based on search, category, and difficulty
  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_LIBRARY;

    // Filter by category
    if (selectedCategory !== 'all') {
      exercises = getExercisesByCategory(selectedCategory);
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
      exercises = exercises.filter(ex => ex.difficulty === difficulty);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.description.toLowerCase().includes(query) ||
        ex.targetArea.toLowerCase().includes(query)
      );
    }

    // If routed from dashboard with problem area, filter by that
    if (problemArea && !searchQuery) {
      exercises = exercises.filter(ex =>
        ex.targetArea.toLowerCase().includes(problemArea.toLowerCase()) ||
        ex.category.toLowerCase().includes(problemArea.toLowerCase())
      );
    }

    return exercises;
  }, [selectedCategory, difficulty, searchQuery, problemArea]);

  const favoriteExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter(ex => favorites.includes(ex.id));
  }, [favorites]);

  const recommendedExercises = useMemo(() => {
    // If routed from dashboard, show exercises for that problem area
    if (problemArea) {
      return EXERCISE_LIBRARY.filter(ex =>
        ex.targetArea.toLowerCase().includes(problemArea.toLowerCase()) ||
        ex.category.toLowerCase().includes(problemArea.toLowerCase())
      ).slice(0, 6);
    }

    // Otherwise show beginner-friendly exercises
    return EXERCISE_LIBRARY.filter(ex => ex.difficulty === 'gentle').slice(0, 6);
  }, [problemArea]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {
      all: EXERCISE_LIBRARY.length,
    };

    ['neck', 'shoulder', 'back', 'chest', 'eye'].forEach(cat => {
      stats[cat] = getExercisesByCategory(cat as ExerciseCategory).length;
    });

    return stats;
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userSession');
    router.push('/');
  };

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const closeExercise = () => {
    setSelectedExercise(null);
  };

  // Show Exercise Player if an exercise is selected
  if (selectedExercise) {
    return (
      <ExercisePlayer
        exercise={selectedExercise}
        onClose={closeExercise}
        onFavorite={() => toggleFavorite(selectedExercise.id)}
        isFavorite={favorites.includes(selectedExercise.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30">
      {/* Dashboard Navigation */}
      <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" />
              <div className="ml-10 flex items-baseline space-x-4">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" asChild>
                  <a href="/dashboard">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" asChild>
                  <a href="/insights">
                    <Activity className="w-4 h-4 mr-2" />
                    Insights
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Exercises
                </Button>
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" asChild>
                  <a href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <span className="text-white dark:text-black text-sm font-medium">S</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="dark:text-gray-400 dark:hover:text-gray-100">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Exercise Library</h1>
          {problemArea ? (
            <p className="text-gray-600 dark:text-gray-400">
              Recommended exercises for your {problemArea} issues
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Guided stretches and exercises to improve your posture and well-being
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="bg-white dark:bg-gray-900 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex gap-2">
                <Button
                  variant={difficulty === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty('all')}
                  className="rounded-xl"
                >
                  All Levels
                </Button>
                <Button
                  variant={difficulty === 'gentle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty('gentle')}
                  className="rounded-xl"
                >
                  Gentle
                </Button>
                <Button
                  variant={difficulty === 'moderate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty('moderate')}
                  className="rounded-xl"
                >
                  Moderate
                </Button>
                <Button
                  variant={difficulty === 'deep' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDifficulty('deep')}
                  className="rounded-xl"
                >
                  Deep
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorites Section */}
        {favoriteExercises.length > 0 && (
          <Card className="bg-white dark:bg-gray-900 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                Your Favorites
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Quick access to your saved exercises</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favoriteExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onStart={startExercise}
                    onFavorite={toggleFavorite}
                    isFavorite={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Section */}
        {recommendedExercises.length > 0 && !searchQuery && (
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-200 dark:border-indigo-900 shadow-md mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                {problemArea ? `Recommended for ${problemArea}` : 'Recommended For You'}
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                {problemArea
                  ? 'These exercises target your specific problem areas'
                  : 'Gentle exercises perfect for beginners'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onStart={startExercise}
                    onFavorite={toggleFavorite}
                    isFavorite={favorites.includes(exercise.id)}
                    highlighted
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Library by Category */}
        <Card className="bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
              Exercise Library
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Browse by body area or difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="all" className="text-xs md:text-sm">
                  All ({categoryStats.all})
                </TabsTrigger>
                <TabsTrigger value="neck" className="text-xs md:text-sm">
                  Neck ({categoryStats.neck})
                </TabsTrigger>
                <TabsTrigger value="shoulder" className="text-xs md:text-sm">
                  Shoulders ({categoryStats.shoulder})
                </TabsTrigger>
                <TabsTrigger value="back" className="text-xs md:text-sm">
                  Back ({categoryStats.back})
                </TabsTrigger>
                <TabsTrigger value="chest" className="text-xs md:text-sm">
                  Chest ({categoryStats.chest})
                </TabsTrigger>
                <TabsTrigger value="eye" className="text-xs md:text-sm">
                  Eyes ({categoryStats.eye})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-0">
                {filteredExercises.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredExercises.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onStart={startExercise}
                        onFavorite={toggleFavorite}
                        isFavorite={favorites.includes(exercise.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Filter className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      No exercises found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const hasToken = localStorage.getItem('authToken') || sessionStorage.getItem('userSession');

    if (!hasToken) {
      router.push('/auth');
      return;
    }

    setIsAuthenticated(true);
  }, [router]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading exercises...</p>
        </div>
      </div>
    }>
      <ExercisesContent />
    </Suspense>
  );
}
