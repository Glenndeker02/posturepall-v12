import * as SQLite from 'expo-sqlite'
import { PostureSession, BreakSession, User } from '../types'

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null
  private readonly DB_NAME = 'spinemate.db'

  /**
   * Initialize database and create tables
   */
  async initialize() {
    try {
      this.db = await SQLite.openDatabaseAsync(this.DB_NAME)
      await this.createTables()
      console.log('Database initialized successfully')
    } catch (error) {
      console.error('Database initialization error:', error)
      throw error
    }
  }

  /**
   * Create database tables
   */
  private async createTables() {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.execAsync(`
      -- User table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT,
        name TEXT,
        image TEXT,
        subscriptionTier TEXT DEFAULT 'free',
        workEnvironment TEXT,
        dailySittingHours INTEGER,
        painAreas TEXT,
        workSchedule TEXT,
        userGoals TEXT,
        calibrationData TEXT,
        qrPairingCode TEXT,
        mobileDeviceId TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        syncedAt TEXT
      );

      -- Posture Sessions table
      CREATE TABLE IF NOT EXISTS posture_sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT,
        duration INTEGER DEFAULT 0,
        averageScore REAL DEFAULT 0,
        postureData TEXT,
        deviationBreakdown TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      -- Break Sessions table
      CREATE TABLE IF NOT EXISTS break_sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        exerciseId TEXT,
        startTime TEXT NOT NULL,
        endTime TEXT,
        duration INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      -- Analytics Cache table
      CREATE TABLE IF NOT EXISTS analytics_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        timeRange TEXT NOT NULL,
        data TEXT NOT NULL,
        cachedAt TEXT NOT NULL,
        UNIQUE(userId, timeRange)
      );

      -- Sync Queue table
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        UNIQUE(entityType, entityId, action)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_posture_sessions_user ON posture_sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_posture_sessions_synced ON posture_sessions(synced);
      CREATE INDEX IF NOT EXISTS idx_break_sessions_user ON break_sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_break_sessions_synced ON break_sessions(synced);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(createdAt);
    `)
  }

  // ============================================
  // USER OPERATIONS
  // ============================================

  async saveUser(user: User) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO users (
          id, email, name, image, subscriptionTier, workEnvironment,
          dailySittingHours, painAreas, workSchedule, userGoals,
          calibrationData, qrPairingCode, mobileDeviceId,
          createdAt, updatedAt, syncedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email || null,
          user.name || null,
          user.image || null,
          user.subscriptionTier || 'free',
          user.workEnvironment || null,
          user.dailySittingHours || null,
          user.painAreas || null,
          user.workSchedule || null,
          user.userGoals || null,
          user.calibrationData || null,
          user.qrPairingCode || null,
          user.mobileDeviceId || null,
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      )
    } catch (error) {
      console.error('Error saving user:', error)
      throw error
    }
  }

  async getUser(userId: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      )
      return result ? this.parseUser(result) : null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // ============================================
  // POSTURE SESSION OPERATIONS
  // ============================================

  async savePostureSession(session: PostureSession) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO posture_sessions (
          id, userId, startTime, endTime, duration, averageScore,
          postureData, deviationBreakdown, createdAt, updatedAt, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          session.userId,
          session.startTime,
          session.endTime || null,
          session.duration,
          session.averageScore,
          session.postureData || null,
          session.deviationBreakdown || null,
          session.createdAt,
          session.updatedAt,
          0, // Not synced
        ]
      )

      // Add to sync queue
      await this.addToSyncQueue('posture_session', session.id, 'upsert', session)
    } catch (error) {
      console.error('Error saving posture session:', error)
      throw error
    }
  }

  async getPostureSessions(userId: string, limit: number = 50): Promise<PostureSession[]> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM posture_sessions WHERE userId = ? ORDER BY startTime DESC LIMIT ?',
        [userId, limit]
      )
      return results.map(this.parsePostureSession)
    } catch (error) {
      console.error('Error getting posture sessions:', error)
      return []
    }
  }

  async getUnsyncedPostureSessions(): Promise<PostureSession[]> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM posture_sessions WHERE synced = 0 ORDER BY createdAt ASC'
      )
      return results.map(this.parsePostureSession)
    } catch (error) {
      console.error('Error getting unsynced sessions:', error)
      return []
    }
  }

  async markSessionSynced(sessionId: string) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync(
        'UPDATE posture_sessions SET synced = 1 WHERE id = ?',
        [sessionId]
      )
    } catch (error) {
      console.error('Error marking session synced:', error)
    }
  }

  // ============================================
  // BREAK SESSION OPERATIONS
  // ============================================

  async saveBreakSession(session: BreakSession) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO break_sessions (
          id, userId, exerciseId, startTime, endTime, duration,
          completed, createdAt, updatedAt, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          session.userId,
          session.exerciseId || null,
          session.startTime,
          session.endTime || null,
          session.duration,
          session.completed ? 1 : 0,
          session.createdAt,
          session.updatedAt,
          0,
        ]
      )

      await this.addToSyncQueue('break_session', session.id, 'upsert', session)
    } catch (error) {
      console.error('Error saving break session:', error)
      throw error
    }
  }

  async getBreakSessions(userId: string, limit: number = 50): Promise<BreakSession[]> {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM break_sessions WHERE userId = ? ORDER BY startTime DESC LIMIT ?',
        [userId, limit]
      )
      return results.map(this.parseBreakSession)
    } catch (error) {
      console.error('Error getting break sessions:', error)
      return []
    }
  }

  // ============================================
  // ANALYTICS CACHE
  // ============================================

  async cacheAnalytics(userId: string, timeRange: string, data: any) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO analytics_cache (userId, timeRange, data, cachedAt)
         VALUES (?, ?, ?, ?)`,
        [userId, timeRange, JSON.stringify(data), new Date().toISOString()]
      )
    } catch (error) {
      console.error('Error caching analytics:', error)
    }
  }

  async getCachedAnalytics(userId: string, timeRange: string, maxAgeMinutes: number = 30) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString()
      const result = await this.db.getFirstAsync<any>(
        `SELECT data FROM analytics_cache
         WHERE userId = ? AND timeRange = ? AND cachedAt > ?`,
        [userId, timeRange, cutoffTime]
      )
      return result ? JSON.parse(result.data) : null
    } catch (error) {
      console.error('Error getting cached analytics:', error)
      return null
    }
  }

  // ============================================
  // SYNC QUEUE
  // ============================================

  private async addToSyncQueue(entityType: string, entityId: string, action: string, payload: any) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO sync_queue (entityType, entityId, action, payload, createdAt, attempts)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [entityType, entityId, action, JSON.stringify(payload), new Date().toISOString()]
      )
    } catch (error) {
      console.error('Error adding to sync queue:', error)
    }
  }

  async getSyncQueue(limit: number = 100) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM sync_queue ORDER BY createdAt ASC LIMIT ?',
        [limit]
      )
      return results.map((row) => ({
        id: row.id,
        entityType: row.entityType,
        entityId: row.entityId,
        action: row.action,
        payload: JSON.parse(row.payload),
        createdAt: row.createdAt,
        attempts: row.attempts,
      }))
    } catch (error) {
      console.error('Error getting sync queue:', error)
      return []
    }
  }

  async removeSyncQueueItem(id: number) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id])
    } catch (error) {
      console.error('Error removing sync queue item:', error)
    }
  }

  async incrementSyncAttempts(id: number) {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.runAsync(
        'UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?',
        [id]
      )
    } catch (error) {
      console.error('Error incrementing sync attempts:', error)
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  async clearAllData() {
    if (!this.db) throw new Error('Database not initialized')

    try {
      await this.db.execAsync(`
        DELETE FROM users;
        DELETE FROM posture_sessions;
        DELETE FROM break_sessions;
        DELETE FROM analytics_cache;
        DELETE FROM sync_queue;
      `)
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }

  async getDatabaseStats() {
    if (!this.db) throw new Error('Database not initialized')

    try {
      const users = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM users'
      )
      const sessions = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM posture_sessions'
      )
      const breaks = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM break_sessions'
      )
      const queueSize = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM sync_queue'
      )

      return {
        users: users?.count || 0,
        sessions: sessions?.count || 0,
        breaks: breaks?.count || 0,
        queueSize: queueSize?.count || 0,
      }
    } catch (error) {
      console.error('Error getting database stats:', error)
      return { users: 0, sessions: 0, breaks: 0, queueSize: 0 }
    }
  }

  // ============================================
  // PARSERS
  // ============================================

  private parseUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      image: row.image,
      subscriptionTier: row.subscriptionTier,
      workEnvironment: row.workEnvironment,
      dailySittingHours: row.dailySittingHours,
      painAreas: row.painAreas,
      workSchedule: row.workSchedule,
      userGoals: row.userGoals,
      calibrationData: row.calibrationData,
      qrPairingCode: row.qrPairingCode,
      mobileDeviceId: row.mobileDeviceId,
    }
  }

  private parsePostureSession(row: any): PostureSession {
    return {
      id: row.id,
      userId: row.userId,
      startTime: row.startTime,
      endTime: row.endTime,
      duration: row.duration,
      averageScore: row.averageScore,
      postureData: row.postureData,
      deviationBreakdown: row.deviationBreakdown,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  private parseBreakSession(row: any): BreakSession {
    return {
      id: row.id,
      userId: row.userId,
      exerciseId: row.exerciseId,
      startTime: row.startTime,
      endTime: row.endTime,
      duration: row.duration,
      completed: row.completed === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()

// Helper functions
export async function initializeDatabase() {
  return databaseService.initialize()
}
