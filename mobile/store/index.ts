import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type {
  User,
  PostureMetrics,
  Analytics,
  Exercise,
  BreakSession,
  Achievement
} from '../types'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  deviceId: string | null

  // Posture state
  currentPosture: PostureMetrics | null
  postureHistory: PostureMetrics[]

  // Analytics state
  analytics: Analytics | null
  analyticsLoading: boolean

  // Exercises state
  exercises: Exercise[]
  favoriteExercises: string[]
  currentWorkout: BreakSession | null

  // Sync state
  lastSyncTime: string | null
  isSyncing: boolean

  // Achievements
  achievements: Achievement[]
  unreadAchievements: number

  // Actions
  setUser: (user: User | null) => void
  setDeviceId: (deviceId: string) => void
  setAuthenticated: (isAuth: boolean) => void

  updatePosture: (posture: PostureMetrics) => void
  setAnalytics: (analytics: Analytics | null) => void
  setAnalyticsLoading: (loading: boolean) => void

  setExercises: (exercises: Exercise[]) => void
  toggleFavorite: (exerciseId: string) => void
  startWorkout: (workout: BreakSession) => void
  completeWorkout: () => void

  setSyncTime: (time: string) => void
  setIsSyncing: (syncing: boolean) => void

  addAchievement: (achievement: Achievement) => void
  markAchievementsRead: () => void

  // Persistence
  loadFromStorage: () => Promise<void>
  clearStorage: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  deviceId: null,
  currentPosture: null,
  postureHistory: [],
  analytics: null,
  analyticsLoading: false,
  exercises: [],
  favoriteExercises: [],
  currentWorkout: null,
  lastSyncTime: null,
  isSyncing: false,
  achievements: [],
  unreadAchievements: 0,

  // Actions
  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user))
    } else {
      AsyncStorage.removeItem('user')
    }
  },

  setDeviceId: (deviceId) => {
    set({ deviceId })
    AsyncStorage.setItem('deviceId', deviceId)
  },

  setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

  updatePosture: (posture) => {
    const { postureHistory } = get()
    const newHistory = [posture, ...postureHistory].slice(0, 100) // Keep last 100
    set({ currentPosture: posture, postureHistory: newHistory })
  },

  setAnalytics: (analytics) => set({ analytics }),
  setAnalyticsLoading: (loading) => set({ analyticsLoading: loading }),

  setExercises: (exercises) => {
    set({ exercises })
    AsyncStorage.setItem('exercises', JSON.stringify(exercises))
  },

  toggleFavorite: (exerciseId) => {
    const { favoriteExercises } = get()
    const newFavorites = favoriteExercises.includes(exerciseId)
      ? favoriteExercises.filter(id => id !== exerciseId)
      : [...favoriteExercises, exerciseId]
    set({ favoriteExercises: newFavorites })
    AsyncStorage.setItem('favoriteExercises', JSON.stringify(newFavorites))
  },

  startWorkout: (workout) => set({ currentWorkout: workout }),
  completeWorkout: () => set({ currentWorkout: null }),

  setSyncTime: (time) => {
    set({ lastSyncTime: time })
    AsyncStorage.setItem('lastSyncTime', time)
  },

  setIsSyncing: (syncing) => set({ isSyncing: syncing }),

  addAchievement: (achievement) => {
    const { achievements, unreadAchievements } = get()
    set({
      achievements: [achievement, ...achievements],
      unreadAchievements: unreadAchievements + 1,
    })
  },

  markAchievementsRead: () => set({ unreadAchievements: 0 }),

  loadFromStorage: async () => {
    try {
      const [user, deviceId, lastSyncTime, favoriteExercises, exercises] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('deviceId'),
        AsyncStorage.getItem('lastSyncTime'),
        AsyncStorage.getItem('favoriteExercises'),
        AsyncStorage.getItem('exercises'),
      ])

      set({
        user: user ? JSON.parse(user) : null,
        isAuthenticated: !!user,
        deviceId: deviceId || null,
        lastSyncTime: lastSyncTime || null,
        favoriteExercises: favoriteExercises ? JSON.parse(favoriteExercises) : [],
        exercises: exercises ? JSON.parse(exercises) : [],
      })
    } catch (error) {
      console.error('Error loading from storage:', error)
    }
  },

  clearStorage: async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'deviceId', 'lastSyncTime', 'favoriteExercises', 'exercises'])
      set({
        user: null,
        isAuthenticated: false,
        deviceId: null,
        lastSyncTime: null,
        favoriteExercises: [],
        exercises: [],
        currentWorkout: null,
        analytics: null,
        achievements: [],
      })
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  },
}))
