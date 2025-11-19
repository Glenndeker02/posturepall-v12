import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        qrPairingCode: uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase(),
        emailVerified: new Date(), // Auto-verify for now
      }
    })

    // Create a session token for the user
    const sessionToken = uuidv4()
    const expires = new Date()
    expires.setDate(expires.getDate() + 30) // 30 days

    await db.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        subscriptionTier: user.subscriptionTier,
        workEnvironment: user.workEnvironment,
        dailySittingHours: user.dailySittingHours,
        painAreas: user.painAreas,
        workSchedule: user.workSchedule,
        userGoals: user.userGoals,
        calibrationData: user.calibrationData,
        qrPairingCode: user.qrPairingCode,
        mobileDeviceId: user.mobileDeviceId,
      },
      accessToken: sessionToken
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
