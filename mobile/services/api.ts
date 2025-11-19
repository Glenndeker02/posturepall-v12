import axios, { AxiosInstance } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type {
  User,
  PostureSession,
  BreakSession,
  Analytics,
  PairingResponse,
  SyncRequest,
  SyncResponse,
  Exercise
} from '../types'

const API_URL = process.env.API_URL || 'http://localhost:3000'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor for auth
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('sessionToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // ==================== PAIRING ====================

  async pairDevice(qrCode: string, deviceId: string): Promise<PairingResponse> {
    const { data } = await this.client.post<PairingResponse>('/pair', {
      qrCode,
      deviceId,
    })

    // Store user data locally
    if (data.success) {
      await AsyncStorage.setItem('user', JSON.stringify(data.user))
      await AsyncStorage.setItem('deviceId', deviceId)
    }

    return data
  }

  // ==================== USER ====================

  async getUser(userId: string): Promise<{ success: boolean; user: User }> {
    const { data } = await this.client.get(`/user?userId=${userId}`)
    return data
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user: User }> {
    const { data } = await this.client.put('/user', {
      userId,
      ...updates,
    })
    return data
  }

  // ==================== ANALYTICS ====================

  async getAnalytics(
    userId: string,
    timeRange: 'week' | 'month' | 'quarter' | 'year' = 'week'
  ): Promise<{ success: boolean; analytics: Analytics }> {
    const { data } = await this.client.get(`/analytics?userId=${userId}&timeRange=${timeRange}`)
    return data
  }

  // ==================== SESSIONS ====================

  async getSessions(userId: string, limit: number = 20): Promise<{ success: boolean; sessions: PostureSession[] }> {
    const { data} = await this.client.get(`/sessions?userId=${userId}&limit=${limit}`)
    return data
  }

  async createSession(session: Partial<PostureSession>): Promise<{ success: boolean; session: PostureSession }> {
    const { data } = await this.client.post('/sessions', session)
    return data
  }

  // ==================== BREAKS ====================

  async getBreaks(userId: string, limit: number = 20): Promise<{ success: boolean; breakSessions: BreakSession[] }> {
    const { data } = await this.client.get(`/breaks?userId=${userId}&limit=${limit}`)
    return data
  }

  async createBreak(breakSession: Partial<BreakSession>): Promise<{ success: boolean; breakSession: BreakSession }> {
    const { data } = await this.client.post('/breaks', breakSession)
    return data
  }

  // ==================== SYNC ====================

  async syncData(syncRequest: SyncRequest): Promise<SyncResponse> {
    const { data } = await this.client.post<SyncResponse>('/sync', syncRequest)
    return data
  }

  async getUnsyncedData(userId: string, deviceId: string, lastSyncTime?: string): Promise<any> {
    let url = `/sync?userId=${userId}&deviceId=${deviceId}`
    if (lastSyncTime) {
      url += `&lastSyncTime=${lastSyncTime}`
    }
    const { data } = await this.client.get(url)
    return data
  }

  // ==================== EXERCISES ====================

  async getExercises(): Promise<Exercise[]> {
    // For now, return mock data since we don't have an exercises API endpoint yet
    // In production, this would fetch from /api/exercises
    return []
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<{ message: string }> {
    const { data } = await this.client.get('/health')
    return data
  }
}

export default new ApiService()
