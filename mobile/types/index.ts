// Shared types for mobile app

export interface User {
  id: string
  email?: string
  name?: string
  image?: string
  subscriptionTier: string
  workEnvironment?: string
  dailySittingHours?: number
  painAreas?: string[]
  workSchedule?: WorkSchedule
  userGoals?: UserGoals
  calibrationData?: CalibrationData
  qrPairingCode?: string
  mobileDeviceId?: string
  createdAt: string
  updatedAt: string
}

export interface WorkSchedule {
  startTime: string
  endTime: string
  workDays: string[]
  breakFrequency: string
}

export interface UserGoals {
  primaryGoal: string
  commitmentLevel: string
  targetPostureScore?: number
  dailyBreaks?: number
}

export interface CalibrationData {
  headAngle: number
  shoulderSymmetry: number
  spineAlignment: number
  confidence: number
  timestamp: string
}

export interface PostureSession {
  id: string
  userId: string
  startTime: string
  endTime?: string
  duration?: number
  overallScore?: number
  goodPosturePercent?: number
  deviationBreakdown?: DeviationBreakdown
  alertsReceived?: number
  correctionSpeed?: number
  pointsEarned?: number
  mobileSynced: boolean
  createdAt: string
  updatedAt: string
}

export interface DeviationBreakdown {
  headForward?: number
  shoulderSlump?: number
  spineAlignment?: number
}

export interface BreakSession {
  id: string
  userId: string
  breakType: 'micro' | 'standard' | 'extended'
  exercises?: ExerciseCompletion[]
  duration?: number
  completed: boolean
  pointsEarned?: number
  mobileSynced: boolean
  createdAt: string
  updatedAt: string
}

export interface ExerciseCompletion {
  exerciseId: string
  name: string
  duration: number
  completed: boolean
}

export interface Exercise {
  id: string
  name: string
  category: 'neck' | 'shoulder' | 'back' | 'chest' | 'lower_body' | 'eye'
  description?: string
  instructions?: string[]
  duration?: number
  difficulty: 'gentle' | 'moderate' | 'deep'
  imageUrl?: string
  gifUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon?: string
  points?: number
  rarity: 'common' | 'rare' | 'legendary'
  condition?: any
  earnedAt?: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  targetValue?: number
  currentValue?: number
  unit?: string
  deadline?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Analytics {
  summary: {
    totalSessions: number
    totalDuration: number
    averageScore: number
    averageGoodPosture: number
    totalAlerts: number
    averageCorrectionSpeed: number
    completedBreaks: number
    totalBreaks: number
    breakCompletionRate: number
    currentStreak: number
    timeRange: string
  }
  dailyData: DailyData[]
  problemAreas: Record<string, number>
  recentSessions: PostureSession[]
}

export interface DailyData {
  date: string
  sessions: PostureSession[]
  totalDuration: number
  averageScore: number
  goodPosturePercent: number
}

export interface PairingResponse {
  success: boolean
  user: User
}

export interface SyncRequest {
  userId: string
  deviceId: string
  lastSyncTime?: string
  sessions: Partial<PostureSession>[]
  breaks: Partial<BreakSession>[]
}

export interface SyncResponse {
  success: boolean
  syncResults: {
    sessionsSynced: number
    breaksSynced: number
    errors: string[]
    webSessionsMarkedSynced: number
    webBreaksMarkedSynced: number
    syncTime: string
  }
}

export interface PostureMetrics {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  metrics: {
    headAngle: number
    shoulderSymmetry: number
    spineAlignment: number
  }
  timestamp: string
}
