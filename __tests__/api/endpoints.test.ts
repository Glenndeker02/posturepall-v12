/**
 * API Endpoint Integration Tests
 * Tests all API endpoints for correct functionality
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

describe('API Endpoints Integration Tests', () => {
  let testUserId: string
  let testSessionId: string
  let testBreakId: string
  let testQrCode: string

  // ============================================
  // PAIRING API TESTS
  // ============================================

  describe('/api/pair', () => {
    it('should generate QR code for pairing', async () => {
      const response = await fetch(`${API_BASE_URL}/api/pair`, {
        method: 'GET',
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('qrCode')
      expect(data).toHaveProperty('expiresAt')
      expect(data.qrCode).toHaveLength(8)

      testQrCode = data.qrCode
    })

    it('should pair device with QR code', async () => {
      const deviceId = 'test-device-123'

      const response = await fetch(`${API_BASE_URL}/api/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: testQrCode,
          deviceId,
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('id')
      expect(data.user.mobileDeviceId).toBe(deviceId)

      testUserId = data.user.id
    })
  })

  // ============================================
  // USER API TESTS
  // ============================================

  describe('/api/user', () => {
    it('should get user by ID', async () => {
      const response = await fetch(`${API_BASE_URL}/api/user?userId=${testUserId}`)

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('user')
      expect(data.user.id).toBe(testUserId)
    })

    it('should create new user', async () => {
      const newUser = {
        email: 'test@example.com',
        name: 'Test User',
        subscriptionTier: 'free',
      }

      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('user')
      expect(data.user.email).toBe(newUser.email)
      expect(data.user.name).toBe(newUser.name)
    })

    it('should update user profile', async () => {
      const updates = {
        userId: testUserId,
        name: 'Updated Name',
        painAreas: 'neck,shoulder',
        userGoals: 'Improve posture',
      }

      const response = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('user')
      expect(data.user.name).toBe(updates.name)
      expect(data.user.painAreas).toBe(updates.painAreas)
    })
  })

  // ============================================
  // SESSIONS API TESTS
  // ============================================

  describe('/api/sessions', () => {
    it('should create posture session', async () => {
      const session = {
        userId: testUserId,
        startTime: new Date().toISOString(),
        averageScore: 85,
        postureData: JSON.stringify({ headAngle: 15, shoulderSymmetry: 90 }),
        deviationBreakdown: JSON.stringify({ headForward: 10, shoulderSlump: 5 }),
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('session')
      expect(data.session.userId).toBe(testUserId)
      expect(data.session.averageScore).toBe(85)

      testSessionId = data.session.id
    })

    it('should get user sessions', async () => {
      const response = await fetch(`${API_BASE_URL}/api/sessions?userId=${testUserId}`)

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('sessions')
      expect(Array.isArray(data.sessions)).toBe(true)
      expect(data.sessions.length).toBeGreaterThan(0)
    })

    it('should update session', async () => {
      const updates = {
        sessionId: testSessionId,
        endTime: new Date().toISOString(),
        duration: 3600,
      }

      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('session')
      expect(data.session.duration).toBe(3600)
      expect(data.session.endTime).toBeDefined()
    })
  })

  // ============================================
  // BREAKS API TESTS
  // ============================================

  describe('/api/breaks', () => {
    it('should create break session', async () => {
      const breakSession = {
        userId: testUserId,
        exerciseId: 'neck-rolls',
        startTime: new Date().toISOString(),
        duration: 300,
        completed: true,
      }

      const response = await fetch(`${API_BASE_URL}/api/breaks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breakSession),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('breakSession')
      expect(data.breakSession.userId).toBe(testUserId)
      expect(data.breakSession.completed).toBe(true)

      testBreakId = data.breakSession.id
    })

    it('should get user break sessions', async () => {
      const response = await fetch(`${API_BASE_URL}/api/breaks?userId=${testUserId}`)

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('breaks')
      expect(Array.isArray(data.breaks)).toBe(true)
      expect(data.breaks.length).toBeGreaterThan(0)
    })
  })

  // ============================================
  // ANALYTICS API TESTS
  // ============================================

  describe('/api/analytics', () => {
    it('should get weekly analytics', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/analytics?userId=${testUserId}&timeRange=week`
      )

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('analytics')
      expect(data.analytics).toHaveProperty('summary')
      expect(data.analytics).toHaveProperty('dailyData')
      expect(data.analytics).toHaveProperty('problemAreas')
      expect(data.analytics).toHaveProperty('recentSessions')

      expect(data.analytics.summary).toHaveProperty('averageScore')
      expect(data.analytics.summary).toHaveProperty('totalSessions')
      expect(data.analytics.summary).toHaveProperty('currentStreak')
    })

    it('should get monthly analytics', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/analytics?userId=${testUserId}&timeRange=month`
      )

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('analytics')
      expect(Array.isArray(data.analytics.dailyData)).toBe(true)
    })
  })

  // ============================================
  // SYNC API TESTS
  // ============================================

  describe('/api/sync', () => {
    it('should sync data to server', async () => {
      const syncData = {
        userId: testUserId,
        deviceId: 'test-device-123',
        sessions: [
          {
            id: 'test-session-1',
            startTime: new Date().toISOString(),
            averageScore: 90,
          },
        ],
        breaks: [
          {
            id: 'test-break-1',
            startTime: new Date().toISOString(),
            completed: true,
          },
        ],
      }

      const response = await fetch(`${API_BASE_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncData),
      })

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('syncedAt')
    })

    it('should get unsynced data', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/sync?userId=${testUserId}&lastSyncTime=${new Date(0).toISOString()}`
      )

      expect(response.status).toBe(200)
      const data = await response.json()

      expect(data).toHaveProperty('sessions')
      expect(data).toHaveProperty('breaks')
      expect(data).toHaveProperty('user')
      expect(Array.isArray(data.sessions)).toBe(true)
      expect(Array.isArray(data.breaks)).toBe(true)
    })
  })

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling', () => {
    it('should return 400 for invalid user ID', async () => {
      const response = await fetch(`${API_BASE_URL}/api/user?userId=invalid-id-123`)

      expect(response.status).toBe(404)
    })

    it('should return 400 for missing required fields', async () => {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
    })

    it('should return 404 for non-existent endpoint', async () => {
      const response = await fetch(`${API_BASE_URL}/api/nonexistent`)

      expect(response.status).toBe(404)
    })
  })
})
