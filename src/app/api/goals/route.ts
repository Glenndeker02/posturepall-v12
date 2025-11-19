/**
 * GET/POST /api/goals
 * Get all goals and create new goals for a user
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

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'active', 'completed', 'all'

    const whereClause: any = { userId: decoded.userId };

    if (filter === 'active') {
      whereClause.isCompleted = false;
    } else if (filter === 'completed') {
      whereClause.isCompleted = true;
    }

    // Get user's goals
    const goals = await db.goal.findMany({
      where: whereClause,
      orderBy: [
        { isCompleted: 'asc' },
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Calculate statistics
    const stats = {
      total: goals.length,
      active: goals.filter((g) => !g.isCompleted).length,
      completed: goals.filter((g) => g.isCompleted).length,
      completionRate: goals.length > 0
        ? Math.round((goals.filter((g) => g.isCompleted).length / goals.length) * 100)
        : 0,
    };

    return NextResponse.json({
      goals,
      stats,
    });
  } catch (error) {
    console.error('Goals fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

    const body = await request.json();
    const { title, description, targetValue, unit, deadline } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create new goal
    const goal = await db.goal.create({
      data: {
        userId: decoded.userId,
        title,
        description: description || null,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        currentValue: 0,
        unit: unit || null,
        deadline: deadline ? new Date(deadline) : null,
        isCompleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error('Goal creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
