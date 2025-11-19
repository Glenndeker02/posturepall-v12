import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      })
    }

    // In a real implementation, you would:
    // 1. Generate a password reset token
    // 2. Store it in the database with an expiration time
    // 3. Send an email with the reset link

    // For now, we'll just return success
    // TODO: Implement email sending functionality
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database (you'd need to add these fields to the User model)
    // await db.user.update({
    //   where: { id: user.id },
    //   data: {
    //     resetPasswordToken: resetToken,
    //     resetPasswordExpires: resetExpires
    //   }
    // })

    console.log(`Password reset requested for ${email}`)
    console.log(`Reset token: ${resetToken} (expires: ${resetExpires})`)

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
