import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { config } from '@/lib/config'

/**
 * Debug endpoint to check and fix user records
 * Only available in development environment
 */
export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (!config.app.isDevelopment) {
    return NextResponse.json(
      { error: 'Debug endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    // Get user from auth
    const { data: authUser, error: authError } = await getSupabaseAdmin().auth.admin.getUserById(userId)
    
    if (authError) {
      return NextResponse.json(
        { error: 'Failed to get auth user', details: authError },
        { status: 404 }
      )
    }

    // Get user from database
    const { data: dbUser, error: dbError } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    const result: any = {
      authUser: authUser.user ? {
        id: authUser.user.id,
        email: authUser.user.email,
        user_metadata: authUser.user.user_metadata,
        created_at: authUser.user.created_at
      } : null,
      dbUser: dbUser,
      dbError: dbError,
      needsFix: !dbUser && authUser.user
    }

    // If user exists in auth but not in database, try to create it
    if (result.needsFix && authUser.user) {
      const { data: insertData, error: insertError } = await getSupabaseAdmin()
        .from('users')
        .insert({
          id: authUser.user.id,
          email: authUser.user.email!,
          name: authUser.user.user_metadata?.name || 'Unknown User',
          role: authUser.user.user_metadata?.role || 'client',
          organization: authUser.user.user_metadata?.organization || null,
          created_at: authUser.user.created_at
        } as any)
        .select()

      result.fixAttempt = {
        success: !insertError,
        data: insertData,
        error: insertError
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
