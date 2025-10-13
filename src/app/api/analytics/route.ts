import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeRange = searchParams.get('timeRange') || 'week'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Calculate date range based on timeRange
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Fetch posture sessions within date range
    const postureSessions = await db.postureSession.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate
        }
      },
      orderBy: { startTime: 'asc' }
    })

    // Fetch break sessions within date range
    const breakSessions = await db.breakSession.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Calculate analytics
    const totalSessions = postureSessions.length
    const totalDuration = postureSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const averageScore = totalSessions > 0 
      ? postureSessions.reduce((sum, session) => sum + (session.overallScore || 0), 0) / totalSessions 
      : 0
    const averageGoodPosture = totalSessions > 0 
      ? postureSessions.reduce((sum, session) => sum + (session.goodPosturePercent || 0), 0) / totalSessions 
      : 0
    const totalAlerts = postureSessions.reduce((sum, session) => sum + (session.alertsReceived || 0), 0)
    const averageCorrectionSpeed = totalSessions > 0 
      ? postureSessions.reduce((sum, session) => sum + (session.correctionSpeed || 0), 0) / totalSessions 
      : 0

    const completedBreaks = breakSessions.filter(session => session.completed).length
    const totalBreaks = breakSessions.length
    const breakCompletionRate = totalBreaks > 0 ? (completedBreaks / totalBreaks) * 100 : 0

    // Group sessions by day for trend analysis
    const dailyData = postureSessions.reduce((acc: any, session) => {
      const date = session.startTime.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          sessions: [],
          totalDuration: 0,
          averageScore: 0,
          goodPosturePercent: 0
        }
      }
      acc[date].sessions.push(session)
      acc[date].totalDuration += session.duration || 0
      return acc
    }, {})

    // Calculate daily averages
    Object.keys(dailyData).forEach(date => {
      const dayData = dailyData[date]
      const daySessions = dayData.sessions
      dayData.averageScore = daySessions.reduce((sum: number, session: any) => sum + (session.overallScore || 0), 0) / daySessions.length
      dayData.goodPosturePercent = daySessions.reduce((sum: number, session: any) => sum + (session.goodPosturePercent || 0), 0) / daySessions.length
    })

    // Analyze problem areas from deviation breakdowns
    const problemAreas: any = {}
    postureSessions.forEach(session => {
      if (session.deviationBreakdown) {
        try {
          const breakdown = JSON.parse(session.deviationBreakdown)
          Object.keys(breakdown).forEach(area => {
            if (!problemAreas[area]) {
              problemAreas[area] = 0
            }
            problemAreas[area] += breakdown[area]
          })
        } catch (e) {
          // Skip invalid JSON
        }
      }
    })

    // Calculate streaks
    const sortedSessions = postureSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    let currentStreak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    if (sortedSessions.length > 0) {
      const lastSessionDate = sortedSessions[0].startTime.toDateString()
      if (lastSessionDate === today || lastSessionDate === yesterday) {
        currentStreak = 1
        // Check for consecutive days
        for (let i = 1; i < sortedSessions.length; i++) {
          const currentDate = new Date(sortedSessions[i-1].startTime)
          const prevDate = new Date(sortedSessions[i].startTime)
          const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))
          
          if (daysDiff <= 1) {
            currentStreak++
          } else {
            break
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          totalSessions,
          totalDuration,
          averageScore: Math.round(averageScore),
          averageGoodPosture: Math.round(averageGoodPosture),
          totalAlerts,
          averageCorrectionSpeed: Math.round(averageCorrectionSpeed),
          completedBreaks,
          totalBreaks,
          breakCompletionRate: Math.round(breakCompletionRate),
          currentStreak,
          timeRange
        },
        dailyData: Object.values(dailyData),
        problemAreas,
        recentSessions: sortedSessions.slice(0, 10).map(session => ({
          ...session,
          deviationBreakdown: session.deviationBreakdown ? JSON.parse(session.deviationBreakdown) : {}
        }))
      }
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}