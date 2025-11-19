/**
 * GET /api/auth/me
 * Get current authenticated user's information
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        workstations: {
          where: { isDefault: true },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        subscriptionTier: user.subscriptionTier,
        workEnvironment: user.workEnvironment,
        dailySittingHours: user.dailySittingHours,
        painAreas: user.painAreas ? JSON.parse(user.painAreas) : [],
        workSchedule: user.workSchedule ? JSON.parse(user.workSchedule) : {},
        userGoals: user.userGoals ? JSON.parse(user.userGoals) : {},
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastActivityDate: user.lastActivityDate,
        streakFreezes: user.streakFreezes,
        currentBreakStreak: user.currentBreakStreak,
        longestBreakStreak: user.longestBreakStreak,
        totalPoints: user.totalPoints,
        totalSessions: user.totalSessions,
        totalBreaks: user.totalBreaks,
        dailyGoalScore: user.dailyGoalScore,
        weeklyGoalScore: user.weeklyGoalScore,
        breakRemindersEnabled: user.breakRemindersEnabled,
        streakRemindersEnabled: user.streakRemindersEnabled,
        defaultWorkstation: user.workstations[0] || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
