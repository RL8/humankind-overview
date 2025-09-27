import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Get user role from database
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('users')
      .select('role, email, name, organization')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return NextResponse.json({
          success: false,
          role: null,
          message: 'User not found'
        })
      }
      
      console.error('Error fetching user role:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      role: data.role,
      user: {
        id: userId,
        email: data.email,
        name: data.name,
        organization: data.organization
      }
    })

  } catch (error) {
    console.error('User role API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
