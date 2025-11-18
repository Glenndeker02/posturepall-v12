'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/logo'
import { useAuth } from '@/contexts/AuthContext'
import { MobilePairingDialog } from '@/components/pairing/mobile-pairing-dialog'
import {
  Play,
  Coffee,
  Calendar,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle,
  Trophy,
  Star,
  Activity,
  Target,
  Award,
  Zap,
  AlertCircle,
  ArrowRight,
  Dumbbell,
  Smartphone
} from 'lucide-react'

interface DashboardData {
  todayScore: number
  yesterdayScore: number
  sessionTime: number
  sessionCount: number
  breakCount: number
  breakCompletionRate: number
  currentStreak: number
  longestStreak: number
  pointsToday: number
  totalPoints: number
  weeklyGoalProgress: number
  recentSessions: any[]
  insights: string[]
  problemAlerts: any[]
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [showPairingDialog, setShowPairingDialog] = useState(false)

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting('Good morning')
    } else if (hour < 17) {
      setGreeting('Good afternoon')
    } else {
      setGreeting('Good evening')
    }
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/dashboard?userId=${user.id}`)

        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Good posture'
    if (score >= 60) return 'Fair'
    return 'Needs improvement'
  }

  const todayScore = dashboardData?.todayScore || 0
  const yesterdayScore = dashboardData?.yesterdayScore || 0
  const scoreDiff = todayScore - yesterdayScore

  return (
    <div className="max-w-7xl mx-auto">
      {/* SECTION 1: HERO SECTION */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {greeting}, {user.name || 'there'}! 👋
            </h2>
            {dashboardData && dashboardData.currentStreak > 0 && (
              <p className="text-lg text-gray-600">
                You're on a {dashboardData.currentStreak}-day streak. Keep the momentum going!
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Posture Score */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">TODAY'S POSTURE SCORE</h3>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Circular Progress Ring */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle
                        cx="96" cy="96" r="88"
                        stroke={todayScore >= 80 ? "url(#gradient-green)" : todayScore >= 70 ? "url(#gradient-yellow)" : "url(#gradient-orange)"}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - todayScore/100)}`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(todayScore)}`}>
                        {todayScore}%
                      </span>
                      <span className="text-sm text-gray-500">{getScoreLabel(todayScore)}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    {scoreDiff !== 0 && (
                      <div className="flex items-center justify-center space-x-2">
                        {scoreDiff > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              {scoreDiff}% better than yesterday
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {Math.abs(scoreDiff)}% lower than yesterday
                          </span>
                        )}
                      </div>
                    )}
                    {dashboardData && (
                      <div className="text-xs text-gray-500">
                        {dashboardData.weeklyGoalProgress}% toward your {user.weeklyGoalScore}% weekly goal
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start bg-indigo-600 hover:bg-indigo-700 text-white"
                size="lg"
                onClick={() => router.push('/posture')}
              >
                <Play className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Start Session</div>
                  <div className="text-xs opacity-90">Begin real-time monitoring</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
                onClick={() => router.push('/breaks')}
              >
                <Coffee className="w-5 h-5 mr-3 text-orange-600" />
                <div className="text-left">
                  <div className="font-semibold">Take a Break</div>
                  <div className="text-xs text-gray-500">Guided stretches & exercises</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
                onClick={() => router.push('/exercises')}
              >
                <Dumbbell className="w-5 h-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold">Browse Exercises</div>
                  <div className="text-xs text-gray-500">23 exercises available</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                size="lg"
                onClick={() => router.push('/calibration')}
              >
                <Target className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold">Calibrate Workstation</div>
                  <div className="text-xs text-gray-500">Set your ideal posture</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-indigo-200 hover:bg-indigo-50"
                size="lg"
                onClick={() => setShowPairingDialog(true)}
              >
                <Smartphone className="w-5 h-5 mr-3 text-indigo-600" />
                <div className="text-left">
                  <div className="font-semibold">Connect Mobile App</div>
                  <div className="text-xs text-gray-500">Sync with your phone</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mobile Pairing Dialog */}
      {user && (
        <MobilePairingDialog
          open={showPairingDialog}
          onOpenChange={setShowPairingDialog}
          userId={user.id}
        />
      )}

      {/* SECTION 2: TODAY'S STATS */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Today's Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '--' : `${dashboardData?.sessionTime || 0}m`}
              </div>
              <div className="text-sm text-gray-600">Session Time</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '--' : dashboardData?.sessionCount || 0}
              </div>
              <div className="text-sm text-gray-600">Sessions</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Coffee className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '--' : `${dashboardData?.breakCount || 0}`}
              </div>
              <div className="text-sm text-gray-600">Breaks Taken</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '--' : dashboardData?.pointsToday || 0}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 3: STREAKS & ACHIEVEMENTS */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Streaks & Progress</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-orange-600 mb-2">
                  {loading ? '--' : dashboardData?.currentStreak || 0}
                </div>
                <div className="text-gray-600">
                  days in a row
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Longest streak:</span>
                <span className="font-semibold">
                  {loading ? '--' : dashboardData?.longestStreak || 0} days
                </span>
              </div>
              <Progress
                value={loading ? 0 : ((dashboardData?.currentStreak || 0) / (dashboardData?.longestStreak || 1)) * 100}
                className="mt-3"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {loading ? '--' : user.totalPoints || 0}
                </div>
                <div className="text-gray-600">
                  lifetime points
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Today:</span>
                <span className="font-semibold text-green-600">
                  +{loading ? '--' : dashboardData?.pointsToday || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 4: INSIGHTS & ALERTS */}
      {!loading && dashboardData && (dashboardData.insights.length > 0 || dashboardData.problemAlerts.length > 0) && (
        <section className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Insights & Alerts</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {dashboardData.insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex items-start gap-3">
                  <Star className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{insight}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {dashboardData.problemAlerts.map((alert, index) => (
              <Card key={index} className="border-orange-200 bg-orange-50">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">{alert.title}</p>
                    <p className="text-xs text-orange-700 mt-1">{alert.description}</p>
                    {alert.exerciseLink && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 mt-2 text-orange-700"
                        onClick={() => router.push(`/exercises?area=${alert.area}`)}
                      >
                        View exercises <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: RECENT ACTIVITY */}
      {!loading && dashboardData && dashboardData.recentSessions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Recent Sessions</h3>
            <Button variant="link" onClick={() => router.push('/insights')}>
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {dashboardData.recentSessions.map((session: any, index: number) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          session.overallScore >= 80 ? 'bg-green-100' :
                          session.overallScore >= 70 ? 'bg-yellow-100' :
                          'bg-orange-100'
                        }`}>
                          <span className={`text-lg font-bold ${getScoreColor(session.overallScore)}`}>
                            {session.overallScore}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(session.startTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.duration} minutes • {session.pointsEarned} points
                          </div>
                        </div>
                      </div>
                      <Badge variant={session.overallScore >= 80 ? 'default' : 'secondary'}>
                        {getScoreLabel(session.overallScore)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
