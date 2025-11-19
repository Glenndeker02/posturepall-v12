/**
 * Dashboard Analytics Service
 * Calculates real-time dashboard metrics and insights
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardData {
  todayScore: number | null;
  yesterdayScore: number | null;
  scoreChange: number;
  scoreChangePercent: number;
  scoreTrend: 'up' | 'down' | 'stable';

  sessionTime: number; // minutes
  sessionCount: number;

  breaksCompleted: number;
  breaksTotal: number;
  breakCompletionRate: number;

  currentStreak: number;
  longestStreak: number;
  streakStatus: 'active' | 'at_risk' | 'broken';

  pointsEarned: number;
  totalPoints: number;
  pointsToNextTier: number | null;

  weeklyGoal: number;
  weeklyProgress: number; // percentage toward weekly goal

  recentSessions: SessionSummary[];
  topInsights: string[];
  problemAlerts: ProblemAlert[];
  upcomingEvents: UpcomingEvent[];
}

export interface SessionSummary {
  id: string;
  startTime: Date;
  duration: number; // minutes
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ProblemAlert {
  type: 'breaks_skipped' | 'posture_declining' | 'streak_at_risk';
  severity: 'info' | 'warning' | 'error';
  message: string;
  action?: string;
}

export interface UpcomingEvent {
  type: 'break' | 'calibration' | 'challenge';
  title: string;
  time: string;
  minutesUntil: number | null;
}

/**
 * Get complete dashboard data for today
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Sunday

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      totalPoints: true,
      lastActivityDate: true,
      dailyGoalScore: true,
      weeklyGoalScore: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get today's stats (or calculate if not exists)
  const todayStats = await getTodayStats(userId);
  const yesterdayStats = await getStatsForDate(userId, yesterday);

  // Get this week's sessions for weekly progress
  const weekSessions = await prisma.postureSession.findMany({
    where: {
      userId,
      startTime: { gte: weekStart },
    },
    select: {
      overallScore: true,
    },
  });

  // Calculate scores
  const todayScore = todayStats?.postureScore ?? null;
  const yesterdayScore = yesterdayStats?.postureScore ?? null;
  const scoreChange = todayScore && yesterdayScore ? todayScore - yesterdayScore : 0;
  const scoreChangePercent = yesterdayScore ? Math.round((scoreChange / yesterdayScore) * 100) : 0;
  const scoreTrend = scoreChange > 2 ? 'up' : scoreChange < -2 ? 'down' : 'stable';

  // Calculate weekly progress
  const weeklyAverage = weekSessions.length > 0
    ? Math.round(weekSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / weekSessions.length)
    : 0;
  const weeklyProgress = Math.round((weeklyAverage / user.weeklyGoalScore) * 100);

  // Get recent sessions
  const recentSessions = await getRecentSessions(userId, 5);

  // Generate insights
  const insights = await generateDailyInsights(userId, todayStats);

  // Check for problem alerts
  const problemAlerts = await checkProblemAlerts(userId, todayStats, user);

  // Get upcoming events
  const upcomingEvents = getUpcomingEvents();

  // Determine streak status
  const lastActivity = user.lastActivityDate;
  const isToday = lastActivity && isSameDay(lastActivity, new Date());
  const isYesterday = lastActivity && isSameDay(lastActivity, yesterday);
  const streakStatus = isToday ? 'active' : isYesterday ? 'at_risk' : 'broken';

  return {
    todayScore,
    yesterdayScore,
    scoreChange,
    scoreChangePercent,
    scoreTrend,

    sessionTime: todayStats?.totalDuration || 0,
    sessionCount: todayStats?.sessionCount || 0,

    breaksCompleted: todayStats?.breaksCompleted || 0,
    breaksTotal: todayStats?.breaksScheduled || 0,
    breakCompletionRate: todayStats?.breaksScheduled
      ? Math.round((todayStats.breaksCompleted / todayStats.breaksScheduled) * 100)
      : 0,

    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    streakStatus,

    pointsEarned: todayStats?.pointsEarned || 0,
    totalPoints: user.totalPoints,
    pointsToNextTier: calculatePointsToNextTier(user.totalPoints),

    weeklyGoal: user.weeklyGoalScore,
    weeklyProgress,

    recentSessions,
    topInsights: insights,
    problemAlerts,
    upcomingEvents,
  };
}

/**
 * Get or create today's daily stats
 */
async function getTodayStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let stats = await prisma.dailyStats.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  if (!stats) {
    // Calculate from today's sessions
    stats = await calculateDailyStats(userId, today);
  }

  return stats;
}

/**
 * Get stats for a specific date
 */
