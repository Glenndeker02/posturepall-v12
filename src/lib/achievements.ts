import { db } from './db'
import { streakCalculator } from './streak-calculator'

interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'sessions' | 'quality' | 'breaks' | 'exercises' | 'timing'
  condition: (data: UserActivityData) => boolean
  points: number
}

interface UserActivityData {
  userId: string
  totalSessions: number
  currentStreak: number
  totalBreaks: number
  totalExercises: number
  averageScore: number
  recentSessionTime?: Date
  recentSessionScore?: number
}

/**
 * Achievement System
 * Automatically tracks and awards achievements based on user activity
 */
export class AchievementSystem {
  private achievements: AchievementDefinition[] = [
    // Streak Achievements
    {
      id: 'first-session',
      name: 'First Steps',
      description: 'Complete your first posture tracking session',
      icon: '🎯',
      category: 'sessions',
      condition: (data) => data.totalSessions >= 1,
      points: 10,
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day tracking streak',
      icon: '🔥',
      category: 'streak',
      condition: (data) => data.currentStreak >= 7,
      points: 50,
    },
    {
      id: 'streak-30',
      name: 'Monthly Master',
      description: 'Maintain a 30-day tracking streak',
      icon: '⭐',
      category: 'streak',
      condition: (data) => data.currentStreak >= 30,
      points: 200,
    },
    {
      id: 'streak-90',
      name: 'Consistency Champion',
      description: 'Maintain a 90-day tracking streak',
      icon: '👑',
      category: 'streak',
      condition: (data) => data.currentStreak >= 90,
      points: 500,
    },

    // Session Achievements
    {
      id: 'sessions-10',
      name: 'Getting Started',
      description: 'Complete 10 tracking sessions',
      icon: '📊',
      category: 'sessions',
      condition: (data) => data.totalSessions >= 10,
      points: 25,
    },
    {
      id: 'sessions-50',
      name: 'Committed User',
      description: 'Complete 50 tracking sessions',
      icon: '💪',
      category: 'sessions',
      condition: (data) => data.totalSessions >= 50,
      points: 100,
    },
    {
      id: 'sessions-100',
      name: 'Century Club',
      description: 'Complete 100 tracking sessions',
      icon: '🏆',
      category: 'sessions',
      condition: (data) => data.totalSessions >= 100,
      points: 250,
    },

    // Quality Achievements
    {
      id: 'perfect-day',
      name: 'Perfect Posture',
      description: 'Achieve 95%+ posture score in a session',
      icon: '✨',
      category: 'quality',
      condition: (data) => (data.recentSessionScore || 0) >= 95,
      points: 50,
    },
    {
      id: 'excellent-average',
      name: 'Posture Pro',
      description: 'Maintain an average score of 85%+',
      icon: '🌟',
      category: 'quality',
      condition: (data) => data.averageScore >= 85,
      points: 100,
    },

    // Break Achievements
    {
      id: 'break-master',
      name: 'Break Master',
      description: 'Complete 25 break exercises',
      icon: '☕',
      category: 'breaks',
      condition: (data) => data.totalBreaks >= 25,
      points: 75,
    },
    {
      id: 'break-enthusiast',
      name: 'Break Enthusiast',
      description: 'Complete 100 break exercises',
      icon: '🧘',
      category: 'breaks',
      condition: (data) => data.totalBreaks >= 100,
      points: 200,
    },

    // Exercise Achievements
    {
      id: 'exercise-starter',
      name: 'Exercise Beginner',
      description: 'Complete 5 different exercises',
      icon: '🏃',
      category: 'exercises',
      condition: (data) => data.totalExercises >= 5,
      points: 25,
    },
    {
      id: 'exercise-enthusiast',
      name: 'Exercise Enthusiast',
      description: 'Complete 25 different exercises',
      icon: '💪',
      category: 'exercises',
      condition: (data) => data.totalExercises >= 25,
      points: 100,
    },

    // Timing Achievements
    {
      id: 'early-bird',
      name: 'Early Bird',
      description: 'Complete a session before 9 AM',
      icon: '🌅',
      category: 'timing',
      condition: (data) => {
        if (!data.recentSessionTime) return false
        const hour = data.recentSessionTime.getHours()
        return hour < 9
      },
      points: 20,
    },
    {
      id: 'night-owl',
      name: 'Night Owl',
      description: 'Complete a session after 10 PM',
      icon: '🦉',
      category: 'timing',
      condition: (data) => {
        if (!data.recentSessionTime) return false
        const hour = data.recentSessionTime.getHours()
        return hour >= 22
      },
      points: 20,
    },
  ]

  /**
   * Check and award achievements for a user after an activity
   */
  async checkAchievements(userId: string): Promise<string[]> {
    try {
      // Gather user activity data
      const activityData = await this.getUserActivityData(userId)

      // Get existing achievements
      const existingAchievements = await db.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      })

      const existingIds = new Set(existingAchievements.map((a) => a.achievementId))

      // Check each achievement
      const newAchievements: string[] = []

