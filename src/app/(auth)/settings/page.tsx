'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/logo'
import {
  User,
  Bell,
  Shield,
  Monitor,
  Volume2,
  Eye,
  Camera,
  Clock,
  Target,
  Zap,
  Smartphone,
  Laptop,
  Moon,
  Sun,
  Globe,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle,
  Home,
  Activity,
  Dumbbell,
  Settings,
  CreditCard,
  Crown
} from 'lucide-react'

interface UserSettings {
  id: string
  email: string
  name: string | null
  avatar: string | null
  subscriptionTier: string
  workEnvironment: string | null
  dailySittingHours: number | null
  painAreas: string[]
  workSchedule: any
  userGoals: any
  dailyGoalScore: number
  weeklyGoalScore: number
  breakRemindersEnabled: boolean
  streakRemindersEnabled: boolean
  currentStreak: number
  longestStreak: number
  totalPoints: number
  totalSessions: number
  totalBreaks: number
  createdAt: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeCurrentPeriodEnd: string | null
}

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState<UserSettings | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [workEnvironment, setWorkEnvironment] = useState('')
  const [dailySittingHours, setDailySittingHours] = useState(8)
  const [breakRemindersEnabled, setBreakRemindersEnabled] = useState(true)
  const [streakRemindersEnabled, setStreakRemindersEnabled] = useState(true)

  const [preferences, setPreferences] = useState({
    alertSensitivity: [30],
    breakFrequency: [45],
    sessionDuration: [120],
    hapticFeedback: true,
    soundAlerts: true,
    visualAlerts: true
  })

  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'english',
    compactMode: false
  })

  const router = useRouter()

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        router.push('/auth')
        return
      }

      try {
        const response = await fetch('/api/user/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('auth_token')
            router.push('/auth')
            return
          }
          throw new Error('Failed to fetch settings')
        }

        const data: UserSettings = await response.json()
        setUserData(data)

        // Populate form fields
        setName(data.name || '')
        setWorkEnvironment(data.workEnvironment || 'home')
        setDailySittingHours(data.dailySittingHours || 8)
        setBreakRemindersEnabled(data.breakRemindersEnabled)
        setStreakRemindersEnabled(data.streakRemindersEnabled)

        setIsAuthenticated(true)
      } catch (err) {
        console.error('Settings fetch error:', err)
        setError('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [router])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          workEnvironment,
          dailySittingHours,
          breakRemindersEnabled,
          streakRemindersEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const result = await response.json()
      if (result.success) {
        // Refresh user data
        const refreshResponse = await fetch('/api/user/settings', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const refreshedData = await refreshResponse.json()
        setUserData(refreshedData)

        alert('Settings saved successfully!')
      }
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save settings')
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Portal error:', err)
      alert('Failed to open subscription management. Please try again.')
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token')

    // Call logout endpoint
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error('Logout error:', err)
    }

    localStorage.removeItem('auth_token')
    router.push('/')
  }

  // Show loading while fetching
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !userData) {
    return null
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
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                  <a href="/insights">
                    <Activity className="w-4 h-4 mr-2" />
                    Insights
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                  <a href="/exercises">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Exercises
                  </a>
                </Button>
                <Button variant="ghost" className="text-gray-900 bg-gray-100">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userData.name ? userData.name[0].toUpperCase() : userData.email[0].toUpperCase()}
                </span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your preferences and configure your experience</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workType">Work Environment</Label>
                    <Select
                      value={workEnvironment}
                      onValueChange={setWorkEnvironment}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Office</SelectItem>
                        <SelectItem value="office">Corporate Office</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="remote">Remote/Travel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sittingHours">Daily Sitting Hours</Label>
                    <Input
                      id="sittingHours"
                      type="number"
                      min="0"
                      max="24"
                      value={dailySittingHours}
                      onChange={(e) => setDailySittingHours(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {userData.totalPoints}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                        <span className="text-sm font-medium dark:text-gray-300">
                          {new Date(userData.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                        <span className="text-sm font-medium dark:text-gray-300">{userData.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Best Streak</span>
                        <span className="text-sm font-medium dark:text-gray-300">{userData.longestStreak} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Breaks</span>
                        <span className="text-sm font-medium dark:text-gray-300">{userData.totalBreaks}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t dark:border-gray-700">
                      <Button variant="outline" className="w-full" asChild>
                        <a href="/dashboard">View Dashboard</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose what notifications you receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Break Reminders</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Regular stretch break notifications</p>
                    </div>
                    <Switch
                      checked={breakRemindersEnabled}
                      onCheckedChange={setBreakRemindersEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Streak Reminders</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stay motivated with streak alerts</p>
                    </div>
                    <Switch
                      checked={streakRemindersEnabled}
                      onCheckedChange={setStreakRemindersEnabled}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Notification settings will be saved when you click "Save Changes" in the Profile tab.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="w-5 h-5 mr-2" />
                    Alert Settings
                  </CardTitle>
                  <CardDescription>Customize how alerts are delivered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sound Alerts</Label>
                      <p className="text-sm text-gray-600">Audio notifications</p>
                    </div>
                    <Switch 
                      checked={preferences.soundAlerts}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({...prev, soundAlerts: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Haptic Feedback</Label>
                      <p className="text-sm text-gray-600">Vibration on mobile</p>
                    </div>
                    <Switch 
                      checked={preferences.hapticFeedback}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({...prev, hapticFeedback: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Visual Alerts</Label>
                      <p className="text-sm text-gray-600">On-screen notifications</p>
                    </div>
                    <Switch 
                      checked={preferences.visualAlerts}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({...prev, visualAlerts: checked}))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Volume</Label>
                    <Slider
                      max={100}
                      step={1}
                      value={[70]}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    Monitoring Settings
                  </CardTitle>
                  <CardDescription>Configure your posture monitoring preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Alert Sensitivity</Label>
                    <p className="text-sm text-gray-600">How strict should posture alerts be?</p>
                    <Slider
                      max={100}
                      step={5}
                      value={preferences.alertSensitivity}
                      onValueChange={(value) => 
                        setPreferences(prev => ({...prev, alertSensitivity: value}))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Lenient</span>
                      <span>Balanced</span>
                      <span>Strict</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Break Frequency</Label>
                    <p className="text-sm text-gray-600">How often to remind for breaks</p>
                    <Slider
                      max={120}
                      step={15}
                      value={preferences.breakFrequency}
                      onValueChange={(value) => 
                        setPreferences(prev => ({...prev, breakFrequency: value}))
                      }
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">
                      Every {preferences.breakFrequency[0]} minutes
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Session Duration</Label>
                    <p className="text-sm text-gray-600">Standard monitoring session length</p>
                    <Slider
                      max={240}
                      step={30}
                      value={preferences.sessionDuration}
                      onValueChange={(value) => 
                        setPreferences(prev => ({...prev, sessionDuration: value}))
                      }
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">
                      {preferences.sessionDuration[0]} minutes
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Camera & Privacy
                  </CardTitle>
                  <CardDescription>Manage camera permissions and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Camera Access</Label>
                      <p className="text-sm text-gray-600">Allow posture monitoring</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Store Sessions</Label>
                      <p className="text-sm text-gray-600">Save session data for analysis</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Local Processing Only</Label>
                      <p className="text-sm text-gray-600">Process data on device only</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Privacy Notice</h4>
                    <p className="text-sm text-blue-700">All posture analysis happens locally on your device. No video or images are stored or transmitted.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={appearance.theme} onValueChange={(value) => 
                      setAppearance(prev => ({...prev, theme: value}))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="w-4 h-4 mr-2" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="w-4 h-4 mr-2" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="auto">
                          <div className="flex items-center">
                            <Monitor className="w-4 h-4 mr-2" />
                            Auto
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={appearance.language} onValueChange={(value) => 
                      setAppearance(prev => ({...prev, language: value}))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-gray-600">Reduce UI element sizes</p>
                    </div>
                    <Switch 
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) => 
                        setAppearance(prev => ({...prev, compactMode: checked}))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Device Preferences
                  </CardTitle>
                  <CardDescription>Settings for different devices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Desktop Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Start with Windows</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minimize to Tray</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Mobile Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Background Monitoring</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Lock Screen Notifications</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            {/* Subscription Card */}
            <Card className={`${
              userData.subscriptionTier === 'premium'
                ? 'border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30'
                : ''
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Subscription
                  </div>
                  {userData.subscriptionTier === 'premium' && (
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {userData.subscriptionTier === 'free' && (
                    <Badge variant="secondary">Free Plan</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {userData.subscriptionTier === 'premium'
                    ? 'You have access to all premium features'
                    : 'Upgrade to unlock premium features'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.subscriptionTier === 'premium' ? (
                  <>
                    <div className="space-y-2">
                      {userData.stripeCurrentPeriodEnd && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Next billing date:</span>
                          <span className="font-medium dark:text-gray-300">
                            {new Date(userData.stripeCurrentPeriodEnd).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                        <span className="font-medium dark:text-gray-300">Premium Monthly - $9.99/mo</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageSubscription}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">Upgrade to Premium</h4>
                      <ul className="space-y-1 text-sm text-indigo-700 dark:text-indigo-400">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          AI-powered insights
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Advanced analytics
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Unlimited workstations
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mobile app sync
                        </li>
                      </ul>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      asChild
                    >
                      <a href="/pricing">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security
                  </CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password (Coming Soon)
                  </Button>

                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Shield className="w-4 h-4 mr-2" />
                    Two-Factor Authentication (Coming Soon)
                  </Button>

                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Connected Devices (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Support
                  </CardTitle>
                  <CardDescription>Get help and learn more</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help Center (Coming Soon)
                  </Button>

                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Globe className="w-4 h-4 mr-2" />
                    Privacy Policy (Coming Soon)
                  </Button>

                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Target className="w-4 h-4 mr-2" />
                    Terms of Service (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-orange-900">Sign Out</h4>
                    <p className="text-sm text-orange-700">Sign out from all devices</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-orange-600 border-orange-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}