'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { WorkstationSelector, type Workstation } from '@/components/features/workstation-selector'
import { AddWorkstationDialog } from '@/components/features/add-workstation-dialog'
import { SessionSummary } from '@/components/features/session-summary'
import { BreakReminder } from '@/components/features/break-reminder'
import { BreakRoutine, type BreakFeedback } from '@/components/features/break-routine'
import { BreakCompletion, type CompleteFeedback } from '@/components/features/break-completion'
import { analyzeSession, type SessionDataPoint, type SessionAnalytics } from '@/lib/analytics/session-analytics'
import { getBreakScheduler, type BreakType } from '@/lib/breaks/break-scheduler'
import { createBreakRoutine, type Exercise } from '@/lib/breaks/exercise-library'
import { usePostureDetection } from '@/hooks/usePostureDetection'
import { PoseVisualizer } from '@/components/features/pose-visualizer'
import type { CalibrationData } from '@/lib/ai/types'
import {
  Camera,
  CameraOff,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Activity,
  MapPin,
  AlertTriangle
} from 'lucide-react'

interface PostureMetrics {
  headAngle: number
  shoulderSymmetry: number
  spineAlignment: number
  distanceFromScreen: number
  overallScore: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

export default function PostureMonitoring() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null)
  const [showAddWorkstationDialog, setShowAddWorkstationDialog] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [detailedView, setDetailedView] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [postureMetrics, setPostureMetrics] = useState<PostureMetrics>({
    headAngle: 0,
    shoulderSymmetry: 0,
    spineAlignment: 0,
    distanceFromScreen: 0,
    overallScore: 85,
    status: 'good'
  })
  const [goodPosturePercent, setGoodPosturePercent] = useState(85)
  const [alertsReceived, setAlertsReceived] = useState(0)
  const [correctionSpeed, setCorrectionSpeed] = useState(42)

  // Session tracking
  const [sessionDataPoints, setSessionDataPoints] = useState<SessionDataPoint[]>([])
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null)

  // Break system
  const [breakMode, setBreakMode] = useState<'none' | 'warning' | 'reminder' | 'routine' | 'completion'>('none')
  const [currentBreakType, setCurrentBreakType] = useState<BreakType | null>(null)
  const [breakExercises, setBreakExercises] = useState<Exercise[]>([])
  const [completedBreakExercises, setCompletedBreakExercises] = useState<string[]>([])
  const [breaksFeedback, setBreaksFeedback] = useState<CompleteFeedback[]>([])
  const [breaksCompleted, setBreaksCompleted] = useState(0)
  const [breaksSkipped, setBreaksSkipped] = useState(0)
  const [nextBreakMinutes, setNextBreakMinutes] = useState<number | null>(null)
  const [maxSnoozesReached, setMaxSnoozesReached] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const breakCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const breakSchedulerRef = useRef<ReturnType<typeof getBreakScheduler> | null>(null)

  // Initialize posture detection hook
  const calibrationData: CalibrationData | null = selectedWorkstation?.calibrationData
    ? (typeof selectedWorkstation.calibrationData === 'string'
      ? JSON.parse(selectedWorkstation.calibrationData)
      : selectedWorkstation.calibrationData)
    : null

  const postureDetection = usePostureDetection(
    videoRef.current,
    calibrationData,
    isSessionActive && !isPaused
  )

  // Auth protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Update posture metrics from real detection
  useEffect(() => {
    if (!postureDetection.currentMetrics || !isSessionActive || isPaused) return

    const metrics = postureDetection.currentMetrics
    const score = postureDetection.getScore()

    const status: 'excellent' | 'good' | 'fair' | 'poor' =
      score >= 80 ? 'excellent' :
      score >= 60 ? 'good' :
      score >= 40 ? 'fair' : 'poor'

    const newMetrics: PostureMetrics = {
      headAngle: metrics.headForwardAngle || 0,
      shoulderSymmetry: 100 - (metrics.shoulderAlignment || 100),
      spineAlignment: 100 - (metrics.spineAlignment || 100),
      distanceFromScreen: metrics.screenDistance || 60,
      overallScore: Math.round(score),
      status
    }

    setPostureMetrics(newMetrics)

    // Record data point for analytics
    const dataPoint: SessionDataPoint = {
      timestamp: Date.now(),
      score,
      quality: status,
      headForwardAngle: metrics.headForwardAngle || 0,
      shoulderSymmetry: metrics.shoulderAlignment || 100,
      screenDistance: metrics.screenDistance || 60,
    }
    setSessionDataPoints(prev => [...prev, dataPoint])

    // Calculate good posture percentage from session data
    const goodCount = sessionDataPoints.filter(dp => dp.score >= 60).length
    const totalCount = sessionDataPoints.length
    if (totalCount > 0) {
      setGoodPosturePercent((goodCount / totalCount) * 100)
    }
  }, [postureDetection.currentMetrics, isSessionActive, isPaused, sessionDataPoints])

  // Handle posture alerts
  useEffect(() => {
    if (postureDetection.currentAlert && !postureDetection.currentAlert.dismissed) {
      setAlertsReceived(prev => prev + 1)

      // Play audio alert if enabled
      if (audioEnabled) {
        // Could play alert sound here
        console.log('Posture alert:', postureDetection.currentAlert.type)
      }
    }
  }, [postureDetection.currentAlert, audioEnabled])

  // Session timer
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isSessionActive, isPaused])

  // Break checking - every minute
  useEffect(() => {
    if (isSessionActive && !isPaused && breakMode === 'none') {
      breakCheckIntervalRef.current = setInterval(() => {
        if (!breakSchedulerRef.current) return

        // Check for 2-minute warning
        const warningCheck = breakSchedulerRef.current.shouldShowWarning()
        if (warningCheck?.show) {
          setCurrentBreakType(warningCheck.type)
          setBreakMode('warning')
          setNextBreakMinutes(warningCheck.minutesUntil)
          return
        }

        // Check if break should be shown now
        const breakCheck = breakSchedulerRef.current.shouldShowBreak()
        if (breakCheck?.show) {
          setCurrentBreakType(breakCheck.type)
          setBreakMode('reminder')
          setMaxSnoozesReached(false)
          return
        }

        // Update next break countdown
        const nextBreak = breakSchedulerRef.current.getNextBreak()
        setNextBreakMinutes(nextBreak?.minutesUntil ?? null)

        // Check if user has skipped too many breaks
        if (breakSchedulerRef.current.hasSkippedTooMany()) {
          // Could show a warning here
          console.warn('User has skipped 3+ breaks')
        }
      }, 60000) // Check every minute
    } else {
      if (breakCheckIntervalRef.current) {
        clearInterval(breakCheckIntervalRef.current)
      }
    }

    return () => {
      if (breakCheckIntervalRef.current) {
        clearInterval(breakCheckIntervalRef.current)
      }
    }
  }, [isSessionActive, isPaused, breakMode])

  // Camera management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraEnabled(true)
      }
    } catch (error) {
      console.error('Camera access denied:', error)
      // Fallback to simulated mode
      setCameraEnabled(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraEnabled(false)
  }

  const handleWorkstationCreated = (workstation: {
    id: string;
    name: string;
    location: string | null;
    calibrationData: any | null;
  }) => {
    // Convert to full Workstation type for selectedWorkstation
    const fullWorkstation: Workstation = {
      ...workstation,
      userId: user?.id || '',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSelectedWorkstation(fullWorkstation)
    setShowAddWorkstationDialog(false)
  }

  // Break handlers
  const handleSnoozeBreak = () => {
    if (!breakSchedulerRef.current || !currentBreakType) return

    const breakId = `${currentBreakType}-${Date.now()}`
    const canSnooze = breakSchedulerRef.current.snoozeBreak(breakId)

    if (canSnooze) {
      setBreakMode('none')
      setMaxSnoozesReached(false)
    } else {
      setMaxSnoozesReached(true)
    }
  }

  const handleSkipBreak = () => {
    if (!breakSchedulerRef.current || !currentBreakType) return

    const breakId = `${currentBreakType}-${Date.now()}`
    breakSchedulerRef.current.skipBreak(breakId)
    setBreaksSkipped(prev => prev + 1)
    setBreakMode('none')
    setCurrentBreakType(null)
  }

  const handleStartBreak = () => {
    if (!currentBreakType) return

    // Pause the posture session
    setIsPaused(true)

    // Generate exercise routine
    const problemAreas = sessionDataPoints.length > 0
      ? ['neck', 'shoulders'] // Could derive from actual posture data
      : undefined
    const exercises = createBreakRoutine(currentBreakType, problemAreas)
    setBreakExercises(exercises)
    setBreakMode('routine')
  }

  const handleCompleteBreakRoutine = (completedExercises: string[], feedback: BreakFeedback) => {
    setCompletedBreakExercises(completedExercises)
    setBreakMode('completion')
  }

  const handleFinishBreak = (feedback: CompleteFeedback) => {
    if (!breakSchedulerRef.current || !currentBreakType) return

    const breakId = `${currentBreakType}-${Date.now()}`
    breakSchedulerRef.current.completeBreak(breakId)

    setBreaksCompleted(prev => prev + 1)
    setBreaksFeedback(prev => [...prev, feedback])
    setBreakMode('none')
    setCurrentBreakType(null)

    // Resume the posture session
    setIsPaused(false)
  }

  const handleExitBreak = () => {
    setBreakMode('none')
    setCurrentBreakType(null)
    setIsPaused(false)
  }

  const startSession = async () => {
    // Check if workstation is selected
    if (!selectedWorkstation) {
      alert('Please select or add a workstation before starting a session')
      return
    }

    // Check if workstation is calibrated
    if (!selectedWorkstation.calibrationData) {
      const shouldContinue = confirm(
        'This workstation is not calibrated. Posture tracking won\'t be personalized. Continue anyway?'
      )
      if (!shouldContinue) return
    }

    await startCamera()
    setIsSessionActive(true)
    setSessionTime(0)
    setSessionStartTime(Date.now())
    setAlertsReceived(0)
    setGoodPosturePercent(85)
    setSessionDataPoints([]) // Clear previous session data

    // Initialize break scheduler
    breakSchedulerRef.current = getBreakScheduler({
      microBreakInterval: 45,
      standardBreakInterval: 90,
      extendedBreakInterval: 180,
    })
    breakSchedulerRef.current.startSession()
    setBreaksCompleted(0)
    setBreaksSkipped(0)
    setBreakMode('none')
  }

  const stopSession = async () => {
    const sessionDuration = Math.floor(sessionTime / 60) // Convert to minutes

    // Generate analytics
    if (sessionDataPoints.length > 0 && sessionDuration > 0) {
      const analytics = analyzeSession(sessionDataPoints, sessionDuration)
      setSessionAnalytics(analytics)

      // Save session to database
      if (user?.id) {
        try {
          await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              workstationId: selectedWorkstation?.id,
              startTime: new Date(sessionStartTime),
              endTime: new Date(),
              duration: sessionDuration,
              overallScore: analytics.excellentPercent + analytics.goodPercent,
              goodPosturePercent: ((analytics.timeExcellent + analytics.timeGood) / (analytics.timeExcellent + analytics.timeGood + analytics.timeFair + analytics.timePoor)) * 100,
              timeExcellent: analytics.timeExcellent,
              timeGood: analytics.timeGood,
              timeFair: analytics.timeFair,
              timePoor: analytics.timePoor,
              alertsReceived: analytics.totalAlerts,
              postureAlerts: analytics.postureAlerts,
              breakReminders: analytics.breakReminders,
              correctionSpeed: analytics.avgCorrectionTime,
              pointsEarned: analytics.basePoints,
              bonusPoints: analytics.bonusPoints,
              mostCommonIssue: analytics.mostCommonIssue,
              problemAreas: JSON.stringify(analytics.problemAreas),
              postureTimeline: JSON.stringify(analytics.postureTimeline),
              longestGoodStreak: analytics.longestGoodStreak,
              isPersonalRecord: analytics.isPersonalRecord,
              recordType: analytics.recordType,
              avgScreenDistance: analytics.avgScreenDistance,
              lightingQuality: analytics.lightingQuality,
              aiInsights: JSON.stringify(analytics.insights),
              recommendations: JSON.stringify(analytics.recommendations),
            }),
          })
        } catch (error) {
          console.error('Error saving session:', error)
        }
      }

      // Show summary
      setShowSessionSummary(true)
    }

    setIsSessionActive(false)
    setIsPaused(false)
    stopCamera()

    // Clean up break scheduler
    breakSchedulerRef.current = null
    setBreakMode('none')
    setCurrentBreakType(null)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-lime-500'
      case 'fair': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-lime-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
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
              <h1 className="text-xl font-semibold">Posture Monitoring</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="audio-toggle">Audio</Label>
                <Switch 
                  id="audio-toggle"
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                />
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="view-toggle">Detailed View</Label>
                <Switch 
                  id="view-toggle"
                  checked={detailedView}
                  onCheckedChange={setDetailedView}
                />
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Monitoring Area */}
          <div className="lg:col-span-2">
            {/* Workstation Selection - Only show when session is not active */}
            {!isSessionActive && user && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Select Workstation
                  </CardTitle>
                  <CardDescription>
                    Choose your current workstation to begin posture monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkstationSelector
                    userId={user.id}
                    selectedWorkstationId={selectedWorkstation?.id || null}
                    onWorkstationChange={setSelectedWorkstation}
                    onAddWorkstation={() => setShowAddWorkstationDialog(true)}
                  />
                </CardContent>
              </Card>
            )}
            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                {/* Posture Aura Effect */}
                <div className={`absolute inset-0 transition-all duration-1000 opacity-20 pointer-events-none ${
                  getStatusColor(postureMetrics.status)
                }`} />
                
                {/* Camera View or Placeholder */}
                <div className="relative aspect-video bg-gray-900">
                  {cameraEnabled ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Pose Visualizer Overlay */}
                      {isSessionActive && postureDetection.currentPose && (
                        <PoseVisualizer
                          pose={postureDetection.currentPose}
                          videoElement={videoRef.current}
                          showSkeleton={true}
                          showKeypoints={detailedView}
                          highlightIssues={true}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">
                          {isSessionActive ? 'Camera access denied' : 'Camera will activate during session'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Session Overlay */}
                  {isSessionActive && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="bg-black/50 backdrop-blur rounded-lg px-3 py-2">
                        <p className="text-white font-mono text-sm">{formatTime(sessionTime)}</p>
                      </div>
                      <div className="bg-black/50 backdrop-blur rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(postureMetrics.status)}`} />
                          <p className="text-white text-sm capitalize">{postureMetrics.status}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed View Overlay */}
                  {detailedView && isSessionActive && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur rounded-lg p-4">
                        <div className="grid grid-cols-4 gap-4 text-white">
                          <div>
                            <p className="text-xs opacity-75">Head Angle</p>
                            <p className="font-mono">{postureMetrics.headAngle.toFixed(1)}°</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-75">Shoulders</p>
                            <p className="font-mono">{postureMetrics.shoulderSymmetry.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-75">Spine</p>
                            <p className="font-mono">{postureMetrics.spineAlignment.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-75">Score</p>
                            <p className="font-mono">{postureMetrics.overallScore}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alert Notification */}
                  {isSessionActive && postureDetection.currentAlert && !postureDetection.currentAlert.dismissed && (
                    <div className="absolute bottom-20 left-4 right-4">
                      <div className="bg-amber-500/90 backdrop-blur rounded-lg p-4 shadow-lg animate-pulse">
                        <div className="flex items-center gap-3 text-white">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold capitalize">{postureDetection.currentAlert.type} Alert</p>
                            <p className="text-sm opacity-90">{postureDetection.currentAlert.message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => postureDetection.dismissAlert()}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Session Controls */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex justify-center items-center space-x-4">
                    {!isSessionActive ? (
                      <Button 
                        onClick={startSession}
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Session
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => setIsPaused(!isPaused)}
                          variant="outline"
                          size="lg"
                        >
                          {isPaused ? (
                            <Play className="w-5 h-5 mr-2" />
                          ) : (
                            <Pause className="w-5 h-5 mr-2" />
                          )}
                          {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <Button
                          onClick={stopSession}
                          variant="destructive"
                          size="lg"
                        >
                          <Square className="w-5 h-5 mr-2" />
                          End Session
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Stats */}
            {isSessionActive && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Good Posture</p>
                    <p className="text-2xl font-bold text-green-600">{goodPosturePercent.toFixed(0)}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{alertsReceived}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Correction Speed</p>
                    <p className="text-2xl font-bold text-blue-600">{correctionSpeed}s</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">Points</p>
                    <p className="text-2xl font-bold text-purple-600">+{Math.floor(sessionTime / 60) * 10}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Real-time Metrics
                </CardTitle>
                {!postureDetection.isModelLoaded && (
                  <CardDescription>
                    Loading AI model... {postureDetection.loadingProgress}%
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className={`text-sm font-bold ${getStatusTextColor(postureMetrics.status)}`}>
                      {postureMetrics.overallScore}%
                    </span>
                  </div>
                  <Progress value={postureMetrics.overallScore} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Head Angle</span>
                      <span className="text-xs">{Math.abs(postureMetrics.headAngle).toFixed(1)}°</span>
                    </div>
                    <Progress 
                      value={Math.max(0, 100 - Math.abs(postureMetrics.headAngle) * 5)} 
                      className="h-1" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Shoulder Symmetry</span>
                      <span className="text-xs">{(100 - postureMetrics.shoulderSymmetry).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={100 - postureMetrics.shoulderSymmetry} 
                      className="h-1" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Spine Alignment</span>
                      <span className="text-xs">{(100 - postureMetrics.spineAlignment).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={100 - postureMetrics.spineAlignment} 
                      className="h-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Settings</CardTitle>
                <CardDescription>
                  Customize your posture alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Sensitivity</Label>
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={10}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Alert Delay</Label>
                  <Slider
                    defaultValue={[30]}
                    max={120}
                    step={15}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Seconds before alert</p>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Haptic Feedback</Label>
                  <Switch defaultChecked={true} />
                </div>
              </CardContent>
            </Card>

            {/* Next Break */}
            {isSessionActive && (
              <Card>
                <CardHeader>
                  <CardTitle>Next Break</CardTitle>
                </CardHeader>
                <CardContent>
                  {nextBreakMinutes !== null ? (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">
                        {Math.floor(nextBreakMinutes / 60) > 0
                          ? `${Math.floor(nextBreakMinutes / 60)}h ${nextBreakMinutes % 60}m`
                          : `${nextBreakMinutes}m`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentBreakType === 'micro' && 'Micro Break (2-3 min)'}
                        {currentBreakType === 'standard' && 'Standard Break (5-7 min)'}
                        {currentBreakType === 'extended' && 'Extended Break (10-15 min)'}
                        {!currentBreakType && 'Next scheduled break'}
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        <p>Breaks completed: {breaksCompleted}</p>
                        {breaksSkipped > 0 && <p className="text-amber-600">Skipped: {breaksSkipped}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Calculating next break...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Workstation Dialog */}
      {user && (
        <AddWorkstationDialog
          open={showAddWorkstationDialog}
          onOpenChange={setShowAddWorkstationDialog}
          userId={user.id}
          onWorkstationCreated={handleWorkstationCreated}
        />
      )}

      {/* Session Summary */}
      {showSessionSummary && sessionAnalytics && (
        <SessionSummary
          analytics={sessionAnalytics}
          duration={Math.floor(sessionTime / 60)}
          onClose={() => setShowSessionSummary(false)}
          onStartNew={() => {
            setShowSessionSummary(false)
            startSession()
          }}
          onViewDashboard={() => {
            window.location.href = '/dashboard'
          }}
          onDoExercises={() => {
            window.location.href = '/exercises'
          }}
        />
      )}

      {/* Break Warning/Reminder */}
      {breakMode === 'warning' && currentBreakType && (
        <BreakReminder
          type={currentBreakType}
          mode="warning"
          minutesUntil={nextBreakMinutes ?? 2}
          onStartBreak={handleStartBreak}
          onSnooze={handleSnoozeBreak}
          onSkip={handleSkipBreak}
          onDismiss={() => setBreakMode('none')}
          maxSnoozesReached={maxSnoozesReached}
        />
      )}

      {breakMode === 'reminder' && currentBreakType && (
        <BreakReminder
          type={currentBreakType}
          mode="break"
          onStartBreak={handleStartBreak}
          onSnooze={handleSnoozeBreak}
          onSkip={handleSkipBreak}
          maxSnoozesReached={maxSnoozesReached}
        />
      )}

      {/* Break Routine */}
      {breakMode === 'routine' && breakExercises.length > 0 && (
        <BreakRoutine
          exercises={breakExercises}
          onComplete={handleCompleteBreakRoutine}
          onExit={handleExitBreak}
        />
      )}

      {/* Break Completion */}
      {breakMode === 'completion' && currentBreakType && (
        <BreakCompletion
          breakType={currentBreakType}
          exercisesCompleted={completedBreakExercises.length}
          totalExercises={breakExercises.length}
          duration={currentBreakType === 'micro' ? 3 : currentBreakType === 'standard' ? 6 : 12}
          pointsEarned={currentBreakType === 'micro' ? 10 : currentBreakType === 'standard' ? 25 : 50}
          streak={breaksCompleted + 1}
          onReturnToWork={handleFinishBreak}
          onDoAnotherBreak={() => {
            setBreakMode('reminder')
          }}
        />
      )}
    </div>
  )
}