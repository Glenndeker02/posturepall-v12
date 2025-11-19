import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const exercises = await db.exercise.findMany({
      orderBy: [
        { category: 'asc' },
        { difficulty: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      exercises
    })
  } catch (error) {
    console.error('Get exercises error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const exerciseData = await request.json()
    const {
      name,
      category,
      description,
      instructions,
      duration,
      difficulty,
      imageUrl,
      gifUrl
    } = exerciseData

    // Validation
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const exercise = await db.exercise.create({
      data: {
        name,
        category,
        description,
        instructions: instructions ? JSON.stringify(instructions) : null,
        duration,
        difficulty: difficulty || 'gentle',
        imageUrl,
        gifUrl
      }
    })

    return NextResponse.json({
      success: true,
      exercise
    })
  } catch (error) {
    console.error('Create exercise error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
