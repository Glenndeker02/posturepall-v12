import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData, calculateDailyStats, updateStreaks } from '@/lib/analytics/dashboard-analytics';

/**
 * GET /api/dashboard?userId={id}
 * Get dashboard data for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const dashboardData = await getDashboardData(userId);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/refresh
 * Manually trigger daily stats calculation and streak update
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const targetDate = date ? new Date(date) : new Date();

    // Calculate/update daily stats
    await calculateDailyStats(userId, targetDate);

    // Update streaks
    await updateStreaks(userId, targetDate);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to refresh dashboard' },
      { status: 500 }
    );
  }
}
