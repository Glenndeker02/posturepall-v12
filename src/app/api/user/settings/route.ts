/**
 * GET/PATCH /api/user/settings
 * Get and update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        subscriptionTier: true,
        workEnvironment: true,
        dailySittingHours: true,
        painAreas: true,
        workSchedule: true,
        userGoals: true,
        dailyGoalScore: true,
        weeklyGoalScore: true,
        breakRemindersEnabled: true,
        streakRemindersEnabled: true,
        currentStreak: true,
        longestStreak: true,
        totalPoints: true,
        totalSessions: true,
        totalBreaks: true,
        createdAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse JSON fields
    const settings = {
      ...user,
      painAreas: user.painAreas ? JSON.parse(user.painAreas) : [],
      workSchedule: user.workSchedule ? JSON.parse(user.workSchedule) : null,
      userGoals: user.userGoals ? JSON.parse(user.userGoals) : null,
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      workEnvironment,
      dailySittingHours,
      painAreas,
      workSchedule,
      userGoals,
      dailyGoalScore,
      weeklyGoalScore,
      breakRemindersEnabled,
      streakRemindersEnabled,
    } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (workEnvironment !== undefined) updateData.workEnvironment = workEnvironment;
    if (dailySittingHours !== undefined) updateData.dailySittingHours = dailySittingHours;
    if (painAreas !== undefined) updateData.painAreas = JSON.stringify(painAreas);
    if (workSchedule !== undefined) updateData.workSchedule = JSON.stringify(workSchedule);
    if (userGoals !== undefined) updateData.userGoals = JSON.stringify(userGoals);
    if (dailyGoalScore !== undefined) updateData.dailyGoalScore = dailyGoalScore;
    if (weeklyGoalScore !== undefined) updateData.weeklyGoalScore = weeklyGoalScore;
    if (breakRemindersEnabled !== undefined) updateData.breakRemindersEnabled = breakRemindersEnabled;
    if (streakRemindersEnabled !== undefined) updateData.streakRemindersEnabled = streakRemindersEnabled;

    const user = await db.user.update({
      where: { id: decoded.userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workEnvironment: user.workEnvironment,
        dailyGoalScore: user.dailyGoalScore,
        weeklyGoalScore: user.weeklyGoalScore,
      },
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
