import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/pair/connect
 * Mobile app calls this after scanning QR code to establish connection
 *
 * Request body:
 * {
 *   pairingCode: string,
 *   deviceId: string (unique device identifier),
 *   deviceName: string (e.g., "iPhone 14 Pro"),
 *   deviceType: 'ios' | 'android',
 *   fcmToken?: string (for push notifications)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { pairingCode, deviceId, deviceName, deviceType, fcmToken } =
      await request.json();

    // Validate required fields
    if (!pairingCode || !deviceId || !deviceName || !deviceType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: pairingCode, deviceId, deviceName, deviceType',
        },
        { status: 400 }
      );
    }

    // Find user with this pairing code
    const user = await db.user.findUnique({
      where: { qrPairingCode: pairingCode },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired pairing code',
        },
        { status: 404 }
      );
    }

    // Check if device is already paired (and just updating)
    const existingDevice = await db.pairedDevice.findUnique({
      where: { deviceId },
    });

    let pairedDevice;

    if (existingDevice) {
      // Update existing device
      pairedDevice = await db.pairedDevice.update({
        where: { deviceId },
        data: {
          deviceName,
          deviceType,
          fcmToken,
          isActive: true,
          lastActiveAt: new Date(),
          pairingCode, // Update to new pairing code
        },
      });
    } else {
      // Create new paired device
      pairedDevice = await db.pairedDevice.create({
        data: {
          userId: user.id,
          deviceId,
          deviceName,
          deviceType,
          pairingCode,
          fcmToken,
          isActive: true,
        },
      });
    }

    // Clear the pairing code from user (one-time use)
    await db.user.update({
      where: { id: user.id },
      data: {
        qrPairingCode: null,
      },
    });

    // Return user data and pairing confirmation
    return NextResponse.json({
      success: true,
      message: 'Device paired successfully',
      device: {
        id: pairedDevice.id,
        deviceId: pairedDevice.deviceId,
        deviceName: pairedDevice.deviceName,
        deviceType: pairedDevice.deviceType,
        pairedAt: pairedDevice.createdAt,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error connecting device:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect device' },
      { status: 500 }
    );
  }
}
