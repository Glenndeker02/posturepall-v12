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
  Settings
} from 'lucide-react'

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [notifications, setNotifications] = useState({
    postureAlerts: true,
    breakReminders: true,
    achievements: true,
    weeklyReports: false
  })

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Sarah" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Johnson" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="sarah.johnson@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workType">Work Environment</Label>
                    <Select defaultValue="home">
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
                    <Label htmlFor="goals">Primary Goals</Label>
                    <Select defaultValue="pain">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pain">Reduce Existing Pain</SelectItem>
                        <SelectItem value="prevent">Prevent Future Problems</SelectItem>
                        <SelectItem value="productivity">Improve Focus & Productivity</SelectItem>
                        <SelectItem value="habits">Build Healthy Habits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">
                    Save Changes
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
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">87%</div>
                      <p className="text-sm text-gray-600">Current Posture Score</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Member Since</span>
                        <span className="text-sm font-medium">Oct 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Sessions</span>
                        <span className="text-sm font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Best Streak</span>
                        <span className="text-sm font-medium">12 days</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full">
                        View Full Profile
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
                      <Label>Posture Alerts</Label>
                      <p className="text-sm text-gray-600">Get notified when you slouch</p>
                    </div>
                    <Switch 
                      checked={notifications.postureAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, postureAlerts: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Break Reminders</Label>
                      <p className="text-sm text-gray-600">Regular stretch break notifications</p>
                    </div>
                    <Switch 
                      checked={notifications.breakReminders}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, breakReminders: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Achievement Alerts</Label>
                      <p className="text-sm text-gray-600">Celebrate your milestones</p>
                    </div>
                    <Switch 
                      checked={notifications.achievements}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, achievements: checked}))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-600">Summary of your progress</p>
                    </div>
                    <Switch 
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({...prev, weeklyReports: checked}))
                      }
                    />
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
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Connected Devices
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
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help Center
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="w-4 h-4 mr-2" />
                    Terms of Service
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