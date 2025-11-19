import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create or update session token
    const sessionToken = uuidv4()
    const expires = new Date()
    expires.setDate(expires.getDate() + 30) // 30 days

    // Delete old sessions for this user (optional, for security)
    await db.session.deleteMany({
      where: {
        userId: user.id,
        expires: { lt: new Date() } // Only delete expired sessions
      }
    })

    // Create new session
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
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
