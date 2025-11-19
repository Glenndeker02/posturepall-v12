import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/pair/generate
 * Generate a new pairing code for QR code
 *
 * This endpoint generates a unique pairing code that will be encoded in the QR code.
 * The mobile app will scan this QR and use it to establish the connection.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a unique pairing code (valid for 5 minutes)
    const pairingCode = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update user's pairing code
    await db.user.update({
      where: { id: userId },
      data: {
        qrPairingCode: pairingCode,
      },
    });

    // Prepare QR code data
    const qrData = {
      code: pairingCode,
      userId: userId,
      timestamp: Date.now(),
      expiresAt: expiresAt.toISOString(),
      version: '1.0',
    };

    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrData),
      pairingCode,
      expiresAt: expiresAt.toISOString(),
      expiresIn: 300, // seconds
    });
  } catch (error) {
    console.error('Error generating pairing code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate pairing code' },
      { status: 500 }
    );
  }
}
