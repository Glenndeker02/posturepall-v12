'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Logo } from '@/components/logo'
import { 
  TrendingUp, 
  Activity, 
  Trophy, 
  Calendar,
  Target,
  Flame,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Award,
  Zap,
  Home,
  Dumbbell,
  Settings,
  LogOut,
  Users,
  Timer,
  Target as TargetIcon,
  Heart
} from 'lucide-react'

// Recharts components
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

export default function InsightsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
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

  // Generate mock data based on selected period
  const generatePostureData = () => {
    const dataPoints = selectedPeriod === 'today' ? 24 : 
                      selectedPeriod === 'week' ? 7 : 
                      selectedPeriod === 'month' ? 30 : 12
    
    const labels = selectedPeriod === 'today' ? Array.from({length: 24}, (_, i) => `${i}:00`) :
                   selectedPeriod === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
                   selectedPeriod === 'month' ? Array.from({length: 30}, (_, i) => `Day ${i + 1}`) :
                   ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return labels.map((label, index) => ({
      name: label,
      score: Math.floor(Math.random() * 20) + 75,
      sessions: Math.floor(Math.random() * 3) + 1,
      breaks: Math.floor(Math.random() * 5) + 3
    }))
  }

  const generateProblemAreasData = () => [
    { name: 'Forward Head', value: 65, color: '#ef4444' },
    { name: 'Rounded Shoulders', value: 30, color: '#f97316' },
    { name: 'Lower Back', value: 15, color: '#eab308' },
    { name: 'Neck Stiffness', value: 25, color: '#a855f7' },
    { name: 'Wrist Pain', value: 10, color: '#3b82f6' }
  ]

  const generateWeeklyComparison = () => [
    { week: 'Week 1', score: 75, sessions: 42, breaks: 38 },
    { week: 'Week 2', score: 80, sessions: 45, breaks: 41 },
    { week: 'Week 3', score: 85, sessions: 48, breaks: 44 },
    { week: 'Week 4', score: 87, sessions: 47, breaks: 43 }
  ]

  const generateTimeOfDayData = () => [
    { time: 'Morning', score: 92, efficiency: 95 },
    { time: 'Afternoon', score: 78, efficiency: 82 },
    { time: 'Evening', score: 65, efficiency: 70 }
  ]

  const generateRadarData = () => [
    { subject: 'Posture', A: 87, fullMark: 100 },
    { subject: 'Breaks', A: 92, fullMark: 100 },
    { subject: 'Consistency', A: 78, fullMark: 100 },
    { subject: 'Exercise', A: 85, fullMark: 100 },
    { subject: 'Awareness', A: 90, fullMark: 100 },
    { subject: 'Improvement', A: 82, fullMark: 100 }
  ]

  const postureData = generatePostureData()
  const problemAreasData = generateProblemAreasData()
  const weeklyComparison = generateWeeklyComparison()
  const timeOfDayData = generateTimeOfDayData()
  const radarData = generateRadarData()

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
                <Button variant="ghost" className="text-gray-900 bg-gray-100">
                  <Activity className="w-4 h-4 mr-2" />
                  Insights
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                  <a href="/exercises">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Exercises
                  </a>
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
        {/* Header with Period Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress Insights</h1>
            <p className="text-gray-600">Track your posture improvement and celebrate your achievements</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-800">+12%</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Posture Score</h3>
              <p className="text-2xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-gray-600">This {selectedPeriod}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Current Streak</h3>
              <p className="text-2xl font-bold text-gray-900">12 days</p>
              <p className="text-sm text-gray-600">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <Badge className="bg-purple-100 text-purple-800">+2h</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Active Time</h3>
              <p className="text-2xl font-bold text-gray-900">24h 35m</p>
              <p className="text-sm text-gray-600">This {selectedPeriod}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-100 text-orange-800">New!</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Points Earned</h3>
              <p className="text-2xl font-bold text-gray-900">1,847</p>
              <p className="text-sm text-gray-600">Total points</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Posture Score Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="w-5 h-5 mr-2" />
                    Posture Score Trend
                  </CardTitle>
                  <CardDescription>Your daily posture scores over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsLineChart data={postureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Problem Areas Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Problem Areas Analysis
                  </CardTitle>
                  <CardDescription>Areas that need the most attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={problemAreasData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {problemAreasData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Session Statistics Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Session & Break Activity
                </CardTitle>
                <CardDescription>Your monitoring sessions and break completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={postureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sessions" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                    <Area type="monotone" dataKey="breaks" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Comparison Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Comparison</CardTitle>
                  <CardDescription>Compare your performance week over week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={weeklyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#10b981" />
                      <Bar dataKey="sessions" fill="#8b5cf6" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Time of Day Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Time of Day Analysis</CardTitle>
                  <CardDescription>Your best and worst performing times</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={timeOfDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#10b981" />
                      <Bar dataKey="efficiency" fill="#f59e0b" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Radar</CardTitle>
                <CardDescription>Your comprehensive posture health assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current Performance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Break Completion Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Timer className="w-5 h-5 mr-2" />
                    Break Completion Patterns
                  </CardTitle>
                  <CardDescription>Your break adherence throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Morning Breaks', 'Afternoon Breaks', 'Evening Breaks'].map((period, index) => (
                      <div key={period} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{period}</span>
                          <span className="text-sm text-gray-600">{95 - index * 10}%</span>
                        </div>
                        <Progress value={95 - index * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Posture Quality Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TargetIcon className="w-5 h-5 mr-2" />
                    Posture Quality Heatmap
                  </CardTitle>
                  <CardDescription>Your posture patterns by day and time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dayIndex) => (
                      <div key={dayIndex} className="text-center font-medium p-1">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 21 }, (_, i) => {
                      const intensity = Math.random()
                      let bgColor = 'bg-gray-100'
                      if (intensity > 0.8) bgColor = 'bg-green-500'
                      else if (intensity > 0.6) bgColor = 'bg-green-300'
                      else if (intensity > 0.4) bgColor = 'bg-yellow-300'
                      else if (intensity > 0.2) bgColor = 'bg-orange-300'
                      else bgColor = 'bg-red-300'
                      
                      return (
                        <div key={i} className={`aspect-square ${bgColor} rounded-sm`}></div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-300 rounded-sm mr-1"></div>
                      <span>Poor</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-300 rounded-sm mr-1"></div>
                      <span>Fair</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-300 rounded-sm mr-1"></div>
                      <span>Good</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
                      <span>Excellent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Correction Speed Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Correction Speed Analysis
                </CardTitle>
                  <CardDescription>How quickly you respond to posture alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={postureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} name="Avg Correction Time (sec)" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'First Week Complete', icon: Trophy, color: 'bg-green-100 text-green-600', earned: true, description: 'Completed your first week of posture tracking' },
                { name: '7-Day Streak', icon: Flame, color: 'bg-orange-100 text-orange-600', earned: true, description: 'Maintained good posture for 7 consecutive days' },
                { name: 'Posture Master', icon: Award, color: 'bg-purple-100 text-purple-600', earned: true, description: 'Achieved 90%+ posture score for a week' },
                { name: 'Break Champion', icon: Timer, color: 'bg-blue-100 text-blue-600', earned: true, description: 'Completed 100% of break reminders for a month' },
                { name: 'Early Bird', icon: Calendar, color: 'bg-yellow-100 text-yellow-600', earned: false, description: 'Best posture scores in morning sessions' },
                { name: 'Consistency King', icon: Target, color: 'bg-red-100 text-red-600', earned: false, description: '30-day perfect consistency record' },
                { name: 'Speed Demon', icon: Zap, color: 'bg-indigo-100 text-indigo-600', earned: true, description: 'Average correction time under 30 seconds' },
                { name: 'Community Leader', icon: Users, color: 'bg-pink-100 text-pink-600', earned: false, description: 'Top 10% in community rankings' },
                { name: 'Wellness Warrior', icon: Heart, color: 'bg-teal-100 text-teal-600', earned: true, description: 'Completed all daily exercises for a month' }
              ].map((achievement, index) => (
                <Card key={index} className={`${achievement.earned ? '' : 'opacity-50'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${achievement.color} rounded-full flex items-center justify-center`}>
                        <achievement.icon className="w-6 h-6" />
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Earned
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personalized Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>AI-powered suggestions based on your patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900">Adjust Your Monitor Height</h4>
                          <p className="text-sm text-blue-700 mt-1">Your forward head posture suggests your screen may be too low. Raise it to eye level.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-900">Take More Frequent Breaks</h4>
                          <p className="text-sm text-green-700 mt-1">Your posture declines after 2 hours. Try breaks every 45 minutes.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start">
                        <Target className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-purple-900">Focus on Shoulder Exercises</h4>
                          <p className="text-sm text-purple-700 mt-1">Rounded shoulders detected 30% of the time. Add shoulder blade squeezes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exercise Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Recommended Exercises
                  </CardTitle>
                  <CardDescription>Targeted exercises for your problem areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Neck Rolls', duration: '2 min', frequency: 'Every 2 hours', target: 'Forward Head' },
                      { name: 'Shoulder Blade Squeeze', duration: '1 min', frequency: 'Every hour', target: 'Rounded Shoulders' },
                      { name: 'Seated Cat-Cow', duration: '3 min', frequency: 'Every 2 hours', target: 'Lower Back' },
                      { name: 'Chest Opener Stretch', duration: '2 min', frequency: 'Every 3 hours', target: 'Overall Posture' }
                    ].map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">{exercise.duration} • {exercise.frequency}</p>
                        </div>
                        <Badge variant="outline">{exercise.target}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Your Progress Goals
                </CardTitle>
                <CardDescription>Track your journey to better posture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { goal: 'Maintain 85% posture score', current: 87, target: 85, unit: '%' },
                    { goal: 'Complete daily exercises', current: 22, target: 30, unit: ' days' },
                    { goal: 'Reduce correction time', current: 42, target: 30, unit: ' seconds' },
                    { goal: 'Perfect break completion', current: 92, target: 100, unit: '%' }
                  ].map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{goal.goal}</span>
                        <span className="text-sm text-gray-600">{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}