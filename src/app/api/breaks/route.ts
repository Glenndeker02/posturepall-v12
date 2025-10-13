import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const breakData = await request.json()
    const { userId, breakType, exercises, duration, completed, pointsEarned } = breakData

    // Create new break session
    const breakSession = await db.breakSession.create({
      data: {
        userId,
        breakType,
        exercises: JSON.stringify(exercises),
        duration,
        completed,
        pointsEarned,
        mobileSynced: false
      }
    })

    return NextResponse.json({
      success: true,
      breakSession: {
        ...breakSession,
        exercises: JSON.parse(breakSession.exercises || '[]')
      }
    })
  } catch (error) {
    console.error('Break session creation error:', error)
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
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const breakSessions = await db.breakSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    const formattedSessions = breakSessions.map(session => ({
      ...session,
      exercises: JSON.parse(session.exercises || '[]')
    }))

    return NextResponse.json({
      success: true,
      breakSessions: formattedSessions
    })
  } catch (error) {
    console.error('Break sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}