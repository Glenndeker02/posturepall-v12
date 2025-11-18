/**
 * POST /api/auth/logout
 * Logout user (invalidate session)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Update user's last activity
    await db.user.update({
      where: { id: decoded.userId },
      data: {
        lastActivityDate: new Date(),
      },
    });

    // In a production app with refresh tokens, you would:
    // 1. Delete the refresh token from the database
    // 2. Add the access token to a blacklist (Redis)
    // For now, we just acknowledge the logout

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
