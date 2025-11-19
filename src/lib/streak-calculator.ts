import { db } from './db'

/**
 * Streak Calculator
 * Calculates the current posture tracking streak for a user
 */
export class StreakCalculator {
  /**
   * Calculate the current streak for a user
   * @param userId - User ID
   * @returns Current streak count in days
   */
  async calculateStreak(userId: string): Promise<number> {
    try {
      // 1. Get all posture sessions ordered by date DESC
      const sessions = await db.postureSession.findMany({
        where: {
          userId,
          endTime: {
            not: null, // Only count completed sessions
          },
        },
        orderBy: {
          startTime: 'desc',
        },
      })

      if (sessions.length === 0) {
        return 0
      }

      // 2. Group sessions by date
      const sessionsByDate = this.groupSessionsByDate(sessions)
      const dates = Array.from(sessionsByDate.keys()).sort((a, b) => b - a) // Sort descending

      // 3. Check if today has a session
      const today = this.getDateOnly(new Date())
      const hasSessionToday = dates.some((date) => date === today)

      if (!hasSessionToday && dates.length > 0) {
        // Check if yesterday has a session (streak might have just ended)
        const yesterday = this.getDateOnly(new Date(Date.now() - 24 * 60 * 60 * 1000))
        const hasSessionYesterday = dates.some((date) => date === yesterday)

        if (!hasSessionYesterday) {
          // Streak is broken
          return 0
        }
      }

      // 4. Count consecutive days backward
      let streak = 0
      let expectedDate = hasSessionToday ? today : this.getDateOnly(new Date(Date.now() - 24 * 60 * 60 * 1000))

      for (const date of dates) {
        if (date === expectedDate) {
          streak++
          // Move to previous day
          expectedDate = this.getDateOnly(new Date(expectedDate - 24 * 60 * 60 * 1000))
        } else if (date < expectedDate) {
          // Gap found, streak ends
          break
        }
      }

      return streak
    } catch (error) {
      console.error('Streak calculation error:', error)
      return 0
    }
  }

  /**
   * Get streak information with additional details
   */
  async getStreakInfo(userId: string) {
    const currentStreak = await this.calculateStreak(userId)
    const longestStreak = await this.calculateLongestStreak(userId)
    const lastSessionDate = await this.getLastSessionDate(userId)

    return {
      currentStreak,
      longestStreak,
      lastSessionDate,
      isActive: currentStreak > 0,
    }
  }

  /**
   * Calculate the longest streak ever achieved by a user
   */
  async calculateLongestStreak(userId: string): Promise<number> {
    try {
      const sessions = await db.postureSession.findMany({
        where: {
          userId,
          endTime: {
            not: null,
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      })

      if (sessions.length === 0) {
        return 0
      }

      const sessionsByDate = this.groupSessionsByDate(sessions)
      const dates = Array.from(sessionsByDate.keys()).sort((a, b) => a - b)

      let longestStreak = 0
      let currentStreak = 1

      for (let i = 1; i < dates.length; i++) {
        const prevDate = dates[i - 1]
        const currDate = dates[i]
        const daysDiff = Math.round((currDate - prevDate) / (24 * 60 * 60 * 1000))

        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++
        } else {
          // Gap found
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }

      longestStreak = Math.max(longestStreak, currentStreak)
      return longestStreak
    } catch (error) {
      console.error('Longest streak calculation error:', error)
      return 0
    }
  }

  /**
   * Get the date of the last session
   */
  async getLastSessionDate(userId: string): Promise<Date | null> {
    try {
      const lastSession = await db.postureSession.findFirst({
        where: {
          userId,
          endTime: {
            not: null,
          },
        },
        orderBy: {
          startTime: 'desc',
        },
      })

      return lastSession ? lastSession.startTime : null
    } catch (error) {
      console.error('Last session date error:', error)
      return null
    }
  }

  /**
   * Check if user is at risk of losing their streak
   * (no session today and it's past noon)
   */
  async isStreakAtRisk(userId: string): Promise<boolean> {
    const currentHour = new Date().getHours()
    if (currentHour < 12) {
      return false // Still morning, plenty of time
    }

    const today = this.getDateOnly(new Date())
    const sessions = await db.postureSession.findMany({
      where: {
        userId,
        startTime: {
          gte: new Date(today),
        },
      },
    })

    return sessions.length === 0
  }

  /**
   * Group sessions by date (timestamp at midnight)
   */
  private groupSessionsByDate(sessions: any[]): Map<number, any[]> {
    const grouped = new Map<number, any[]>()

    sessions.forEach((session) => {
      const dateOnly = this.getDateOnly(session.startTime)
      if (!grouped.has(dateOnly)) {
        grouped.set(dateOnly, [])
      }
      grouped.get(dateOnly)!.push(session)
    })

    return grouped
  }

  /**
   * Get timestamp for date at midnight (UTC)
   */
  private getDateOnly(date: Date): number {
    const d = new Date(date)
    d.setUTCHours(0, 0, 0, 0)
    return d.getTime()
  }

  /**
   * Calculate streak milestone achievements
   */
  async getStreakMilestones(userId: string) {
    const currentStreak = await this.calculateStreak(userId)
    const milestones = [7, 14, 30, 60, 90, 180, 365]

    const achieved = milestones.filter((m) => currentStreak >= m)
    const nextMilestone = milestones.find((m) => currentStreak < m)

    return {
      currentStreak,
      achievedMilestones: achieved,
      nextMilestone,
      daysUntilNext: nextMilestone ? nextMilestone - currentStreak : null,
    }
  }
}

// Export singleton instance
export const streakCalculator = new StreakCalculator()

// Helper function for quick access
export async function calculateStreak(userId: string): Promise<number> {
  return streakCalculator.calculateStreak(userId)
}
