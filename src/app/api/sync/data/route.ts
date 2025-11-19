import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/sync/data?userId=xxx&deviceId=xxx&since=timestamp
 * Get all sync data for mobile app
 *
 * This endpoint returns comprehensive data including:
 * - User profile and preferences
 * - Posture sessions (today, week, month, all-time)
 * - Analytics and insights
 * - Goals and achievements
 * - Streaks and statistics
 * - Workstations
 * - Problem areas and recommendations
 *
 * Query params:
 * - userId: required
 * - deviceId: required (to verify device is paired)
 * - since: optional timestamp to get only updated data (incremental sync)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, deviceId, since } = await request.json();

    if (!userId || !deviceId) {
      return NextResponse.json(
        { success: false, error: 'userId and deviceId are required' },
        { status: 400 }
      );
    }

    // Verify device is paired and active
    const pairedDevice = await db.pairedDevice.findFirst({
      where: {
        userId,
        deviceId,
        isActive: true,
      },
    });

    if (!pairedDevice) {
      return NextResponse.json(
        { success: false, error: 'Device not paired or inactive' },
        { status: 403 }
      );
    }

    // Update last synced time
    await db.pairedDevice.update({
      where: { id: pairedDevice.id },
      data: {
        lastSyncedAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    // Get user profile
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        subscriptionTier: true,
        currentStreak: true,
        longestStreak: true,
        currentBreakStreak: true,
        longestBreakStreak: true,
        totalPoints: true,
        totalSessions: true,
        totalBreaks: true,
        dailyGoalScore: true,
        weeklyGoalScore: true,
        workEnvironment: true,
        dailySittingHours: true,
        painAreas: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);

    // Build query filter based on 'since' parameter
    const sinceFilter = since ? { updatedAt: { gte: new Date(since) } } : {};

    // Get posture sessions
    const [todaySessions, weekSessions, monthSessions, recentSessions] =
      await Promise.all([
        // Today's sessions
        db.postureSession.findMany({
          where: {
            userId,
            startTime: { gte: todayStart },
            ...sinceFilter,
          },
          orderBy: { startTime: 'desc' },
        }),
        // Last 7 days
        db.postureSession.findMany({
          where: {
            userId,
            startTime: { gte: weekStart },
            ...sinceFilter,
          },
          orderBy: { startTime: 'desc' },
        }),
        // Last 30 days
        db.postureSession.findMany({
          where: {
            userId,
            startTime: { gte: monthStart },
            ...sinceFilter,
          },
          orderBy: { startTime: 'desc' },
        }),
        // Most recent 20 sessions (for detailed view)
        db.postureSession.findMany({
          where: {
            userId,
            ...sinceFilter,
          },
          orderBy: { startTime: 'desc' },
          take: 20,
        }),
      ]);

    // Get break sessions
    const [todayBreaks, weekBreaks] = await Promise.all([
      db.breakSession.findMany({
        where: {
          userId,
          createdAt: { gte: todayStart },
          ...sinceFilter,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.breakSession.findMany({
        where: {
          userId,
          createdAt: { gte: weekStart },
          ...sinceFilter,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Get daily stats for the week
    const dailyStats = await db.dailyStats.findMany({
      where: {
        userId,
        date: { gte: weekStart },
      },
      orderBy: { date: 'desc' },
    });

    // Get active goals
    const goals = await db.goal.findMany({
      where: {
        userId,
        isCompleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get achievements
    const achievements = await db.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: 'desc' },
      take: 50,
    });

    // Get workstations
    const workstations = await db.workstation.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    // Calculate today's analytics
    const todayAnalytics = calculateDailyAnalytics(todaySessions, todayBreaks);
    const weekAnalytics = calculateWeeklyAnalytics(weekSessions, weekBreaks);
    const monthAnalytics = calculateMonthlyAnalytics(monthSessions);

    // Get problem areas summary
    const problemAreas = analyzeProblemAreas(weekSessions);

    // Get AI insights and recommendations
    const insights = generateInsights(user, weekSessions, weekBreaks, dailyStats);
    const recommendations = generateRecommendations(problemAreas, user);

    // Prepare sync response
    const syncData = {
      success: true,
      timestamp: new Date().toISOString(),
      syncVersion: '1.0',

      // User profile
      user: {
        ...user,
        painAreas: user.painAreas ? JSON.parse(user.painAreas) : [],
      },

      // Analytics
      analytics: {
        today: todayAnalytics,
        week: weekAnalytics,
        month: monthAnalytics,
      },

      // Sessions data
      sessions: {
        today: formatSessions(todaySessions),
        week: formatSessions(weekSessions),
        month: formatSessions(monthSessions),
        recent: formatSessions(recentSessions),
      },

      // Breaks
      breaks: {
        today: formatBreaks(todayBreaks),
        week: formatBreaks(weekBreaks),
      },

      // Daily stats for trend graphs
      dailyStats: dailyStats.map((stat) => ({
        ...stat,
        problemAreas: stat.problemAreas ? JSON.parse(stat.problemAreas) : {},
      })),

      // Goals and achievements
      goals: goals.map((goal) => ({
        ...goal,
        progress: goal.currentValue && goal.targetValue
          ? (goal.currentValue / goal.targetValue) * 100
          : 0,
      })),
      achievements: achievements.map((ua) => ({
        id: ua.id,
        earnedAt: ua.earnedAt,
        achievement: ua.achievement,
      })),

      // Workstations
      workstations: workstations.map((ws) => ({
        ...ws,
        calibrationData: ws.calibrationData ? JSON.parse(ws.calibrationData) : null,
      })),

      // Problem areas and recommendations
      problemAreas,
      insights,
      recommendations,

      // Streaks
      streaks: {
        current: user.currentStreak,
        longest: user.longestStreak,
        breakCurrent: user.currentBreakStreak,
        breakLongest: user.longestBreakStreak,
      },

      // Statistics
      statistics: {
        totalPoints: user.totalPoints,
        totalSessions: user.totalSessions,
        totalBreaks: user.totalBreaks,
        avgDailyScore: calculateAvgScore(dailyStats),
        totalMonitoringTime: calculateTotalTime(monthSessions),
      },
    };

    return NextResponse.json(syncData);
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}

// Helper functions

function formatSessions(sessions: any[]) {
  return sessions.map((session) => ({
    ...session,
    deviationBreakdown: session.deviationBreakdown
      ? JSON.parse(session.deviationBreakdown)
      : null,
    problemAreas: session.problemAreas ? JSON.parse(session.problemAreas) : null,
    postureTimeline: session.postureTimeline
      ? JSON.parse(session.postureTimeline)
      : null,
    aiInsights: session.aiInsights ? JSON.parse(session.aiInsights) : [],
    recommendations: session.recommendations
      ? JSON.parse(session.recommendations)
      : [],
  }));
}

function formatBreaks(breaks: any[]) {
  return breaks.map((breakSession) => ({
    ...breakSession,
    exercises: breakSession.exercises ? JSON.parse(breakSession.exercises) : [],
  }));
}

function calculateDailyAnalytics(sessions: any[], breaks: any[]) {
  const totalSessions = sessions.length;
  const totalBreaks = breaks.filter((b) => b.completed).length;
  const avgScore =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length
      : 0;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalPoints = sessions.reduce((sum, s) => sum + (s.pointsEarned || 0), 0);

  return {
    sessionsCount: totalSessions,
    breaksCompleted: totalBreaks,
    averageScore: Math.round(avgScore),
    totalDuration, // minutes
    pointsEarned: totalPoints,
    goalMet: avgScore >= 80, // default goal
  };
}

function calculateWeeklyAnalytics(sessions: any[], breaks: any[]) {
  const daily = calculateDailyAnalytics(sessions, breaks);

  const avgExcellentTime =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.timeExcellent || 0), 0) / sessions.length
      : 0;
  const avgGoodTime =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.timeGood || 0), 0) / sessions.length
      : 0;
  const avgFairTime =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.timeFair || 0), 0) / sessions.length
      : 0;
  const avgPoorTime =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.timePoor || 0), 0) / sessions.length
      : 0;

  return {
    ...daily,
    postureQuality: {
      excellent: Math.round(avgExcellentTime / 60), // convert to minutes
      good: Math.round(avgGoodTime / 60),
      fair: Math.round(avgFairTime / 60),
      poor: Math.round(avgPoorTime / 60),
    },
  };
}

function calculateMonthlyAnalytics(sessions: any[]) {
  const totalSessions = sessions.length;
  const avgScore =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length
      : 0;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  return {
    sessionsCount: totalSessions,
    averageScore: Math.round(avgScore),
    totalDuration,
    trend: avgScore >= 70 ? 'improving' : avgScore >= 50 ? 'stable' : 'declining',
  };
}

function analyzeProblemAreas(sessions: any[]) {
  const problemCounts: Record<string, number> = {};

  sessions.forEach((session) => {
    if (session.problemAreas) {
      const areas = JSON.parse(session.problemAreas);
      Object.entries(areas).forEach(([area, count]) => {
        problemCounts[area] = (problemCounts[area] || 0) + (count as number);
      });
    }
  });

  return Object.entries(problemCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([area, count]) => ({ area, frequency: count }));
}

function generateInsights(
  user: any,
  sessions: any[],
  breaks: any[],
  dailyStats: any[]
) {
  const insights = [];

  // Streak insight
  if (user.currentStreak >= 7) {
    insights.push({
      type: 'streak',
      message: `Amazing! You're on a ${user.currentStreak}-day streak!`,
      icon: '🔥',
    });
  }

  // Improvement insight
  if (dailyStats.length >= 7) {
    const recentAvg =
      dailyStats.slice(0, 3).reduce((sum, s) => sum + (s.postureScore || 0), 0) / 3;
    const olderAvg =
      dailyStats.slice(4, 7).reduce((sum, s) => sum + (s.postureScore || 0), 0) / 3;
    if (recentAvg > olderAvg + 5) {
      insights.push({
        type: 'improvement',
        message: 'Your posture score is improving this week!',
        icon: '📈',
      });
    }
  }

  // Break completion
  const breakRate =
    breaks.length > 0 ? breaks.filter((b) => b.completed).length / breaks.length : 0;
  if (breakRate >= 0.8) {
    insights.push({
      type: 'breaks',
      message: "Great job taking regular breaks! You're at 80%+ completion.",
      icon: '🎯',
    });
  }

  return insights;
}

function generateRecommendations(problemAreas: any[], user: any) {
  const recommendations = [];

  // Problem area recommendations
  if (problemAreas.length > 0) {
    const topProblem = problemAreas[0];
    recommendations.push({
      type: 'exercise',
      title: `Focus on ${topProblem.area} exercises`,
      description: `We've noticed frequent ${topProblem.area} issues. Try our targeted exercises.`,
      priority: 'high',
      category: topProblem.area,
    });
  }

  // Break recommendation
  if (user.totalBreaks < user.totalSessions * 0.5) {
    recommendations.push({
      type: 'breaks',
      title: 'Take more breaks',
      description: 'Regular breaks help prevent fatigue and maintain good posture.',
      priority: 'medium',
    });
  }

  return recommendations;
}

function calculateAvgScore(dailyStats: any[]) {
  if (dailyStats.length === 0) return 0;
  return Math.round(
    dailyStats.reduce((sum, s) => sum + (s.postureScore || 0), 0) / dailyStats.length
  );
}

function calculateTotalTime(sessions: any[]) {
  return sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
}
