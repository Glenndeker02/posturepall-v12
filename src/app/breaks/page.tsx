'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Hand, 
  Heart,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX
} from 'lucide-react'

interface Exercise {
  id: string
  name: string
  category: string
  description: string
  instructions: string[]
  duration: number
  difficulty: 'gentle' | 'moderate' | 'deep'
  targetArea: string
}

const exercises: Exercise[] = [
  {
    id: '1',
    name: 'Neck Rolls',
    category: 'neck',
    description: 'Releases tension in neck and upper shoulders',
    instructions: [
      'Sit or stand up straight',
      'Gently tilt your head to the right, bringing ear toward shoulder',
      'Hold for 5 seconds',
      'Return to center and repeat on left side',
      'Complete 3-5 repetitions on each side'
    ],
    duration: 60,
    difficulty: 'gentle',
    targetArea: 'Neck & Upper Shoulders'
  },
  {
    id: '2',
    name: 'Shoulder Blade Squeeze',
    category: 'shoulder',
    description: 'Strengthens upper back and improves shoulder posture',
    instructions: [
      'Sit tall with shoulders relaxed',
      'Squeeze shoulder blades together',
      'Hold for 5 seconds',
      'Release and repeat',
      'Complete 10 repetitions'
    ],
    duration: 45,
    difficulty: 'moderate',
    targetArea: 'Upper Back & Shoulders'
  },
  {
    id: '3',
    name: 'Seated Cat-Cow',
    category: 'back',
    description: 'Improves spinal mobility and relieves back tension',
    instructions: [
      'Sit on edge of chair with feet flat',
      'Place hands on knees',
      'Inhale and arch back, look up (Cow)',
      'Exhale and round spine, tuck chin (Cat)',
      'Continue for 8-10 breaths'
    ],
    duration: 90,
    difficulty: 'gentle',
    targetArea: 'Entire Spine'
  },
  {
    id: '4',
    name: '20-20-20 Eye Rest',
    category: 'eye',
    description: 'Reduces eye strain from screen time',
    instructions: [
      'Look away from screen',
      'Focus on object 20 feet away',
      'Maintain focus for 20 seconds',
      'Blink gently several times',
      'Repeat 3-4 times'
    ],
    duration: 80,
    difficulty: 'gentle',
    targetArea: 'Eye Muscles'
  },
  {
    id: '5',
    name: 'Chest Opener',
    category: 'chest',
    description: 'Counteracts forward shoulder posture',
    instructions: [
      'Clasp hands behind back',
      'Straighten arms and pull shoulders back',
      'Lift chest and look slightly upward',
      'Hold for 15-20 seconds',
      'Release and repeat 2-3 times'
    ],
    duration: 60,
    difficulty: 'moderate',
    targetArea: 'Chest & Shoulders'
  },
  {
    id: '6',
    name: 'Wrist Rotations',
    category: 'wrist',
    description: 'Prevents carpal tunnel and wrist strain',
    instructions: [
      'Extend arms in front at shoulder height',
      'Make fists with both hands',
      'Rotate wrists clockwise 10 times',
      'Rotate wrists counter-clockwise 10 times',
      'Shake hands gently to finish'
    ],
    duration: 40,
    difficulty: 'gentle',
    targetArea: 'Wrists & Forearms'
  }
]

