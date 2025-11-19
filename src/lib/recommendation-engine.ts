import { db } from './db'

interface ProblemArea {
  area: string
  severity: number // 0-100
  category: string
}

interface RecommendationScore {
  exerciseId: string
  score: number
  reasons: string[]
}

/**
 * Exercise Recommendation Engine
 * Analyzes user's posture data and recommends personalized exercises
 */
export class RecommendationEngine {
  /**
   * Get personalized exercise recommendations for a user
   * @param userId - User ID
   * @param limit - Number of recommendations to return (default: 5)
   * @returns Array of recommended exercise IDs with scores
   */
  async getRecommendations(userId: string, limit: number = 5): Promise<string[]> {
    try {
      // 1. Fetch user's recent posture sessions (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentSessions = await db.postureSession.findMany({
        where: {
          userId,
          startTime: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          startTime: 'desc',
        },
        take: 50,
      })

      if (recentSessions.length === 0) {
        // Return beginner exercises if no sessions
        return this.getDefaultRecommendations()
      }

      // 2. Analyze deviation breakdown
      const problemAreas = this.analyzeProblemAreas(recentSessions)

      // 3. Get user profile for pain areas and commitment level
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          painAreas: true,
          userGoals: true,
        },
      })

      const userPainAreas = user?.painAreas ? user.painAreas.split(',') : []
      const commitmentLevel = this.extractCommitmentLevel(user?.userGoals || '')

      // 4. Get all exercises
      const exercises = await db.exercise.findMany()

      // 5. Get user's exercise completion history
      const completedBreaks = await db.breakSession.findMany({
        where: {
          userId,
          completed: true,
        },
        select: {
          exerciseId: true,
        },
      })

      const completionRate = this.calculateCompletionRates(completedBreaks)

      // 6. Score each exercise
      const scores: RecommendationScore[] = exercises.map((exercise) => {
        return this.scoreExercise(
          exercise,
          problemAreas,
          userPainAreas,
          commitmentLevel,
          completionRate
        )
      })

      // 7. Sort by score and return top N
      const topExercises = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.exerciseId)

      return topExercises
    } catch (error) {
      console.error('Recommendation engine error:', error)
      return this.getDefaultRecommendations()
    }
  }

  /**
   * Analyze posture sessions to identify problem areas
   */
  private analyzeProblemAreas(sessions: any[]): ProblemArea[] {
    const deviations = {
      headForward: 0,
      shoulderSlump: 0,
      backCurve: 0,
      neckStrain: 0,
      eyeStrain: 0,
    }

    let totalSessions = 0

    // Aggregate deviations from all sessions
    sessions.forEach((session) => {
      if (session.deviationBreakdown) {
        try {
          const breakdown =
            typeof session.deviationBreakdown === 'string'
              ? JSON.parse(session.deviationBreakdown)
              : session.deviationBreakdown

          deviations.headForward += breakdown.headForward || 0
          deviations.shoulderSlump += breakdown.shoulderSlump || 0
          deviations.backCurve += breakdown.backCurve || 0
          deviations.neckStrain += breakdown.neckStrain || 0
          deviations.eyeStrain += breakdown.eyeStrain || 0
          totalSessions++
        } catch (e) {
          // Skip invalid data
        }
      }
    })

    // Calculate average severity
    const problemAreas: ProblemArea[] = [
      {
        area: 'Head Forward',
        severity: totalSessions > 0 ? deviations.headForward / totalSessions : 0,
        category: 'neck',
      },
      {
        area: 'Shoulder Slump',
        severity: totalSessions > 0 ? deviations.shoulderSlump / totalSessions : 0,
        category: 'shoulder',
      },
      {
        area: 'Back Curve',
        severity: totalSessions > 0 ? deviations.backCurve / totalSessions : 0,
        category: 'back',
      },
      {
        area: 'Neck Strain',
        severity: totalSessions > 0 ? deviations.neckStrain / totalSessions : 0,
        category: 'neck',
      },
      {
        area: 'Eye Strain',
        severity: totalSessions > 0 ? deviations.eyeStrain / totalSessions : 0,
        category: 'eye',
      },
    ]

    // Return top 3 problem areas
    return problemAreas.sort((a, b) => b.severity - a.severity).slice(0, 3)
  }

  /**
   * Score an exercise based on multiple factors
   */
  private scoreExercise(
    exercise: any,
    problemAreas: ProblemArea[],
    userPainAreas: string[],
    commitmentLevel: string,
    completionRate: Map<string, number>
  ): RecommendationScore {
    let score = 0
    const reasons: string[] = []

    // Factor 1: Problem severity match (40% weight)
    const categoryMatch = problemAreas.find((p) => p.category === exercise.category)
    if (categoryMatch) {
      const problemScore = (categoryMatch.severity / 100) * 40
      score += problemScore
      reasons.push(`Targets ${categoryMatch.area} (${Math.round(categoryMatch.severity)}% severity)`)
    }

    // Factor 2: User's pain areas match (30% weight)
    const painAreaMatch = userPainAreas.some((pain) =>
      exercise.category.toLowerCase().includes(pain.toLowerCase())
    )
    if (painAreaMatch) {
      score += 30
      reasons.push('Matches your pain areas')
    }

    // Factor 3: Difficulty match with commitment level (20% weight)
    const difficultyScore = this.matchDifficulty(exercise.difficulty, commitmentLevel)
    score += difficultyScore
    if (difficultyScore > 0) {
      reasons.push(`${exercise.difficulty} difficulty suits your level`)
    }

    // Factor 4: Previous completion rate (10% weight)
    const exerciseCompletionRate = completionRate.get(exercise.id) || 0
    const completionScore = exerciseCompletionRate * 10
    score += completionScore
    if (exerciseCompletionRate > 0.5) {
      reasons.push('You complete this exercise regularly')
    }

    return {
      exerciseId: exercise.id,
      score,
      reasons,
    }
  }

  /**
   * Extract commitment level from user goals
   */
  private extractCommitmentLevel(goals: string): string {
    const lowerGoals = goals.toLowerCase()
    if (lowerGoals.includes('advanced') || lowerGoals.includes('intensive')) {
      return 'advanced'
    }
    if (lowerGoals.includes('moderate') || lowerGoals.includes('regular')) {
      return 'intermediate'
    }
    return 'beginner'
  }

  /**
   * Match exercise difficulty with user's commitment level
   */
  private matchDifficulty(exerciseDifficulty: string, commitmentLevel: string): number {
    const difficultyMap = {
      beginner: { beginner: 20, intermediate: 10, advanced: 0 },
      intermediate: { beginner: 10, intermediate: 20, advanced: 10 },
      advanced: { beginner: 0, intermediate: 10, advanced: 20 },
    }

    return difficultyMap[commitmentLevel as keyof typeof difficultyMap]?.[
      exerciseDifficulty as keyof (typeof difficultyMap)[typeof commitmentLevel]
    ] || 0
  }

  /**
   * Calculate completion rates for exercises
   */
  private calculateCompletionRates(completedBreaks: any[]): Map<string, number> {
    const rates = new Map<string, number>()
    const counts = new Map<string, number>()

    completedBreaks.forEach((breakSession) => {
      const exerciseId = breakSession.exerciseId
      if (exerciseId) {
        counts.set(exerciseId, (counts.get(exerciseId) || 0) + 1)
      }
    })

    const maxCount = Math.max(...Array.from(counts.values()), 1)

    counts.forEach((count, exerciseId) => {
      rates.set(exerciseId, count / maxCount)
    })

    return rates
  }

  /**
   * Get default recommendations for new users
   */
  private getDefaultRecommendations(): string[] {
    // Return commonly recommended beginner exercises
    // In production, these IDs would be actual exercise IDs from the database
    return ['neck-rolls', 'shoulder-shrugs', '20-20-20-eye', 'deep-breathing', 'seated-stretch']
  }

  /**
   * Get recommended exercises with full details
   */
  async getDetailedRecommendations(userId: string, limit: number = 5) {
    const exerciseIds = await this.getRecommendations(userId, limit)

    const exercises = await db.exercise.findMany({
      where: {
        id: {
          in: exerciseIds,
        },
      },
    })

    // Maintain order from recommendations
    return exerciseIds
      .map((id) => exercises.find((ex) => ex.id === id))
      .filter(Boolean)
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine()
