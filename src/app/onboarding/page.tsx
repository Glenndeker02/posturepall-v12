'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'
import { PostureCalibration } from '@/components/features/posture-calibration'
import { WelcomeCarousel } from '@/components/onboarding/welcome-carousel'
import { PermissionScreens } from '@/components/onboarding/permission-screens'
import { GoalCommitment, type GoalData } from '@/components/onboarding/goal-commitment'
import { QRCodePairing } from '@/components/pairing/qr-code-pairing'
import type { CalibrationData } from '@/lib/ai/types'
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Home,
  Coffee,
  GraduationCap,
  Gamepad2,
  Monitor,
  Clock,
  Heart,
  Target,
  Zap,
  Users,
  ArrowRight,
  Check,
  Sparkles,
  User,
  Shield,
  Calendar,
  Camera,
  Smartphone
} from 'lucide-react'

interface OnboardingData {
  workEnvironment: string
  dailySittingHours: number
  painAreas: string[]
  workSchedule: {
    startTime: string
    endTime: string
    workDays: string[]
    breakFrequency: string
  }
  primaryGoal: string
  commitmentLevel: string
  email: string
  name: string
}

const workEnvironments = [
  { id: 'office', label: 'Office', icon: Building2, description: 'Corporate workspace', color: 'bg-blue-100 text-blue-600' },
  { id: 'home', label: 'Home Office', icon: Home, description: 'Dedicated space at home', color: 'bg-green-100 text-green-600' },
  { id: 'flexible', label: 'Flexible', icon: Coffee, description: 'Coffee shops, coworking', color: 'bg-purple-100 text-purple-600' },
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'Library, dorm, classroom', color: 'bg-orange-100 text-orange-600' },
  { id: 'gaming', label: 'Gaming/Streaming', icon: Gamepad2, description: 'Extended gaming sessions', color: 'bg-red-100 text-red-600' },
  { id: 'other', label: 'Other', icon: Monitor, description: 'Other setup', color: 'bg-gray-100 text-gray-600' }
]

const painOptions = [
  { id: 'neck', label: 'Neck pain/stiffness', icon: '🦒' },
  { id: 'upper_back', label: 'Upper back pain', icon: '💪' },
  { id: 'lower_back', label: 'Lower back pain', icon: '🦴' },
  { id: 'shoulders', label: 'Shoulder pain/tension', icon: '🤸' },
  { id: 'headaches', label: 'Headaches', icon: '🤕' },
  { id: 'wrists', label: 'Wrist/hand pain', icon: '🤚' },
  { id: 'hips', label: 'Hip/leg discomfort', icon: '🦵' }
]

const goals = [
  { 
    id: 'reduce_pain', 
    label: 'Reduce existing pain', 
    description: 'I have pain and want relief',
    icon: Heart,
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'prevent_problems', 
    label: 'Prevent future problems', 
    description: "I'm pain-free and want to stay that way",
    icon: Shield,
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'improve_focus', 
    label: 'Improve focus & productivity', 
    description: 'Better posture = better work performance',
    icon: Zap,
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'build_habits', 
    label: 'Build healthy habits', 
    description: 'Create lasting change in how I sit',
    icon: Target,
    color: 'bg-green-50 border-green-200'
  }
]

