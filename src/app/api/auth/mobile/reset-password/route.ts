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

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    })

    // In production, you would send an email with the reset link here
    // Example: await sendPasswordResetEmail(email, resetToken)
    // For now, we'll log it for development purposes
    console.log(`Password reset requested for ${email}`)
    console.log(`Reset token: ${resetToken} (expires: ${resetExpires})`)
    console.log(`Reset URL: http://localhost:3000/auth/reset-password?token=${resetToken}`)

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
