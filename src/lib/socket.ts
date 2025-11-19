import { Server, Socket } from 'socket.io'
import { achievementSystem } from './achievements'

interface SocketUser {
  userId: string
  deviceId?: string
  deviceType: 'web' | 'mobile'
  socketId: string
}

// Track connected users
const connectedUsers = new Map<string, SocketUser[]>()

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)

    // Get user info from handshake
    const { userId, deviceId, type } = socket.handshake.auth as {
      userId?: string
      deviceId?: string
      type?: 'web' | 'mobile'
    }

    if (userId) {
      // Register user connection
      registerUser(userId, socket.id, deviceId, type || 'web')
      socket.join(`user:${userId}`)
      console.log(`User ${userId} connected as ${type} (${deviceId || 'no device'})`)
    }

    // ============================================
    // AUTHENTICATION & PAIRING EVENTS
    // ============================================

    // Mobile device connected
    socket.on('mobile-connected', (data: { userId: string; deviceId: string }) => {
      console.log(`Mobile device connected: ${data.deviceId}`)
      socket.join(`user:${data.userId}`)
      registerUser(data.userId, socket.id, data.deviceId, 'mobile')

      // Notify web client
      socket.to(`user:${data.userId}`).emit('device-paired', {
        deviceId: data.deviceId,
        deviceType: 'mobile',
        timestamp: new Date().toISOString(),
      })
    })

    // Generate QR code for pairing
    socket.on('generate-qr', async (data: { userId: string }) => {
      const qrCode = generateQRCode()
      socket.emit('qr-generated', {
        qrCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })
    })

    // ============================================
    // POSTURE DATA STREAMING
    // ============================================

    // Real-time posture data from web to mobile
    socket.on('posture-data', (data: any) => {
      if (userId) {
        // Broadcast to all user's mobile devices
        socket.to(`user:${userId}`).emit('posture-data', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Acknowledge posture update
    socket.on('acknowledge-posture', (data: { sessionId: string }) => {
      if (userId) {
        socket.to(`user:${userId}`).emit('posture-acknowledged', data)
      }
    })

    // ============================================
    // ANALYTICS & PROGRESS
    // ============================================

    // Analytics updated
    socket.on('analytics-update', (data: any) => {
      if (userId) {
        socket.to(`user:${userId}`).emit('analytics-update', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Goal progress updated
    socket.on('goal-updated', (data: any) => {
      if (userId) {
        io.to(`user:${userId}`).emit('goal-progress', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // ============================================
    // ACHIEVEMENTS
    // ============================================

    // Achievement unlocked
    socket.on('achievement-unlocked', async (data: { userId: string; achievementId: string }) => {
      const achievements = await achievementSystem.getAchievementsProgress(data.userId)
      const achievement = achievements.find((a) => a.id === data.achievementId)

      if (achievement) {
        io.to(`user:${data.userId}`).emit('new-achievement', {
          achievement,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Check achievements
    socket.on('check-achievements', async (data: { userId: string }) => {
      const newAchievements = await achievementSystem.checkAchievements(data.userId)

      if (newAchievements.length > 0) {
        const achievements = await achievementSystem.getAchievementsProgress(data.userId)
        const earned = achievements.filter((a) => newAchievements.includes(a.id))

        earned.forEach((achievement) => {
          io.to(`user:${data.userId}`).emit('new-achievement', {
            achievement,
            timestamp: new Date().toISOString(),
          })
        })
      }
    })

    // ============================================
    // BREAK & EXERCISE REMINDERS
    // ============================================

    // Break reminder
    socket.on('break-reminder', (data: any) => {
      if (userId) {
        io.to(`user:${userId}`).emit('break-reminder', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Break started
    socket.on('break-started', (data: { breakId: string }) => {
      if (userId) {
        socket.to(`user:${userId}`).emit('break-started', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Break completed
    socket.on('break-completed', (data: { breakId: string; exerciseId: string }) => {
      if (userId) {
        socket.to(`user:${userId}`).emit('break-completed', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // ============================================
    // DATA SYNC
    // ============================================

    // Request sync
    socket.on('sync-request', (data: { userId: string; deviceId: string; lastSyncTime: string }) => {
      // Trigger sync process
      socket.emit('sync-start', {
        timestamp: new Date().toISOString(),
      })

      // In a real implementation, this would fetch unsynced data
      // and send it back to the requesting device
      socket.emit('sync-complete', {
        timestamp: new Date().toISOString(),
      })
    })

    // ============================================
    // DEVICE MANAGEMENT
    // ============================================

    // Device pairing success
    socket.on('pairing-success', (data: { userId: string; deviceId: string }) => {
      io.to(`user:${data.userId}`).emit('pairing-success', {
        deviceId: data.deviceId,
        timestamp: new Date().toISOString(),
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      if (userId) {
        unregisterUser(userId, socket.id)

        // Notify other devices
        socket.to(`user:${userId}`).emit('mobile-disconnected', {
          deviceId,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Manual disconnect
    socket.on('disconnect-device', (data: { deviceId: string }) => {
      if (userId) {
        const userConnections = connectedUsers.get(userId) || []
        const device = userConnections.find((u) => u.deviceId === data.deviceId)

        if (device) {
          const deviceSocket = io.sockets.sockets.get(device.socketId)
          if (deviceSocket) {
            deviceSocket.disconnect()
          }
        }
      }
    })

    // ============================================
    // LEGACY MESSAGES (for backward compatibility)
    // ============================================

    socket.on('message', (msg: { text: string; senderId: string }) => {
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      })
    })

    // Send welcome message
    socket.emit('message', {
      text: 'Connected to SpineMate WebSocket Server',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    })
  })
}

// Helper functions
function registerUser(userId: string, socketId: string, deviceId?: string, deviceType: 'web' | 'mobile' = 'web') {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, [])
  }

  const users = connectedUsers.get(userId)!

  // Remove existing connection with same socket ID
  const existingIndex = users.findIndex((u) => u.socketId === socketId)
  if (existingIndex !== -1) {
    users.splice(existingIndex, 1)
  }

  users.push({
    userId,
    deviceId,
    deviceType,
    socketId,
  })
}

function unregisterUser(userId: string, socketId: string) {
  const users = connectedUsers.get(userId)
  if (!users) return

  const index = users.findIndex((u) => u.socketId === socketId)
  if (index !== -1) {
    users.splice(index, 1)
  }

  if (users.length === 0) {
    connectedUsers.delete(userId)
  }
}

function generateQRCode(): string {
  // Generate 8-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Export helper to get connected devices for a user
export function getUserDevices(userId: string): SocketUser[] {
  return connectedUsers.get(userId) || []
}