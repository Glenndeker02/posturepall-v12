import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const { email, name, workEnvironment, dailySittingHours, painAreas, workSchedule, userGoals, calibrationData } = userData

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email }
    })

    if (user) {
      // Update existing user
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name,
          workEnvironment,
          dailySittingHours,
          painAreas: JSON.stringify(painAreas),
          workSchedule: JSON.stringify(workSchedule),
          userGoals: JSON.stringify(userGoals),
          calibrationData: JSON.stringify(calibrationData)
        }
      })
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          email,
          name,
          workEnvironment,
          dailySittingHours,
          painAreas: JSON.stringify(painAreas),
          workSchedule: JSON.stringify(workSchedule),
          userGoals: JSON.stringify(userGoals),
          calibrationData: JSON.stringify(calibrationData),
          qrPairingCode: uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        workEnvironment: user.workEnvironment,
        dailySittingHours: user.dailySittingHours,
        painAreas: JSON.parse(user.painAreas || '[]'),
        workSchedule: JSON.parse(user.workSchedule || '{}'),
        userGoals: JSON.parse(user.userGoals || '{}'),
        calibrationData: JSON.parse(user.calibrationData || '{}'),
        qrPairingCode: user.qrPairingCode
      }
    })
  } catch (error) {
    console.error('User creation/update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: userId ? { id: userId } : { email },
      include: {
        postureSessions: {
          orderBy: { startTime: 'desc' },
          take: 5
        },
        breakSessions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        workEnvironment: user.workEnvironment,
        dailySittingHours: user.dailySittingHours,
        painAreas: JSON.parse(user.painAreas || '[]'),
        workSchedule: JSON.parse(user.workSchedule || '{}'),
        userGoals: JSON.parse(user.userGoals || '{}'),
        calibrationData: JSON.parse(user.calibrationData || '{}'),
        qrPairingCode: user.qrPairingCode,
        mobileDeviceId: user.mobileDeviceId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, calibrationData, mobileDeviceId, subscriptionTier } = await request.json()

    const updateData: any = {}
    if (calibrationData) updateData.calibrationData = JSON.stringify(calibrationData)
    if (mobileDeviceId) updateData.mobileDeviceId = mobileDeviceId
    if (subscriptionTier) updateData.subscriptionTier = subscriptionTier

    const user = await db.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        calibrationData: JSON.parse(user.calibrationData || '{}'),
        mobileDeviceId: user.mobileDeviceId
      }
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}