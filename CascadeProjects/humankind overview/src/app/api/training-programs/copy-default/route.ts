import { NextRequest, NextResponse } from 'next/server'
import { DefaultProgramService } from '@/services/default-program-service'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userRole } = body

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userRole' },
        { status: 400 }
      )
    }

    // Verify user exists and get their role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to create copies
    if (!DefaultProgramService.canCreateCopy(user.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to create a copy of this program' },
        { status: 403 }
      )
    }

    // Create the personal copy
    const personalProgram = await DefaultProgramService.createPersonalCopy(userId, user.role)

    return NextResponse.json({
      success: true,
      program: personalProgram,
      message: 'Successfully created your personal copy of the Floorbook Approach program'
    })

  } catch (error) {
    console.error('Copy default program error:', error)
    return NextResponse.json(
      { error: 'Failed to create personal copy' },
      { status: 500 }
    )
  }
}
