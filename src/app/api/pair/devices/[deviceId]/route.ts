import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * DELETE /api/pair/devices/[deviceId]
 * Unpair a device
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    // Find the device
    const device = await db.pairedDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    // Mark as inactive (soft delete)
    await db.pairedDevice.update({
      where: { id: deviceId },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Device unpaired successfully',
    });
  } catch (error) {
    console.error('Error unpairing device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unpair device' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pair/devices/[deviceId]
 * Update device info (e.g., FCM token, last active time)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const body = await request.json();

    const updateData: any = {
      lastActiveAt: new Date(),
    };

    if (body.fcmToken) {
      updateData.fcmToken = body.fcmToken;
    }

    if (body.deviceName) {
      updateData.deviceName = body.deviceName;
    }

    const device = await db.pairedDevice.update({
      where: { id: deviceId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      device: {
        id: device.id,
        deviceName: device.deviceName,
        lastActiveAt: device.lastActiveAt,
      },
    });
  } catch (error) {
    console.error('Error updating device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update device' },
      { status: 500 }
    );
  }
}
