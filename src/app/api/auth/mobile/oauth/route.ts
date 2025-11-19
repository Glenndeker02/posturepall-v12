import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { provider, providerId, email, name, image } = await request.json()

    // Validation
    if (!provider || !providerId || !email) {
      return NextResponse.json(
        { success: false, error: 'Provider, providerId, and email are required' },
        { status: 400 }
      )
    }

    if (provider !== 'google' && provider !== 'apple') {
      return NextResponse.json(
        { success: false, error: 'Invalid provider. Must be "google" or "apple"' },
        { status: 400 }
      )
    }

    // Check if account already exists
    const existingAccount = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: providerId
        }
      },
      include: {
        user: true
      }
    })

    let user

    if (existingAccount) {
      // User exists, return existing user
      user = existingAccount.user
    } else {
      // Check if user with this email exists (might have signed up with different method)
      let existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        // User exists with email, link this OAuth account to existing user
        user = existingUser
      } else {
        // Create new user
        user = await db.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            image: image,
            emailVerified: new Date(),
            qrPairingCode: uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase(),
          }
        })
      }

      // Create account record to link OAuth provider
      await db.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider,
          providerAccountId: providerId,
        }
      })
    }

    // Create session token
    const sessionToken = uuidv4()
    const expires = new Date()
    expires.setDate(expires.getDate() + 30) // 30 days

    // Delete old expired sessions
    await db.session.deleteMany({
      where: {
        userId: user.id,
        expires: { lt: new Date() }
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
    console.error('OAuth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
