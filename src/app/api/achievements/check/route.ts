/**
 * POST /api/achievements/check
 * Check and unlock achievements for a user based on their activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, extractToken } from '@/lib/auth';

interface AchievementCondition {
  type: string;
  count?: number;
  days?: number;
  total?: number;
  minScore?: number;
  minutes?: number;
  before?: number;
  after?: number;
  tier?: string;
}

export async function POST(request: NextRequest) {
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

    // Get user data
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        totalSessions: true,
        totalBreaks: true,
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all achievements
    const allAchievements = await db.achievement.findMany();

    // Get already unlocked achievements
    const unlockedAchievements = await db.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId));

    // Check which achievements should be unlocked
    const newlyUnlocked: string[] = [];

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      // Parse condition
      let condition: AchievementCondition;
      try {
        condition = JSON.parse(achievement.condition || '{}');
      } catch {
        continue;
      }

      let shouldUnlock = false;

      // Check different achievement types
      switch (condition.type) {
        case 'sessions':
          shouldUnlock = user.totalSessions >= (condition.count || 0);
          break;

        case 'breaks':
          shouldUnlock = user.totalBreaks >= (condition.count || 0);
          break;

        case 'points':
          shouldUnlock = user.totalPoints >= (condition.total || 0);
          break;

        case 'streak':
          shouldUnlock = user.longestStreak >= (condition.days || 0);
          break;

        case 'subscription':
          shouldUnlock = user.subscriptionTier === condition.tier;
          break;

        case 'calibration':
          // Check if user has any sessions (implies calibration done)
          shouldUnlock = user.totalSessions >= (condition.count || 0);
          break;

        // Session-specific achievements require additional data
        case 'sessionScore':
        case 'sessionDuration':
        case 'timeOfDay':
        case 'weekendSessions':
          // These would require checking session data
          // For now, we'll skip them (can be checked on session completion)
          break;
      }

      if (shouldUnlock) {
        // Unlock the achievement
        await db.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: achievement.id,
          },
        });

        newlyUnlocked.push(achievement.id);

        // Award points to user
        if (achievement.points) {
          await db.user.update({
            where: { id: user.id },
            data: {
              totalPoints: {
                increment: achievement.points,
              },
            },
          });
        }
      }
    }

    // Get full details of newly unlocked achievements
    const newAchievements = await db.achievement.findMany({
      where: {
        id: { in: newlyUnlocked },
      },
    });

    return NextResponse.json({
      success: true,
      newlyUnlocked: newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    console.error('Achievement check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