async function getStatsForDate(userId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  return await prisma.dailyStats.findUnique({
    where: {
      userId_date: {
        userId,
        date: dayStart,
      },
    },
  });
}

/**
 * Calculate daily stats from sessions
 */
export async function calculateDailyStats(userId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // Get all sessions for this day
  const sessions = await prisma.postureSession.findMany({
    where: {
      userId,
      startTime: {
        gte: dayStart,
        lt: dayEnd,
      },
    },
    select: {
      id: true,
      duration: true,
      overallScore: true,
      pointsEarned: true,
      bonusPoints: true,
      timeExcellent: true,
      timeGood: true,
      timeFair: true,
      timePoor: true,
      problemAreas: true,
    },
  });

  // Get all break sessions for this day
  const breaks = await prisma.breakSession.findMany({
    where: {
      userId,
      createdAt: {
        gte: dayStart,
        lt: dayEnd,
      },
    },
    select: {
      completed: true,
    },
  });

  const sessionCount = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalPoints = sessions.reduce((sum, s) => sum + (s.pointsEarned || 0) + (s.bonusPoints || 0), 0);

  // Calculate average score
  const postureScore = sessionCount > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessionCount)
    : null;

  // Sum up time in each quality
  const timeExcellent = Math.round(sessions.reduce((sum, s) => sum + (s.timeExcellent || 0), 0) / 60); // convert to minutes
  const timeGood = Math.round(sessions.reduce((sum, s) => sum + (s.timeGood || 0), 0) / 60);
  const timeFair = Math.round(sessions.reduce((sum, s) => sum + (s.timeFair || 0), 0) / 60);
  const timePoor = Math.round(sessions.reduce((sum, s) => sum + (s.timePoor || 0), 0) / 60);

  // Break stats
  const breaksCompleted = breaks.filter(b => b.completed).length;
  const breaksTotal = breaks.length;

  // Find best session
  const bestSession = sessions.reduce((best, current) => {
    if (!best || (current.overallScore || 0) > (best.overallScore || 0)) {
      return current;
    }
    return best;
  }, sessions[0]);

  // Merge problem areas
  const problemAreas = mergeProblemAreas(sessions.map(s => s.problemAreas));

  // Get user's daily goal
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyGoalScore: true },
  });

  const dailyGoalMet = postureScore !== null && postureScore >= (user?.dailyGoalScore || 80);
  const breakGoalMet = breaksTotal > 0 && (breaksCompleted / breaksTotal) >= 0.8; // 80% completion

  // Create or update daily stats
  return await prisma.dailyStats.upsert({
    where: {
      userId_date: {
        userId,
        date: dayStart,
      },
    },
    create: {
      userId,
      date: dayStart,
      postureScore,
      sessionCount,
      totalDuration,
      pointsEarned: totalPoints,
      breaksScheduled: breaksTotal,
      breaksCompleted,
      breaksSnoozed: 0, // TODO: track this
      breaksSkipped: breaksTotal - breaksCompleted,
      timeExcellent,
      timeGood,
      timeFair,
      timePoor,
      dailyGoalMet,
      breakGoalMet,
      problemAreas: JSON.stringify(problemAreas),
      bestSessionScore: bestSession?.overallScore || null,
      bestSessionId: bestSession?.id || null,
    },
    update: {
      postureScore,
      sessionCount,
      totalDuration,
      pointsEarned: totalPoints,
      breaksScheduled: breaksTotal,
      breaksCompleted,
      breaksSkipped: breaksTotal - breaksCompleted,
      timeExcellent,
      timeGood,
      timeFair,
      timePoor,
      dailyGoalMet,
      breakGoalMet,
      problemAreas: JSON.stringify(problemAreas),
      bestSessionScore: bestSession?.overallScore || null,
      bestSessionId: bestSession?.id || null,
    },
  });
}

/**
 * Update user streaks based on daily stats
 */
export async function updateStreaks(userId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const stats = await getStatsForDate(userId, dayStart);
  if (!stats) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      currentBreakStreak: true,
      longestBreakStreak: true,
      lastActivityDate: true,
    },
  });

  if (!user) return;

  const yesterday = new Date(dayStart);
  yesterday.setDate(yesterday.getDate() - 1);

  const hadActivityYesterday = user.lastActivityDate && isSameDay(user.lastActivityDate, yesterday);

  // Update posture streak
  let newCurrentStreak = user.currentStreak;
  if (stats.dailyGoalMet) {
    newCurrentStreak = hadActivityYesterday ? user.currentStreak + 1 : 1;
  } else {
    newCurrentStreak = 0;
  }

  const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);

  // Update break streak
  let newCurrentBreakStreak = user.currentBreakStreak;
  if (stats.breakGoalMet) {
    newCurrentBreakStreak = hadActivityYesterday ? user.currentBreakStreak + 1 : 1;
  } else {
    newCurrentBreakStreak = 0;
  }

  const newLongestBreakStreak = Math.max(user.longestBreakStreak, newCurrentBreakStreak);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      currentBreakStreak: newCurrentBreakStreak,
      longestBreakStreak: newLongestBreakStreak,
      lastActivityDate: dayStart,
    },
  });
}

