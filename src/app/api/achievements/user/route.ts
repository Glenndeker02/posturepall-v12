/**
 * GET /api/achievements/user
 * Get user's unlocked achievements
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

    // Get user's unlocked achievements with full details
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: decoded.userId },
      include: {
        achievement: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    // Calculate statistics
    const totalPoints = userAchievements.reduce(
      (sum, ua) => sum + (ua.achievement.points || 0),
      0
    );

    const rarityCount = {
      common: userAchievements.filter((ua) => ua.achievement.rarity === 'common').length,
      rare: userAchievements.filter((ua) => ua.achievement.rarity === 'rare').length,
      legendary: userAchievements.filter((ua) => ua.achievement.rarity === 'legendary').length,
    };

    return NextResponse.json({
      achievements: userAchievements.map((ua) => ({
        ...ua.achievement,
        earnedAt: ua.earnedAt,
      })),
      total: userAchievements.length,
      totalPoints,
      byRarity: rarityCount,
    });
  } catch (error) {
    console.error('User achievements fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
