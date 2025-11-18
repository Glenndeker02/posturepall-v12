import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/pair/devices?userId=xxx
 * Get all paired devices for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const devices = await db.pairedDevice.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        lastActiveAt: 'desc',
      },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        deviceType: true,
        lastSyncedAt: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      devices,
      count: devices.length,
    });
  } catch (error) {
    console.error('Error fetching paired devices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch paired devices' },
      { status: 500 }
    );
  }
}