export default function Onboarding() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showPermissions, setShowPermissions] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [goalData, setGoalData] = useState<GoalData | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    workEnvironment: '',
    dailySittingHours: 8,
    painAreas: [],
    workSchedule: {
      startTime: '09:00',
      endTime: '17:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      breakFrequency: 'every_hour'
    },
    primaryGoal: '',
    commitmentLevel: 'medium',
    email: '',
    name: ''
  })

  const totalSteps = 8
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Handle welcome completion
  const handleWelcomeComplete = () => {
    setShowWelcome(false)
    setShowPermissions(true)
  }

  // Handle permissions completion
  const handlePermissionsComplete = () => {
    setShowPermissions(false)
  }

  // Show welcome carousel
  if (showWelcome) {
    return <WelcomeCarousel onComplete={handleWelcomeComplete} />
  }

  // Show permission screens
  if (showPermissions) {
    return <PermissionScreens onComplete={handlePermissionsComplete} />
  }

  const updateData = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }))
  }

  const updateWorkSchedule = (field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      workSchedule: { ...prev.workSchedule, [field]: value }
    }))
  }

  const nextStep = async () => {
    // Create user account after step 5 (when we have email and name)
    if (currentStep === 5 && onboardingData.email && onboardingData.name && !userId) {
      await createUserAccount()
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const createUserAccount = async () => {
    try {
      const userResponse = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: onboardingData.email,
          name: onboardingData.name,
          workEnvironment: onboardingData.workEnvironment,
          dailySittingHours: onboardingData.dailySittingHours,
          painAreas: onboardingData.painAreas,
          workSchedule: onboardingData.workSchedule,
          userGoals: {
            primaryGoal: goalData?.template || onboardingData.primaryGoal,
            commitment: goalData?.commitment,
            commitmentLevel: onboardingData.commitmentLevel,
          },
          breakRemindersEnabled: onboardingData.workSchedule.breakFrequency !== 'never',
          streakRemindersEnabled: goalData?.reminder || false,
        }),
      })

      const userData = await userResponse.json()

      if (userData.success) {
        setUserId(userData.user.id)
        // Save to localStorage for persistence
        localStorage.setItem('userId', userData.user.id)
        localStorage.setItem('userEmail', userData.user.email)
        localStorage.setItem('userName', userData.user.name)
      }
    } catch (error) {
      console.error('Error creating user account:', error)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return onboardingData.workEnvironment !== ''
      case 1: return onboardingData.dailySittingHours >= 2
      case 2: return true // Pain areas are optional
      case 3: return onboardingData.workSchedule.startTime && onboardingData.workSchedule.endTime
      case 4: return goalData !== null // Goal commitment completed
      case 5: return onboardingData.email && onboardingData.name
      case 6: return calibrationData !== null // Calibration must be completed
      case 7: return true // Mobile pairing is optional
      default: return false
    }
  }

  const handleComplete = async () => {
    try {
      // If user account wasn't created yet (shouldn't happen), create it now
      if (!userId) {
        await createUserAccount()
      }

      if (!userId) {
        alert('Failed to create account. Please try again.')
        return
      }

      // Mark onboarding as completed
      localStorage.setItem('onboardingCompleted', 'true')

      // Create default workstation with calibration
      const workstationName = workEnvironments.find(e => e.id === onboardingData.workEnvironment)?.label || 'My Workstation'

      await fetch('/api/workstations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          name: workstationName,
          location: 'Primary setup',
          calibrationData: calibrationData,
          isDefault: true,
        }),
      })

      // Create initial goal if set
      if (goalData) {
        await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            goal: {
              title: goalData.customGoal || goalData.template,
              description: goalData.commitment,
              targetValue: 100,
              unit: 'percentage',
            },
          }),
        })
      }

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Where do you work?</h2>
              <p className="text-lg text-gray-600">This helps us tailor your experience</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {workEnvironments.map((env) => {
                const Icon = env.icon
                const isSelected = onboardingData.workEnvironment === env.id
                return (
                  <button
                    key={env.id}
                    onClick={() => updateData('workEnvironment', env.id)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${env.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{env.label}</h3>
                    <p className="text-sm text-gray-600">{env.description}</p>
                    {isSelected && (
                      <div className="mt-3 flex items-center text-indigo-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">How long do you sit daily?</h2>
              <p className="text-lg text-gray-600">Be honest - this helps us set realistic goals</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600 mb-4">
                  {onboardingData.dailySittingHours}h
                </div>
                <Slider
                  value={[onboardingData.dailySittingHours]}
                  onValueChange={(value) => updateData('dailySittingHours', value[0])}
                  max={14}
                  min={2}
                  step={1}
                  className="max-w-xs mx-auto"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-4 max-w-xs mx-auto">
                  <span>2h</span>
                  <span>8h</span>
                  <span>14h</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      {onboardingData.dailySittingHours <= 6 && "Great! You're already being mindful about your sitting time."}
                      {onboardingData.dailySittingHours > 6 && onboardingData.dailySittingHours <= 10 && "That's pretty typical for desk work. Regular breaks will be key."}
                      {onboardingData.dailySittingHours > 10 && "That's a lot of sitting! We'll make sure to keep you moving."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Any pain or discomfort?</h2>
              <p className="text-lg text-gray-600">Select all that apply (optional)</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {painOptions.map((pain) => (
                  <button
                    key={pain.id}
                    onClick={() => {
                      if (onboardingData.painAreas.includes(pain.id)) {
                        updateData('painAreas', onboardingData.painAreas.filter(area => area !== pain.id))
                      } else {
                        updateData('painAreas', [...onboardingData.painAreas, pain.id])
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      onboardingData.painAreas.includes(pain.id)
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{pain.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{pain.label}</p>
                    {onboardingData.painAreas.includes(pain.id) && (
                      <Check className="w-4 h-4 text-purple-600 mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
              
              {onboardingData.painAreas.length > 0 && (
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-900 mb-1">
                        We've noted your pain areas
                      </p>
                      <p className="text-sm text-purple-700">
                        We'll prioritize exercises and stretches that target these specific regions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Your work schedule</h2>
              <p className="text-lg text-gray-600">This helps us time your reminders perfectly</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">Work Hours</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="time"
                    value={onboardingData.workSchedule.startTime}
                    onChange={(e) => updateWorkSchedule('startTime', e.target.value)}
                    className="text-lg p-3 rounded-xl"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={onboardingData.workSchedule.endTime}
                    onChange={(e) => updateWorkSchedule('endTime', e.target.value)}
                    className="text-lg p-3 rounded-xl"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-lg font-medium">Work Days</Label>
                <div className="grid grid-cols-7 gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                    const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]
                    const isSelected = onboardingData.workSchedule.workDays.includes(fullDay)
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          if (isSelected) {
                            updateWorkSchedule('workDays', onboardingData.workSchedule.workDays.filter(d => d !== fullDay))
                          } else {
                            updateWorkSchedule('workDays', [...onboardingData.workSchedule.workDays, fullDay])
                          }
                        }}
                        className={`w-12 h-12 rounded-xl border-2 font-medium transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">Break Frequency</Label>
                <RadioGroup
                  value={onboardingData.workSchedule.breakFrequency}
                  onValueChange={(value) => updateWorkSchedule('breakFrequency', value)}
                  className="space-y-3"
                >
                  {[
                    { value: 'every_30', label: 'Every 30 minutes', desc: 'Frequent reminders' },
                    { value: 'every_45', label: 'Every 45 minutes', desc: 'Balanced approach' },
                    { value: 'every_hour', label: 'Every hour', desc: 'Recommended' },
                    { value: 'every_90', label: 'Every 90 minutes', desc: 'Less frequent' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="font-medium">{option.label}</Label>
                        <p className="text-sm text-gray-600">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <GoalCommitment
            userProfile={{
              hasPain: onboardingData.painAreas.length > 0,
              commitmentLevel: onboardingData.commitmentLevel,
              primaryGoal: onboardingData.primaryGoal,
            }}
            onComplete={(data) => {
              setGoalData(data)
              // Automatically advance to next step
              nextStep()
            }}
          />
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Create your account</h2>
              <p className="text-lg text-gray-600">Let's set up your profile</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">Your Name</Label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={onboardingData.name}
                  onChange={(e) => updateData('name', e.target.value)}
                  className="text-lg p-4 rounded-xl"
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-lg font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={onboardingData.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  className="text-lg p-4 rounded-xl"
                />
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Your Profile Summary
                </h3>
                <div className="space-y-2 text-sm text-indigo-700">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    <span>{workEnvironments.find(e => e.id === onboardingData.workEnvironment)?.label} setup</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    <span>{onboardingData.dailySittingHours} hours seated daily</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    <span>{onboardingData.painAreas.length} pain areas noted</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    <span>{goals.find(g => g.id === onboardingData.primaryGoal)?.label}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                    <span>{onboardingData.commitmentLevel} commitment level</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Calibrate Your Posture</h2>
              <p className="text-lg text-gray-600">
                Let's establish your optimal sitting position
              </p>
            </div>

            <PostureCalibration
              workstationName="Default Workstation"
              onComplete={(data) => {
                setCalibrationData(data)
              }}
              onCancel={() => {
                // Allow skipping calibration
                if (confirm('Skip calibration? You can calibrate later, but posture tracking won\'t be personalized.')) {
                  setCalibrationData({} as CalibrationData) // Empty calibration data to allow proceeding
                }
              }}
            />
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Connect Your Mobile App</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Sync your posture data with our mobile app to get personalized exercise recommendations
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-indigo-100 max-w-2xl mx-auto mb-6">
              <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Why Connect?
              </h3>
              <div className="space-y-2 text-sm text-indigo-700">
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Get personalized deep stretches and home exercises based on your posture data</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access your analytics and progress anywhere</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sync exercise completions and track your wellness journey</span>
                </div>
              </div>
            </div>

            {userId ? (
              <QRCodePairing
                userId={userId}
                onPaired={(deviceInfo) => {
                  console.log('Device paired:', deviceInfo)
                  // Automatically advance to completion after successful pairing
                  setTimeout(() => handleComplete(), 1500)
                }}
                compact={false}
              />
            ) : (
              <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  Please complete the previous steps to enable mobile pairing
                </p>
              </div>
            )}

            <div className="text-center mt-6">
              <Button
                variant="ghost"
                onClick={handleComplete}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip for now - I'll connect later
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <Badge variant="outline" className="bg-white/80">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white/90 backdrop-blur border-0 shadow-xl">
          <CardContent className="p-8 md:p-12">
            {renderStep()}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                size="lg"
                className="rounded-xl"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
              
              {currentStep === totalSteps - 1 ? (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl"
                >
                  Complete Setup
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}