import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { UserRole } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name, role, organization } = body

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      )
    }

    // Use UPSERT to create or update user record
    const { data, error } = await (supabaseAdmin as any)
      .from('users')
      .upsert({
        id: userId,
        email,
        name: name || 'Unknown User',
        role: role || UserRole.CLIENT,
        organization: organization || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select('id, email, name, role, organization, created_at, updated_at')
      .single()

    if (error) {
      console.error('Error upserting user:', error)
      return NextResponse.json(
        { error: 'Failed to create/update user record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data
    })

  } catch (error) {
    console.error('User upsert API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
