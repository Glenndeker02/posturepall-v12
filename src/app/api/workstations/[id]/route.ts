import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/workstations/[id]
 * Get a specific workstation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const workstation = await db.workstation.findUnique({
      where: { id },
    });

    if (!workstation) {
      return NextResponse.json(
        { success: false, error: 'Workstation not found' },
        { status: 404 }
      );
    }

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
    console.error('Error fetching workstation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workstation' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workstations/[id]
 * Update a workstation (including calibration data)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, location, calibrationData, isDefault } = body;

    // Check if workstation exists
    const existingWorkstation = await db.workstation.findUnique({
      where: { id },
    });

    if (!existingWorkstation) {
      return NextResponse.json(
        { success: false, error: 'Workstation not found' },
        { status: 404 }
      );
    }

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await db.workstation.updateMany({
        where: {
          userId: existingWorkstation.userId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    // Update the workstation
    const workstation = await db.workstation.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location }),
        ...(calibrationData !== undefined && {
          calibrationData: JSON.stringify(calibrationData),
        }),
        ...(isDefault !== undefined && { isDefault }),
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
    console.error('Error updating workstation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workstation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workstations/[id]
 * Delete a workstation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if workstation exists
    const existingWorkstation = await db.workstation.findUnique({
      where: { id },
    });

    if (!existingWorkstation) {
      return NextResponse.json(
        { success: false, error: 'Workstation not found' },
        { status: 404 }
      );
    }

    // Delete the workstation
    await db.workstation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Workstation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workstation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete workstation' },
      { status: 500 }
    );
  }
}
