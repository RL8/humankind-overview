import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TrainingProgram, CreateTrainingProgramInput } from '@/types'
import { DefaultProgramService } from '@/services/default-program-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeDefault = searchParams.get('include_default') !== 'false'

    // Get user programs from database
    let query = supabase
      .from('training_programs')
      .select(`
        *,
        client:users!training_programs_client_id_fkey(name, organization),
        creator:users!training_programs_created_by_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    // Handle database errors gracefully - still return default program if requested
    let allPrograms: any[] = []
    let totalCount = 0

    if (error) {
      console.error('Error fetching training programs from database:', error)
      // Don't return error immediately - continue with default program
    } else {
      allPrograms = data || []
      totalCount = count || 0
    }

    // Include default program if requested (always available, even if DB fails)
    if (includeDefault) {
      const defaultProgram = DefaultProgramService.getDefaultProgram()
      allPrograms = [defaultProgram, ...allPrograms]
      totalCount += 1
    }

    return NextResponse.json({
      data: allPrograms,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Training programs API error:', error)
    
    // Even in case of complete failure, try to return at least the default program
    try {
      const defaultProgram = DefaultProgramService.getDefaultProgram()
      return NextResponse.json({
        data: [defaultProgram],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1
        }
      })
    } catch (fallbackError) {
      console.error('Failed to load even default program:', fallbackError)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, client_id, created_by }: CreateTrainingProgramInput = body

    // Validate required fields
    if (!title || !client_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, client_id' },
        { status: 400 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('training_programs')
      .insert({
        title,
        description,
        client_id,
        created_by: created_by || client_id,
        status: 'draft'
      })
      .select(`
        *,
        client:users!training_programs_client_id_fkey(name, organization),
        creator:users!training_programs_created_by_fkey(name)
      `)
      .single()

    if (error) {
      console.error('Error creating training program:', error)
      return NextResponse.json(
        { error: 'Failed to create training program' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Create training program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}