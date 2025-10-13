import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()
    const { userId, startTime, endTime, duration, overallScore, goodPosturePercent, deviationBreakdown, alertsReceived, correctionSpeed, pointsEarned } = sessionData

    // Create new posture session
    const session = await db.postureSession.create({
      data: {
        userId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        overallScore,
        goodPosturePercent,
        deviationBreakdown: JSON.stringify(deviationBreakdown),
        alertsReceived,
        correctionSpeed,
        pointsEarned,
        mobileSynced: false
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        ...session,
        deviationBreakdown: JSON.parse(session.deviationBreakdown || '{}')
      }
    })
  } catch (error) {
    console.error('Session creation error:', error)
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
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const sessions = await db.postureSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: limit
    })

    const formattedSessions = sessions.map(session => ({
      ...session,
      deviationBreakdown: JSON.parse(session.deviationBreakdown || '{}')
    }))

    return NextResponse.json({
      success: true,
      sessions: formattedSessions
    })
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionId, endTime, duration, overallScore, goodPosturePercent, deviationBreakdown, alertsReceived, correctionSpeed, pointsEarned } = await request.json()

    const session = await db.postureSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(endTime),
        duration,
        overallScore,
        goodPosturePercent,
        deviationBreakdown: JSON.stringify(deviationBreakdown),
        alertsReceived,
        correctionSpeed,
        pointsEarned
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        deviationBreakdown: JSON.parse(session.deviationBreakdown || '{}')
      }
    })
  } catch (error) {
    console.error('Session update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}