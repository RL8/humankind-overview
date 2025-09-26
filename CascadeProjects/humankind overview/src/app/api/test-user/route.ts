import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/auth'
import { config } from '@/lib/config'

/**
 * API endpoint to create a temporary test user for development
 * Only available in development environment
 */
export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (!config.app.isDevelopment) {
    return NextResponse.json(
      { error: 'Test user creation is only available in development' },
      { status: 403 }
    )
  }

  try {
    const { role = 'composer' } = await request.json()
    
    // Validate role
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Generate unique test user credentials
    const timestamp = Date.now()
    const testEmail = `test.user.${timestamp}@example.com`
    const testPassword = 'TestPassword123!'
    const testName = `Test User ${timestamp}`

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm for test users
      user_metadata: {
        name: testName,
        role: role,
        organization: 'Test Organization',
        is_test_user: true
      }
    })

    if (authError) {
      console.error('Error creating test user:', authError)
      return NextResponse.json(
        { error: 'Failed to create test user' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user data returned' },
        { status: 500 }
      )
    }

    // Create user record in database
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        name: testName,
        role: role as UserRole,
        organization: 'Test Organization',
        created_at: new Date().toISOString()
      } as any)
      .select()

    if (dbError) {
      console.error('Error creating user record:', dbError)
      console.error('Database error details:', JSON.stringify(dbError, null, 2))
      
      // Try to get the user record to see if it already exists
      const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle()
      
      if (fetchError) {
        console.error('Error fetching existing user:', fetchError)
      } else if (existingUser) {
        console.log('User record already exists:', existingUser)
      } else {
        console.log('No existing user record found')
      }
      
      // If user record creation fails, we should still return success
      // since the auth user is created and can be used
      console.log('Continuing with auth user only...')
    } else {
      console.log('User record created successfully in database:', userData)
    }

    return NextResponse.json({
      success: true,
      user: {
        email: testEmail,
        password: testPassword,
        name: testName,
        role: role
      }
    })

  } catch (error) {
    console.error('Test user creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
