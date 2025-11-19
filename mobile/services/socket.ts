import { io, Socket } from 'socket.io-client'
import type { PostureMetrics, Achievement, Goal } from '../types'

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:3000'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function[]> = new Map()

  connect(userId: string, deviceId: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    this.socket = io(WEBSOCKET_URL, {
      auth: {
        userId,
        deviceId,
        type: 'mobile',
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server:', this.socket?.id)
      this.emit('mobile-connected', { userId, deviceId })
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server')
    })

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
    })

    // Listen for posture updates from webapp
    this.socket.on('posture-data', (data: PostureMetrics) => {
      this.trigger('posture-data', data)
    })

    // Listen for analytics updates
    this.socket.on('analytics-update', (data: any) => {
      this.trigger('analytics-update', data)
    })

    // Listen for new achievements
    this.socket.on('new-achievement', (achievement: Achievement) => {
      this.trigger('new-achievement', achievement)
    })

    // Listen for goal progress
    this.socket.on('goal-progress', (data: { goalId: string; progress: number }) => {
      this.trigger('goal-progress', data)
    })

    // Listen for break reminders
    this.socket.on('break-reminder', (data: { type: string; suggestedExercises: any[] }) => {
      this.trigger('break-reminder', data)
    })

    // Listen for pairing success
    this.socket.on('pairing-success', (data: { user: any; sessionToken: string }) => {
      this.trigger('pairing-success', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // ==================== EVENT EMITTERS ====================

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn(`Cannot emit "${event}": Socket not connected`)
    }
  }

  acknowledgePosture(timestamp: string) {
    this.emit('acknowledge-posture', { timestamp })
  }

  startBreak(breakId: string) {
    this.emit('break-started', { breakId })
  }

  completeBreak(breakId: string, exercises: any[]) {
    this.emit('break-completed', { breakId, exercises })
  }

  // ==================== EVENT LISTENERS ====================

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)

    // Return cleanup function
    return () => this.off(event, callback)
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private trigger(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }
}

export default new SocketService()
