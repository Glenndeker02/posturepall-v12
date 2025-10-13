import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const syncData = await request.json()
    const { userId, deviceId, sessions, breaks, lastSyncTime } = syncData

    // Verify user exists and has this mobile device paired
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.mobileDeviceId !== deviceId) {
      return NextResponse.json(
        { error: 'Unauthorized device or user not found' },
        { status: 401 }
      )
    }

    const syncResults = {
      sessionsSynced: 0,
      breaksSynced: 0,
      errors: []
    }

    // Sync posture sessions
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        try {
          // Check if session already exists
          const existingSession = await db.postureSession.findFirst({
            where: {
              userId,
              startTime: new Date(session.startTime)
            }
          })

          if (!existingSession) {
            await db.postureSession.create({
              data: {
                userId,
                startTime: new Date(session.startTime),
                endTime: session.endTime ? new Date(session.endTime) : null,
                duration: session.duration,
                overallScore: session.overallScore,
                goodPosturePercent: session.goodPosturePercent,
                deviationBreakdown: JSON.stringify(session.deviationBreakdown),
                alertsReceived: session.alertsReceived,
                correctionSpeed: session.correctionSpeed,
                pointsEarned: session.pointsEarned,
                mobileSynced: true
              }
            })
            syncResults.sessionsSynced++
          }
        } catch (error) {
          syncResults.errors.push(`Failed to sync session ${session.startTime}: ${error}`)
        }
      }
    }

    // Sync break sessions
    if (breaks && breaks.length > 0) {
      for (const breakSession of breaks) {
        try {
          // Check if break session already exists
          const existingBreak = await db.breakSession.findFirst({
            where: {
              userId,
              createdAt: new Date(breakSession.createdAt)
            }
          })

          if (!existingBreak) {
            await db.breakSession.create({
              data: {
                userId,
                breakType: breakSession.breakType,
                exercises: JSON.stringify(breakSession.exercises),
                duration: breakSession.duration,
                completed: breakSession.completed,
                pointsEarned: breakSession.pointsEarned,
                createdAt: new Date(breakSession.createdAt),
                mobileSynced: true
              }
            })
            syncResults.breaksSynced++
          }
        } catch (error) {
          syncResults.errors.push(`Failed to sync break ${breakSession.createdAt}: ${error}`)
        }
      }
    }

    // Mark web sessions as synced to mobile
    const unsyncedWebSessions = await db.postureSession.updateMany({
      where: {
        userId,
        mobileSynced: false,
        endTime: { not: null }
      },
      data: {
        mobileSynced: true
      }
    })

    const unsyncedWebBreaks = await db.breakSession.updateMany({
      where: {
        userId,
        mobileSynced: false
      },
      data: {
        mobileSynced: true
      }
    })

    return NextResponse.json({
      success: true,
      syncResults: {
        ...syncResults,
        webSessionsMarkedSynced: unsyncedWebSessions.count,
        webBreaksMarkedSynced: unsyncedWebBreaks.count,
        syncTime: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Sync error:', error)
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
    const deviceId = searchParams.get('deviceId')
    const lastSyncTime = searchParams.get('lastSyncTime')

    if (!userId || !deviceId) {
      return NextResponse.json(
        { error: 'User ID and device ID are required' },
        { status: 400 }
      )
    }

    // Verify user exists and has this mobile device paired
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.mobileDeviceId !== deviceId) {
      return NextResponse.json(
        { error: 'Unauthorized device or user not found' },
        { status: 401 }
      )
    }

    // Get unsynced web sessions and breaks
    const sessionFilter: any = {
      userId,
      mobileSynced: false,
      endTime: { not: null }
    }

    const breakFilter: any = {
      userId,
      mobileSynced: false
    }

    if (lastSyncTime) {
      sessionFilter.startTime = { gte: new Date(lastSyncTime) }
      breakFilter.createdAt = { gte: new Date(lastSyncTime) }
    }

    const unsyncedSessions = await db.postureSession.findMany({
      where: sessionFilter,
      orderBy: { startTime: 'asc' }
    })

    const unsyncedBreaks = await db.breakSession.findMany({
      where: breakFilter,
      orderBy: { createdAt: 'asc' }
    })

    // Format data for mobile app
    const formattedSessions = unsyncedSessions.map(session => ({
      id: session.id,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
      duration: session.duration,
      overallScore: session.overallScore,
      goodPosturePercent: session.goodPosturePercent,
      deviationBreakdown: session.deviationBreakdown ? JSON.parse(session.deviationBreakdown) : {},
      alertsReceived: session.alertsReceived,
      correctionSpeed: session.correctionSpeed,
      pointsEarned: session.pointsEarned
    }))

    const formattedBreaks = unsyncedBreaks.map(breakSession => ({
      id: breakSession.id,
      breakType: breakSession.breakType,
      exercises: breakSession.exercises ? JSON.parse(breakSession.exercises) : [],
      duration: breakSession.duration,
      completed: breakSession.completed,
      pointsEarned: breakSession.pointsEarned,
      createdAt: breakSession.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: {
        sessions: formattedSessions,
        breaks: formattedBreaks,
        user: {
          calibrationData: user.calibrationData ? JSON.parse(user.calibrationData) : {},
          subscriptionTier: user.subscriptionTier,
          goals: user.userGoals ? JSON.parse(user.userGoals) : {}
        },
        syncTime: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Sync fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}