/**
 * Get recent sessions summary
 */
async function getRecentSessions(userId: string, limit: number): Promise<SessionSummary[]> {
  const sessions = await prisma.postureSession.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
    take: limit,
    select: {
      id: true,
      startTime: true,
      duration: true,
      overallScore: true,
    },
  });

  return sessions.map(s => ({
    id: s.id,
    startTime: s.startTime,
    duration: s.duration || 0,
    score: s.overallScore || 0,
    status: getScoreStatus(s.overallScore || 0),
  }));
}

/**
 * Generate daily insights
 */
async function generateDailyInsights(userId: string, todayStats: any): Promise<string[]> {
  const insights: string[] = [];

  if (!todayStats) return insights;

  // Best time of day analysis (would need time-of-day data)
  // For now, generic insights

  if (todayStats.sessionCount > 0) {
    if (todayStats.postureScore >= 85) {
      insights.push("🎉 Excellent posture today! You're building great habits.");
    } else if (todayStats.postureScore >= 70) {
      insights.push("👍 Good posture session. Keep up the consistency!");
    }
  }

  if (todayStats.breakCompletionRate >= 80) {
    insights.push("🌟 Great job taking your breaks! Your posture benefits from regular movement.");
  } else if (todayStats.breaksSkipped > 3) {
    insights.push("⚠️ You've skipped several breaks. Remember: regular breaks improve posture and focus.");
  }

  // Add time-based suggestions
  const hour = new Date().getHours();
  if (hour >= 9 && hour < 12) {
    insights.push("☀️ Morning sessions typically show the best posture. Make the most of your energy!");
  } else if (hour >= 14 && hour < 17) {
    insights.push("🌤️ Afternoon energy dip? A quick stretch break can help maintain good posture.");
  }

  return insights.slice(0, 3); // Limit to 3 insights
}

/**
 * Check for problem alerts
 */
async function checkProblemAlerts(
  userId: string,
  todayStats: any,
  user: any
): Promise<ProblemAlert[]> {
  const alerts: ProblemAlert[] = [];

  if (!todayStats) return alerts;

  // Check if breaks are being skipped
  if (todayStats.breaksSkipped >= 4) {
    alerts.push({
      type: 'breaks_skipped',
      severity: 'warning',
      message: `You've skipped ${todayStats.breaksSkipped} breaks today. Your posture score tends to drop when breaks are missed.`,
      action: "Let's schedule your next break now",
    });
  }

  // Check if posture is declining
  if (todayStats.postureScore && todayStats.postureScore < 60) {
    alerts.push({
      type: 'posture_declining',
      severity: 'warning',
      message: "Your posture score is below your usual standard. Consider adjusting your workspace setup.",
      action: "Review ergonomic tips",
    });
  }

  // Check streak at risk
  const lastActivity = user.lastActivityDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = lastActivity && isSameDay(lastActivity, today);

  if (!isToday && user.currentStreak > 0 && new Date().getHours() >= 18) {
    alerts.push({
      type: 'streak_at_risk',
      severity: 'info',
      message: `Don't break your ${user.currentStreak}-day streak! Quick 15-minute session keeps it alive.`,
      action: "Start quick session",
    });
  }

  return alerts;
}

/**
 * Get upcoming events
 */
function getUpcomingEvents(): UpcomingEvent[] {
  // This would integrate with the break scheduler and other systems
  // For now, return empty array - will be populated by actual data
  return [];
}

// Helper functions

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getScoreStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function calculatePointsToNextTier(currentPoints: number): number | null {
  const tiers = [100, 500, 1000, 2500, 5000, 10000];
  const nextTier = tiers.find(t => t > currentPoints);
  return nextTier ? nextTier - currentPoints : null;
}

function mergeProblemAreas(areasArray: (string | null)[]): Record<string, number> {
  const merged: Record<string, number> = {};

  for (const areasJson of areasArray) {
    if (!areasJson) continue;

    try {
      const areas = JSON.parse(areasJson);
      for (const [key, value] of Object.entries(areas)) {
        merged[key] = (merged[key] || 0) + (value as number);
      }
    } catch (e) {
      // Ignore invalid JSON
    }
  }

  return merged;
}
