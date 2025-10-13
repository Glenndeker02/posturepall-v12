'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/logo'
import { 
  Play, 
  Clock, 
  Target, 
  Zap, 
  Heart,
  Brain,
  Eye,
  Monitor,
  Timer,
  CheckCircle,
  Star,
  TrendingUp,
  Activity,
  User,
  Home,
  Dumbbell,
  Settings,
  LogOut
} from 'lucide-react'

export default function ExercisesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeExercise, setActiveExercise] = useState(null)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const hasToken = localStorage.getItem('authToken') || sessionStorage.getItem('userSession')
    
    if (!hasToken) {
      // Not authenticated, redirect to auth page
      router.push('/auth')
      return
    }
    
    setIsAuthenticated(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('userSession')
    router.push('/')
  }

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const exerciseCategories = [
    { id: 'all', name: 'All Exercises', icon: Activity },
    { id: 'neck', name: 'Neck & Shoulders', icon: User },
    { id: 'back', name: 'Back & Spine', icon: TrendingUp },
    { id: 'eyes', name: 'Eye Relief', icon: Eye },
    { id: 'full', name: 'Full Body', icon: Heart },
    { id: 'breathing', name: 'Breathing', icon: Brain },
  ]

  const exercises = [
    {
      id: 1,
      name: 'Neck Rolls',
      category: 'neck',
      duration: '2 min',
      difficulty: 'Beginner',
      description: 'Gentle neck rotations to relieve tension',
      benefits: ['Reduces neck stiffness', 'Improves circulation'],
      rating: 4.8,
      timesCompleted: 24,
      favorite: true
    },
    {
      id: 2,
      name: 'Shoulder Blade Squeeze',
      category: 'neck',
      duration: '3 min',
      difficulty: 'Beginner',
      description: 'Strengthen upper back and improve posture',
      benefits: ['Corrects rounded shoulders', 'Strengthens upper back'],
      rating: 4.9,
      timesCompleted: 18,
      favorite: false
    },
    {
      id: 3,
      name: 'Seated Cat-Cow',
      category: 'back',
      duration: '4 min',
      difficulty: 'Beginner',
      description: 'Gentle spinal movement for flexibility',
      benefits: ['Increases spinal mobility', 'Relieves back tension'],
      rating: 4.7,
      timesCompleted: 15,
      favorite: true
    },
    {
      id: 4,
      name: '20-20-20 Eye Rule',
      category: 'eyes',
      duration: '1 min',
      difficulty: 'Beginner',
      description: 'Rest your eyes from screen strain',
      benefits: ['Reduces eye strain', 'Prevents headaches'],
      rating: 4.6,
      timesCompleted: 32,
      favorite: false
    },
    {
      id: 5,
      name: 'Chest Opener Stretch',
      category: 'back',
      duration: '3 min',
      difficulty: 'Intermediate',
      description: 'Open chest and reverse hunching',
      benefits: ['Improves posture', 'Opens chest muscles'],
      rating: 4.8,
      timesCompleted: 12,
      favorite: true
    },
    {
      id: 6,
      name: 'Box Breathing',
      category: 'breathing',
      duration: '5 min',
      difficulty: 'Beginner',
      description: 'Calming breathing technique for focus',
      benefits: ['Reduces stress', 'Improves focus'],
      rating: 4.9,
      timesCompleted: 28,
      favorite: false
    },
    {
      id: 7,
      name: 'Wrist & Finger Stretches',
      category: 'full',
      duration: '3 min',
      difficulty: 'Beginner',
      description: 'Prevent carpal tunnel and relieve wrist pain',
      benefits: ['Prevents wrist strain', 'Improves flexibility'],
      rating: 4.5,
      timesCompleted: 20,
      favorite: false
    },
    {
      id: 8,
      name: 'Standing Desk Routine',
      category: 'full',
      duration: '7 min',
      difficulty: 'Intermediate',
      description: 'Full body routine for standing breaks',
      benefits: ['Full body movement', 'Energy boost'],
      rating: 4.7,
      timesCompleted: 8,
      favorite: true
    }
  ]

  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(ex => ex.category === selectedCategory)

  const quickRoutines = [
    {
      name: 'Quick Energy Boost',
      duration: '5 min',
      exercises: 3,
      focus: 'Neck & Shoulders',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: 'Stress Relief',
      duration: '8 min',
      exercises: 4,
      focus: 'Breathing & Gentle Stretch',
      color: 'bg-green-100 text-green-600'
    },
    {
      name: 'Posture Reset',
      duration: '10 min',
      exercises: 5,
      focus: 'Full Body Alignment',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      name: 'Eye Care Break',
      duration: '3 min',
      exercises: 2,
      focus: 'Eye Relief',
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="md" />
              <div className="ml-10 flex items-baseline space-x-4">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                  <a href="/dashboard">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                  <a href="/insights">
                    <Activity className="w-4 h-4 mr-2" />
                    Insights
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-900 bg-gray-100">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Exercises
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                  <a href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </a>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Library</h1>
          <p className="text-gray-600">Guided stretches and exercises to improve your posture and well-being</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Exercises Completed</h3>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-green-600">+12 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Timer className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Total Time</h3>
              <p className="text-2xl font-bold text-gray-900">8h 24m</p>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Current Streak</h3>
              <p className="text-2xl font-bold text-gray-900">7 days</p>
              <p className="text-sm text-gray-600">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Energy Boost</h3>
              <p className="text-2xl font-bold text-gray-900">89%</p>
              <p className="text-sm text-gray-600">Effectiveness</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="exercises" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exercises">Individual Exercises</TabsTrigger>
            <TabsTrigger value="routines">Quick Routines</TabsTrigger>
            <TabsTrigger value="recommendations">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {exerciseCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center"
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <CardDescription className="mt-1">{exercise.description}</CardDescription>
                      </div>
                      {exercise.favorite && (
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Exercise Meta */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {exercise.duration}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          <span className="text-gray-600">{exercise.rating}</span>
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Benefits:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {exercise.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completed</span>
                          <span className="font-medium">{exercise.timesCompleted} times</span>
                        </div>
                        <Progress value={(exercise.timesCompleted / 30) * 100} className="h-2" />
                      </div>

                      {/* Action Button */}
                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start Exercise
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="routines" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickRoutines.map((routine, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${routine.color} rounded-full flex items-center justify-center`}>
                        <Timer className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle>{routine.name}</CardTitle>
                        <CardDescription>{routine.focus}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {routine.duration}
                          </div>
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            {routine.exercises} exercises
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start Routine
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Routine Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Create Your Own Routine</CardTitle>
                <CardDescription>Combine exercises to create a personalized routine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Build Custom Routine</h3>
                  <p className="text-gray-600 mb-4">Mix and match exercises to create your perfect break routine</p>
                  <Button>
                    <Target className="w-4 h-4 mr-2" />
                    Create Routine
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI-Powered Recommendations
                  </CardTitle>
                  <CardDescription>Based on your posture patterns and work habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Focus on Neck Relief</h4>
                      <p className="text-sm text-blue-700 mb-3">Forward head posture detected 65% of the time</p>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          <Play className="w-4 h-4 mr-2" />
                          Neck Rolls (2 min)
                        </Button>
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          <Play className="w-4 h-4 mr-2" />
                          Chin Tucks (3 min)
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Afternoon Energy Boost</h4>
                      <p className="text-sm text-green-700 mb-3">Your posture declines after 2 PM</p>
                      <Button size="sm" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start 5-min Routine
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time-based Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Perfect for Right Now
                  </CardTitle>
                  <CardDescription>Based on current time and your patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Quick Eye Break</h4>
                      <p className="text-sm text-orange-700 mb-3">You've been working for 45 minutes</p>
                      <Button size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        20-20-20 Eye Rule
                      </Button>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Stress Relief</h4>
                      <p className="text-sm text-purple-700 mb-3">Take a moment to breathe and reset</p>
                      <Button size="sm" variant="outline" className="w-full">
                        <Brain className="w-4 h-4 mr-2" />
                        Box Breathing (5 min)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Your Exercise Impact</CardTitle>
                <CardDescription>How exercises are improving your posture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">-42%</div>
                    <p className="text-sm text-gray-600">Neck pain reduction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+28%</div>
                    <p className="text-sm text-gray-600">Posture score improvement</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">+35%</div>
                    <p className="text-sm text-gray-600">Energy level increase</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}