      for (const achievement of this.achievements) {
        // Skip if already earned
        if (existingIds.has(achievement.id)) continue

        // Check if condition is met
        if (achievement.condition(activityData)) {
          // Award achievement
          await this.awardAchievement(userId, achievement)
          newAchievements.push(achievement.id)
        }
      }

      return newAchievements
    } catch (error) {
      console.error('Achievement check error:', error)
      return []
    }
  }

  /**
   * Award an achievement to a user
   */
  private async awardAchievement(userId: string, achievement: AchievementDefinition) {
    try {
      // Create achievement record if it doesn't exist
      let achievementRecord = await db.achievement.findUnique({
        where: { id: achievement.id },
      })

      if (!achievementRecord) {
        achievementRecord = await db.achievement.create({
          data: {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
          },
        })
      }

      // Award to user
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          earnedAt: new Date(),
        },
      })

      console.log(`Achievement awarded: ${achievement.name} to user ${userId}`)
    } catch (error) {
      console.error('Award achievement error:', error)
    }
  }

  /**
   * Gather user activity data for achievement checking
   */
  private async getUserActivityData(userId: string): Promise<UserActivityData> {
    // Get total sessions
    const totalSessions = await db.postureSession.count({
      where: {
        userId,
        endTime: { not: null },
      },
    })

    // Get current streak
    const currentStreak = await streakCalculator.calculateStreak(userId)

    // Get total completed breaks
    const totalBreaks = await db.breakSession.count({
      where: {
        userId,
        completed: true,
      },
    })

    // Get unique exercises completed
    const uniqueExercises = await db.breakSession.findMany({
      where: {
        userId,
        completed: true,
      },
      select: {
        exerciseId: true,
      },
      distinct: ['exerciseId'],
    })
    const totalExercises = uniqueExercises.length

    // Get average score
    const sessions = await db.postureSession.findMany({
      where: {
        userId,
        endTime: { not: null },
      },
      select: {
        averageScore: true,
      },
    })
    const averageScore =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.averageScore, 0) / sessions.length
        : 0

    // Get most recent session
    const recentSession = await db.postureSession.findFirst({
      where: {
        userId,
        endTime: { not: null },
      },
      orderBy: {
        startTime: 'desc',
      },
      select: {
        startTime: true,
        averageScore: true,
      },
    })

    return {
      userId,
      totalSessions,
      currentStreak,
      totalBreaks,
      totalExercises,
      averageScore,
      recentSessionTime: recentSession?.startTime,
      recentSessionScore: recentSession?.averageScore,
    }
  }

  /**
   * Get all achievements with user's progress
   */
  async getAchievementsProgress(userId: string) {
    const activityData = await this.getUserActivityData(userId)
    const earnedAchievements = await db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    })

    const earnedIds = new Set(earnedAchievements.map((a) => a.achievementId))

    return this.achievements.map((achievement) => {
      const isEarned = earnedIds.has(achievement.id)
      const earnedRecord = earnedAchievements.find((a) => a.achievementId === achievement.id)

      return {
        ...achievement,
        isEarned,
        earnedAt: earnedRecord?.earnedAt || null,
        progress: this.calculateProgress(achievement, activityData),
      }
    })
  }

  /**
   * Calculate progress toward an achievement (0-100)
   */
  private calculateProgress(
    achievement: AchievementDefinition,
    data: UserActivityData
  ): number {
    switch (achievement.id) {
      case 'first-session':
        return Math.min(100, (data.totalSessions / 1) * 100)
      case 'streak-7':
        return Math.min(100, (data.currentStreak / 7) * 100)
      case 'streak-30':
        return Math.min(100, (data.currentStreak / 30) * 100)
      case 'streak-90':
        return Math.min(100, (data.currentStreak / 90) * 100)
      case 'sessions-10':
        return Math.min(100, (data.totalSessions / 10) * 100)
      case 'sessions-50':
        return Math.min(100, (data.totalSessions / 50) * 100)
      case 'sessions-100':
        return Math.min(100, (data.totalSessions / 100) * 100)
      case 'break-master':
        return Math.min(100, (data.totalBreaks / 25) * 100)
      case 'break-enthusiast':
        return Math.min(100, (data.totalBreaks / 100) * 100)
      case 'exercise-starter':
        return Math.min(100, (data.totalExercises / 5) * 100)
      case 'exercise-enthusiast':
        return Math.min(100, (data.totalExercises / 25) * 100)
      case 'perfect-day':
        return Math.min(100, ((data.recentSessionScore || 0) / 95) * 100)
      case 'excellent-average':
        return Math.min(100, (data.averageScore / 85) * 100)
      default:
        return 0
    }
  }

  /**
   * Get total points earned by a user
   */
  async getTotalPoints(userId: string): Promise<number> {
    const earnedAchievements = await db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    })

    return earnedAchievements.reduce((total, earned) => {
      const achievement = this.achievements.find((a) => a.id === earned.achievementId)
      return total + (achievement?.points || 0)
    }, 0)
  }
}

// Export singleton instance
export const achievementSystem = new AchievementSystem()

// Helper function for quick access
export async function checkAchievements(userId: string): Promise<string[]> {
  return achievementSystem.checkAchievements(userId)
}
