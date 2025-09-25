import { NextRequest, NextResponse } from 'next/server'
import { AuthService, UserRole, type RegisterData } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, organization } = body

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, role' },
        { status: 400 }
      )
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: composer, principal, client, admin' },
        { status: 400 }
      )
    }

    const registerData: RegisterData = {
      email,
      password,
      name,
      role: role as UserRole,
      organization
    }

    const { user, error } = await AuthService.register(registerData)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email to confirm your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        role: user.user_metadata?.role,
        organization: user.user_metadata?.organization
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
