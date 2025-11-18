import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/sync/webhook
 * Webhook for mobile app to push updates to web app
 *
 * This allows the mobile app to notify the web app when:
 * - User completes home exercises
 * - User updates profile/preferences
 * - User earns achievements
 *
 * Request body:
 * {
 *   deviceId: string,
 *   userId: string,
 *   eventType: 'exercise_completed' | 'profile_updated' | 'achievement_earned',
 *   data: any
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { deviceId, userId, eventType, data } = await request.json();

    if (!deviceId || !userId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify device is paired
    const pairedDevice = await db.pairedDevice.findFirst({
      where: {
        userId,
        deviceId,
        isActive: true,
      },
    });

    if (!pairedDevice) {
      return NextResponse.json(
        { success: false, error: 'Device not paired' },
        { status: 403 }
      );
    }

    // Update device last active
    await db.pairedDevice.update({
      where: { id: pairedDevice.id },
      data: { lastActiveAt: new Date() },
    });

    // Handle different event types
    switch (eventType) {
      case 'exercise_completed':
        await handleExerciseCompleted(userId, data);
        break;

      case 'profile_updated':
        await handleProfileUpdated(userId, data);
        break;

      case 'achievement_earned':
        await handleAchievementEarned(userId, data);
        break;

      case 'break_completed':
        await handleBreakCompleted(userId, data);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Event ${eventType} processed successfully`,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleExerciseCompleted(userId: string, data: any) {
  // Mobile app completed deep/home exercises
  // Update user stats and possibly create a break session record
  const { exercises, duration, pointsEarned } = data;

  // Create a break session for the home exercises
  await db.breakSession.create({
    data: {
      userId,
      breakType: 'extended',
      exercises: JSON.stringify(exercises),
      duration,
      completed: true,
      pointsEarned: pointsEarned || 0,
      mobileSynced: true, // came from mobile
    },
  });

  // Update user total breaks and points
  await db.user.update({
    where: { id: userId },
    data: {
      totalBreaks: { increment: 1 },
      totalPoints: { increment: pointsEarned || 0 },
    },
  });
}

async function handleProfileUpdated(userId: string, data: any) {
  // Update user profile from mobile app
  const allowedFields = ['name', 'avatar', 'painAreas', 'dailyGoalScore', 'weeklyGoalScore'];
  const updateData: any = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (field === 'painAreas' && Array.isArray(data[field])) {
        updateData[field] = JSON.stringify(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  });

  if (Object.keys(updateData).length > 0) {
    await db.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}

async function handleAchievementEarned(userId: string, data: any) {
  // Achievement earned on mobile
  const { achievementId } = data;

  // Check if achievement already exists
  const existing = await db.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId,
      },
    },
  });

  if (!existing) {
    await db.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    });
  }
}

async function handleBreakCompleted(userId: string, data: any) {
  // Break completed on mobile (same as exercise completed but with break metadata)
  await handleExerciseCompleted(userId, data);

  // Update break streak
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { currentBreakStreak: true, longestBreakStreak: true },
  });

  if (user) {
    const newStreak = (user.currentBreakStreak || 0) + 1;
    await db.user.update({
      where: { id: userId },
      data: {
        currentBreakStreak: newStreak,
        longestBreakStreak: Math.max(newStreak, user.longestBreakStreak || 0),
      },
    });
  }
}
