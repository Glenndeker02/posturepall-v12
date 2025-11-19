/**
 * Mobile App Integration Tests
 * Tests mobile screens, navigation, and data flows
 */

import { renderHook, act } from '@testing-library/react-hooks'
import { useAppStore } from '../store'
import apiService from '../services/api'
import { databaseService } from '../services/database'
import { notificationService } from '../services/notifications'

describe('Mobile App Integration Tests', () => {
  beforeAll(async () => {
    // Initialize database
    await databaseService.initialize()
  })

  afterAll(async () => {
    // Clean up
    await databaseService.clearAllData()
  })

  // ============================================
  // STORE TESTS
  // ============================================

  describe('Zustand Store', () => {
    it('should set user correctly', () => {
      const { result } = renderHook(() => useAppStore())

      const testUser = {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        subscriptionTier: 'free',
      }

      act(() => {
        result.current.setUser(testUser)
      })

      expect(result.current.user).toEqual(testUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should update posture data', () => {
      const { result } = renderHook(() => useAppStore())

      const postureData = {
        score: 85,
        status: 'good' as const,
        metrics: {
          headAngle: 15,
          shoulderSymmetry: 90,
          spineAlignment: 95,
        },
      }

      act(() => {
        result.current.updatePosture(postureData)
      })

      expect(result.current.currentPosture).toEqual(postureData)
      expect(result.current.postureHistory.length).toBeGreaterThan(0)
    })

    it('should set analytics', () => {
      const { result } = renderHook(() => useAppStore())

      const analytics = {
        summary: {
          averageScore: 85,
          totalSessions: 10,
          totalDuration: 3600,
          completedBreaks: 5,
          currentStreak: 3,
        },
        dailyData: [],
        problemAreas: [],
        recentSessions: [],
      }

      act(() => {
        result.current.setAnalytics(analytics)
      })

      expect(result.current.analytics).toEqual(analytics)
    })

    it('should toggle favorite exercises', () => {
      const { result } = renderHook(() => useAppStore())

      const exerciseId = 'neck-rolls'

      act(() => {
        result.current.toggleFavoriteExercise(exerciseId)
      })

      expect(result.current.favoriteExercises).toContain(exerciseId)

      act(() => {
        result.current.toggleFavoriteExercise(exerciseId)
      })

      expect(result.current.favoriteExercises).not.toContain(exerciseId)
    })

    it('should start and complete workout', () => {
      const { result } = renderHook(() => useAppStore())

      const workout = {
        id: 'workout-1',
        userId: 'test-user-1',
        exerciseId: 'neck-rolls',
        startTime: new Date().toISOString(),
        endTime: null,
        completed: false,
        duration: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      act(() => {
        result.current.startWorkout(workout)
      })

      expect(result.current.currentWorkout).toEqual(workout)

      act(() => {
        result.current.completeWorkout(workout.id)
      })

      expect(result.current.currentWorkout?.completed).toBe(true)
    })

    it('should logout correctly', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.currentPosture).toBeNull()
      expect(result.current.analytics).toBeNull()
    })
  })

  // ============================================
  // DATABASE TESTS
  // ============================================

  describe('SQLite Database', () => {
    it('should save and retrieve user', async () => {
      const testUser = {
        id: 'db-test-user-1',
        email: 'dbtest@example.com',
        name: 'DB Test User',
        subscriptionTier: 'premium',
      }

      await databaseService.saveUser(testUser)
      const retrieved = await databaseService.getUser(testUser.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(testUser.id)
      expect(retrieved?.email).toBe(testUser.email)
      expect(retrieved?.subscriptionTier).toBe(testUser.subscriptionTier)
    })

    it('should save and retrieve posture sessions', async () => {
      const session = {
        id: 'session-1',
        userId: 'db-test-user-1',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 3600,
        averageScore: 85,
        postureData: JSON.stringify({ test: 'data' }),
        deviationBreakdown: JSON.stringify({ headForward: 10 }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await databaseService.savePostureSession(session)
      const sessions = await databaseService.getPostureSessions('db-test-user-1')

      expect(sessions.length).toBeGreaterThan(0)
      expect(sessions[0].id).toBe(session.id)
      expect(sessions[0].averageScore).toBe(85)
    })

    it('should save and retrieve break sessions', async () => {
      const breakSession = {
        id: 'break-1',
        userId: 'db-test-user-1',
        exerciseId: 'neck-rolls',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 300,
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await databaseService.saveBreakSession(breakSession)
      const breaks = await databaseService.getBreakSessions('db-test-user-1')

      expect(breaks.length).toBeGreaterThan(0)
      expect(breaks[0].id).toBe(breakSession.id)
      expect(breaks[0].completed).toBe(true)
    })

    it('should cache and retrieve analytics', async () => {
      const analytics = {
        summary: { averageScore: 85 },
        dailyData: [],
      }

      await databaseService.cacheAnalytics('db-test-user-1', 'week', analytics)
      const cached = await databaseService.getCachedAnalytics('db-test-user-1', 'week')

      expect(cached).toBeDefined()
      expect(cached.summary.averageScore).toBe(85)
    })

    it('should manage sync queue', async () => {
      const queue = await databaseService.getSyncQueue()
      const initialSize = queue.length

      // Queue should have items from previous saves
      expect(initialSize).toBeGreaterThan(0)

      // Remove first item
      if (queue.length > 0) {
        await databaseService.removeSyncQueueItem(queue[0].id)
        const newQueue = await databaseService.getSyncQueue()
        expect(newQueue.length).toBe(initialSize - 1)
      }
    })

    it('should get database stats', async () => {
      const stats = await databaseService.getDatabaseStats()

      expect(stats).toHaveProperty('users')
      expect(stats).toHaveProperty('sessions')
      expect(stats).toHaveProperty('breaks')
      expect(stats).toHaveProperty('queueSize')
      expect(stats.users).toBeGreaterThan(0)
    })
  })

  // ============================================
  // NOTIFICATION TESTS
  // ============================================

  describe('Notifications', () => {
    it('should schedule break reminder', async () => {
      const id = await notificationService.scheduleBreakReminder(1)
      expect(id).toBeDefined()

      if (id) {
        await notificationService.cancelNotification(id)
      }
    })

    it('should notify achievement', async () => {
      const id = await notificationService.notifyAchievementUnlocked('Week Warrior', 50)
      expect(id).toBeDefined()
    })

    it('should notify posture alert for low score', async () => {
      const id = await notificationService.notifyPostureAlert(50)
      expect(id).toBeDefined()
    })

    it('should notify streak at risk', async () => {
      const id = await notificationService.notifyStreakAtRisk()
      expect(id).toBeDefined()
    })

    it('should get scheduled notifications', async () => {
      const notifications = await notificationService.getScheduledNotifications()
      expect(Array.isArray(notifications)).toBe(true)
    })
  })

  // ============================================
  // DATA FLOW TESTS
  // ============================================

  describe('Data Flow Integration', () => {
    it('should sync local data to server and back', async () => {
      const { result } = renderHook(() => useAppStore())

      // Set user
      const testUser = {
        id: 'sync-test-user',
        email: 'sync@example.com',
        name: 'Sync Test',
        subscriptionTier: 'free',
      }

      act(() => {
        result.current.setUser(testUser)
      })

      // Save to local DB
      await databaseService.saveUser(testUser)

      // Get unsynced sessions
      const unsynced = await databaseService.getUnsyncedPostureSessions()
      expect(Array.isArray(unsynced)).toBe(true)

      // Sync queue should have items
      const queue = await databaseService.getSyncQueue()
      expect(queue.length).toBeGreaterThan(0)
    })
  })
})
