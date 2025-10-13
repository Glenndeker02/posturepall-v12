'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Target,
  Activity,
  Clock,
  Trophy,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface SessionData {
  date: string
  score: number
  duration: number
  goodPosturePercent: number
  alerts: number
}

interface WeeklyData {
  day: string
  score: number
  duration: number
  breaksCompleted: number
}

const weeklyData: WeeklyData[] = [
  { day: 'Mon', score: 85, duration: 180, breaksCompleted: 4 },
  { day: 'Tue', score: 92, duration: 240, breaksCompleted: 5 },
  { day: 'Wed', score: 78, duration: 195, breaksCompleted: 3 },
  { day: 'Thu', score: 88, duration: 220, breaksCompleted: 4 },
  { day: 'Fri', score: 91, duration: 200, breaksCompleted: 5 },
  { day: 'Sat', score: 73, duration: 120, breaksCompleted: 2 },
  { day: 'Sun', score: 69, duration: 90, breaksCompleted: 2 }
]

const recentSessions: SessionData[] = [
  { date: '2024-01-15', score: 87, duration: 120, goodPosturePercent: 85, alerts: 8 },
  { date: '2024-01-14', score: 91, duration: 180, goodPosturePercent: 91, alerts: 5 },
  { date: '2024-01-14', score: 84, duration: 90, goodPosturePercent: 82, alerts: 7 },
  { date: '2024-01-13', score: 89, duration: 150, goodPosturePercent: 88, alerts: 6 },
  { date: '2024-01-13', score: 76, duration: 60, goodPosturePercent: 74, alerts: 12 }
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week')

  const averageScore = Math.round(weeklyData.reduce((acc, day) => acc + day.score, 0) / weeklyData.length)
  const totalDuration = weeklyData.reduce((acc, day) => acc + day.duration, 0)
  const totalBreaks = weeklyData.reduce((acc, day) => acc + day.breaksCompleted, 0)
  const bestDay = weeklyData.reduce((best, day) => day.score > best.score ? day : best)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
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
              <h1 className="text-xl font-semibold">Analytics & Progress</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="quarter">Quarter</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore}%
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+5% from last week</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBgColor(averageScore)}`}>
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Time</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-gray-600">This week</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Breaks Completed</p>
                  <p className="text-3xl font-bold text-purple-600">{totalBreaks}</p>
                  <div className="flex items-center mt-2">
                    <Trophy className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600">83% completion rate</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-600">12 days</p>
                  <div className="flex items-center mt-2">
                    <Zap className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-sm text-orange-600">Personal best!</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Posture Score Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Posture Score Trend</CardTitle>
                <CardDescription>
                  Your daily posture scores over the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <Progress 
                          value={day.score} 
                          className="h-2"
                        />
                      </div>
                      <div className={`w-12 text-right text-sm font-bold ${getScoreColor(day.score)}`}>
                        {day.score}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Average</span>
                    <span className={`text-lg font-bold ${getScoreColor(averageScore)}`}>
                      {averageScore}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Session Activity</CardTitle>
                <CardDescription>
                  Daily session duration and break completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-sm font-medium">{day.day}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Progress value={(day.duration / 240) * 100} className="flex-1 h-2" />
                          <span className="text-xs text-gray-600 w-12">
                            {Math.floor(day.duration / 60)}h{day.duration % 60}m
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={day.breaksCompleted >= 4 ? 'default' : 'secondary'}>
                          {day.breaksCompleted} breaks
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Problem Areas Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Areas Analysis</CardTitle>
                <CardDescription>
                  Most common posture issues detected this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Forward Head Posture</span>
                      <span className="text-sm text-red-600 font-bold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Rounded Shoulders</span>
                      <span className="text-sm text-orange-600 font-bold">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Slouched Spine</span>
                      <span className="text-sm text-yellow-600 font-bold">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Other Issues</span>
                      <span className="text-sm text-gray-600 font-bold">7%</span>
                    </div>
                    <Progress value={7} className="h-2" />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Recommendation</h4>
                  <p className="text-sm text-blue-700">
                    Focus on neck strengthening exercises and shoulder blade squeezes. 
                    Consider adjusting your monitor height to reduce forward head posture.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.slice(0, 5).map((session, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            {Math.floor(session.duration / 60)}h {session.duration % 60}m
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getScoreBgColor(session.score)}>
                            {session.score}%
                          </Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            {session.alerts} alerts
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Week Warrior</p>
                      <p className="text-xs text-gray-600">7-day streak completed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Posture Perfect</p>
                      <p className="text-xs text-gray-600">90%+ score for 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Break Master</p>
                      <p className="text-xs text-gray-600">25 breaks completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Improving Trend</p>
                      <p className="text-xs text-gray-600">
                        Your afternoon posture is 15% better this week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Attention Needed</p>
                      <p className="text-xs text-gray-600">
                        Fridays show consistent posture decline
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Optimal Time</p>
                      <p className="text-xs text-gray-600">
                        Best posture between 9-11 AM
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}