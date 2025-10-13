'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Logo } from '@/components/logo'
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
  ArrowRight
} from 'lucide-react'

export default function Dashboard() {
  const [greeting, setGreeting] = useState('')

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* SECTION 1: HERO SECTION */}
      <section className="mb-8">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mr-3">
            {greeting}, Sarah! 👋
          </h2>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          You're on a 12-day streak. Keep the momentum going!
        </p>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Posture Score */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">TODAY'S POSTURE SCORE</h3>
              
              {/* Circular Progress Ring */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                  <circle
                    cx="96" cy="96" r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - 78/100)}`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">78%</span>
                  <span className="text-sm text-gray-500">Good posture</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">5% better than yesterday</span>
                </div>
                <div className="text-xs text-gray-500">
                  22% toward your 80% weekly goal
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col bg-green-600 hover:bg-green-700 text-white">
                  <Play className="w-6 h-6 mb-2" />
                  <span>Start Session</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Coffee className="w-6 h-6 mb-2" />
                  <span>Quick Break</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Target className="w-6 h-6 mb-2" />
                  <span>View Goals</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Trophy className="w-6 h-6 mb-2" />
                  <span>Achievements</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 2: TODAY'S SNAPSHOT */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Today's Snapshot</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">3h 24m</div>
              <div className="text-sm text-gray-500">Active today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Coffee className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">5 of 6</div>
              <div className="text-sm text-gray-500">Breaks completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">12 days</div>
              <div className="text-sm text-gray-500">Current streak</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">+287</div>
              <div className="text-sm text-gray-500">Points earned</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 3: INSIGHTS & ALERTS */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Insights & Alerts</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                Attention Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">4 breaks skipped today</p>
                    <p className="text-xs text-gray-500">Posture score drops when breaks are missed</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Calibration due in 2 days</p>
                    <p className="text-xs text-gray-500">Maintain accuracy of posture detection</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Calibrate</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 text-green-500 mr-2" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">Best posture time: 9-11 AM</p>
                <p className="text-xs text-gray-600">Schedule important work during these hours for optimal posture</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">30% faster correction this week</p>
                <p className="text-xs text-gray-600">Your posture awareness is improving significantly!</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800 mb-1">Afternoon breaks help evening posture</p>
                <p className="text-xs text-gray-600">Users who take afternoon breaks have 15% better evening scores</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 4: ACTIVE GOALS */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Goals</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Daily Posture Target</h4>
                <Badge variant="secondary">Daily</Badge>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <p className="text-xs text-gray-500">Maintain 80% good posture throughout the day</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Break Consistency</h4>
                <Badge variant="secondary">Weekly</Badge>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>83%</span>
                </div>
                <Progress value={83} className="h-2" />
              </div>
              <p className="text-xs text-gray-500">Complete all break reminders this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Streak Master</h4>
                <Badge variant="secondary">Monthly</Badge>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>40%</span>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              <p className="text-xs text-gray-500">30-day perfect posture streak</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 5: RECENT ACTIVITY */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Morning session completed</p>
                    <p className="text-xs text-gray-500">85% posture score • 2 hours ago</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">+50 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Coffee className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Break completed</p>
                    <p className="text-xs text-gray-500">5-minute stretch routine • 3 hours ago</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">+25 pts</Badge>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Achievement unlocked</p>
                    <p className="text-xs text-gray-500">"7-Day Streak" badge • Yesterday</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">+100 pts</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 6: RECOMMENDATIONS */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Neck Relief Routine</h4>
                  <p className="text-sm text-gray-500">5 minutes • Recommended based on your posture patterns</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Forward head posture detected 65% of the time. This routine targets neck tension and helps realign your head position.
              </p>
              <Button className="w-full">Start Routine</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Posture Goal Adjustment</h4>
                  <p className="text-sm text-gray-500">2 minutes • Optimize your daily targets</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your current goals may be too ambitious. Consider adjusting to 75% target for better consistency.
              </p>
              <Button variant="outline" className="w-full">Adjust Goals</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 7: UPCOMING */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Coming Up</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Coffee className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Next break reminder</p>
                    <p className="text-xs text-gray-500">In 15 minutes</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Snooze</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Posture calibration</p>
                    <p className="text-xs text-gray-500">In 2 days</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}