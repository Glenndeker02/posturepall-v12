/**
 * GET /api/achievements
 * Get all available achievements
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

    // Get all achievements
    const achievements = await db.achievement.findMany({
      orderBy: [
        { rarity: 'asc' },
        { points: 'asc' },
      ],
    });

    // Get user's unlocked achievements
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: decoded.userId },
      include: {
        achievement: true,
      },
    });

    // Map achievements with unlock status
    const achievementsWithStatus = achievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      return {
        ...achievement,
        unlocked: !!userAchievement,
        earnedAt: userAchievement?.earnedAt || null,
      };
    });

    return NextResponse.json({
      achievements: achievementsWithStatus,
      total: achievements.length,
      unlocked: userAchievements.length,
    });
  } catch (error) {
    console.error('Achievements fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
