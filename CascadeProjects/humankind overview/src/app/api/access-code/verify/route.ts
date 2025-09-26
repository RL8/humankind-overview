import { NextRequest, NextResponse } from 'next/server'

// Simple access codes - in production, these would be stored in a database
const VALID_ACCESS_CODES = [
  'WELCOME2024',
  'ACCESS123',
  'TRAINING2024',
  'COURSE2024',
  'ADMIN2024'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      )
    }

    // Check if the code is valid
    const isValid = VALID_ACCESS_CODES.includes(code.toUpperCase())

    if (isValid) {
      return NextResponse.json({
        valid: true,
        message: 'Access code verified successfully'
      })
    } else {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid access code. Please check your email and try again.' 
        },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Access code verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
