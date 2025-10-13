import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { qrCode, deviceId } = await request.json()

    if (!qrCode || !deviceId) {
      return NextResponse.json(
        { error: 'QR code and device ID are required' },
        { status: 400 }
      )
    }

    // Find user with this QR pairing code
    const user = await db.user.findUnique({
      where: { qrPairingCode: qrCode }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid QR code or pairing expired' },
        { status: 404 }
      )
    }

    // Update user with mobile device ID
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        mobileDeviceId: deviceId,
        qrPairingCode: null // Clear the pairing code after successful pairing
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        subscriptionTier: updatedUser.subscriptionTier
      }
    })
  } catch (error) {
    console.error('Pairing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Generate a new QR pairing code for the current session
    const pairingCode = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()
    
    // In a real implementation, you would store this with the user session
    // For now, we'll just return the code
    
    return NextResponse.json({
      pairingCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    })
  } catch (error) {
    console.error('Generate pairing code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}