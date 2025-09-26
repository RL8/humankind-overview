import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TrainingProgramme, CreateTrainingProgrammeInput } from '@/types'
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
      .from('training_programmes')
      .select(`
        *,
        client:users!training_programmes_client_id_fkey(name, organization),
        creator:users!training_programmes_created_by_fkey(name)
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

    if (error) {
      console.error('Error fetching training programmes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch training programmes' },
        { status: 500 }
      )
    }

    // Include default program if requested
    let allPrograms = data || []
    if (includeDefault) {
      const defaultProgram = DefaultProgramService.getDefaultProgram()
      allPrograms = [defaultProgram, ...allPrograms]
    }

    return NextResponse.json({
      data: allPrograms,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: (count || 0) + (includeDefault ? 1 : 0),
        totalPages: Math.ceil(((count || 0) + (includeDefault ? 1 : 0)) / limit)
      }
    })

  } catch (error) {
    console.error('Training programmes API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, client_id, created_by }: CreateTrainingProgrammeInput = body

    // Validate required fields
    if (!title || !client_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, client_id' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('training_programmes')
      .insert({
        title,
        description,
        client_id,
        created_by: created_by || client_id,
        status: 'draft'
      })
      .select(`
        *,
        client:users!training_programmes_client_id_fkey(name, organization),
        creator:users!training_programmes_created_by_fkey(name)
      `)
      .single()

    if (error) {
      console.error('Error creating training programme:', error)
      return NextResponse.json(
        { error: 'Failed to create training programme' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Create training programme error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}