export default function BreaksAndStretches() {
  const [activeBreak, setActiveBreak] = useState<string | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<string[]>([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [breakType, setBreakType] = useState<'micro' | 'standard' | 'extended'>('standard')

  const currentExercise = exercises[currentExerciseIndex]
  
  const getBreakExercises = (type: string) => {
    switch (type) {
      case 'micro':
        return exercises.slice(0, 2) // 2 exercises, ~2 minutes
      case 'standard':
        return exercises.slice(0, 4) // 4 exercises, ~5 minutes
      case 'extended':
        return exercises // All exercises, ~8 minutes
      default:
        return exercises.slice(0, 4)
    }
  }

  const breakExercises = getBreakExercises(breakType)

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && isPlaying) {
      handleExerciseComplete()
    }
  }, [isPlaying, timeRemaining])

  const startBreak = (type: 'micro' | 'standard' | 'extended') => {
    setBreakType(type)
    setActiveBreak(type)
    setCurrentExerciseIndex(0)
    const firstExercise = getBreakExercises(type)[0]
    setTimeRemaining(firstExercise.duration)
    setIsPlaying(true)
    setCompletedExercises([])
  }

  const handleExerciseComplete = () => {
    const exerciseId = currentExercise.id
    setCompletedExercises([...completedExercises, exerciseId])
    
    if (currentExerciseIndex < breakExercises.length - 1) {
      // Move to next exercise
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setTimeRemaining(breakExercises[currentExerciseIndex + 1].duration)
    } else {
      // Break completed
      setIsPlaying(false)
      setActiveBreak(null)
    }
  }

  const pauseBreak = () => {
    setIsPlaying(!isPlaying)
  }

  const resetBreak = () => {
    setCurrentExerciseIndex(0)
    setTimeRemaining(breakExercises[0]?.duration || 0)
    setIsPlaying(false)
    setCompletedExercises([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'gentle': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'deep': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'neck': return '🦒'
      case 'shoulder': return '💪'
      case 'back': return '🦴'
      case 'eye': return '👁️'
      case 'chest': return '🫁'
      case 'wrist': return '🤚'
      default: return '🧘'
    }
  }

  if (activeBreak) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => setActiveBreak(null)}>
                  ← Exit Break
                </Button>
                <h1 className="text-xl font-semibold capitalize">{breakType} Break</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  {currentExerciseIndex + 1} of {breakExercises.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Exercise Interface */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Exercise Display */}
            <Card className="lg:col-span-1">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {getCategoryIcon(currentExercise.category)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{currentExercise.name}</h2>
                  <p className="text-gray-600 mb-4">{currentExercise.description}</p>
                  <Badge className={getDifficultyColor(currentExercise.difficulty)}>
                    {currentExercise.difficulty}
                  </Badge>
                </div>

                {/* Timer */}
                <div className="mt-8 text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="text-6xl font-bold text-indigo-600">
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                  <Progress 
                    value={((currentExercise.duration - timeRemaining) / currentExercise.duration) * 100}
                    className="mt-4 h-3"
                  />
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Button
                    onClick={pauseBreak}
                    variant="outline"
                    size="lg"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                    {isPlaying ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    onClick={resetBreak}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleExerciseComplete}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Next Exercise
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Target: {currentExercise.targetArea}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentExercise.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{instruction}</p>
                    </div>
                  ))}
                </div>

                {/* Form Tips */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Form Tips</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Move slowly and deliberately</li>
                    <li>• Don't force any movement</li>
                    <li>• Breathe naturally throughout</li>
                    <li>• Stop if you feel pain</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                ← Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold">Breaks & Stretches</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Start Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Start Break</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-600" />
                  Micro Break
                </CardTitle>
                <CardDescription>2-3 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Quick relief for immediate tension release
                </p>
                <Button 
                  onClick={() => startBreak('micro')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start Micro Break
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  Standard Break
                </CardTitle>
                <CardDescription>5-7 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive routine for full posture reset
                </p>
                <Button 
                  onClick={() => startBreak('standard')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Standard Break
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-600" />
                  Extended Break
                </CardTitle>
                <CardDescription>10-15 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Full mobility routine for deep relaxation
                </p>
                <Button 
                  onClick={() => startBreak('extended')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Start Extended Break
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercise Library */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Exercise Library</h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Exercises</TabsTrigger>
              <TabsTrigger value="neck">Neck</TabsTrigger>
              <TabsTrigger value="shoulder">Shoulders</TabsTrigger>
              <TabsTrigger value="back">Back</TabsTrigger>
              <TabsTrigger value="eyes">Eyes</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise) => (
                  <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl">
                          {getCategoryIcon(exercise.category)}
                        </div>
                        <Badge className={getDifficultyColor(exercise.difficulty)}>
                          {exercise.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <CardDescription>{exercise.targetArea}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {exercise.duration}s
                        </span>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="neck" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises
                  .filter(ex => ex.category === 'neck')
                  .map((exercise) => (
                    <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl">
                            {getCategoryIcon(exercise.category)}
                          </div>
                          <Badge className={getDifficultyColor(exercise.difficulty)}>
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <CardDescription>{exercise.targetArea}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {exercise.duration}s
                          </span>
                          <Button variant="outline" size="sm">
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            {/* Similar tabs for other categories... */}
          </Tabs>
        </div>
      </div>
    </div>
  )
}