import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/workstations
 * List all workstations for a user
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

    const workstations = await db.workstation.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      workstations: workstations.map((ws) => ({
        ...ws,
        calibrationData: ws.calibrationData ? JSON.parse(ws.calibrationData) : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching workstations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workstations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workstations
 * Create a new workstation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, location, calibrationData, isDefault } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { success: false, error: 'User ID and name are required' },
        { status: 400 }
      );
    }

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await db.workstation.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create the workstation
    const workstation = await db.workstation.create({
      data: {
        userId,
        name,
        location: location || null,
        calibrationData: calibrationData ? JSON.stringify(calibrationData) : null,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      workstation: {
        ...workstation,
        calibrationData: workstation.calibrationData
          ? JSON.parse(workstation.calibrationData)
          : null,
      },
    });
  } catch (error) {
    console.error('Error creating workstation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workstation' },
      { status: 500 }
    );
  }
}
