import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DefaultProgramService } from '@/services/default-program-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if this is the default program
    if (DefaultProgramService.isDefaultProgram(params.id)) {
      const defaultProgram = DefaultProgramService.getDefaultProgram()
      return NextResponse.json(defaultProgram)
    }

    const { data, error } = await supabase
      .from('training_programs')
      .select(`
        *,
        client:users!training_programs_client_id_fkey(name, organization),
        creator:users!training_programs_created_by_fkey(name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Training program not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching training program:', error)
      return NextResponse.json(
        { error: 'Failed to fetch training program' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Training program API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, status } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await (supabase as any)
      .from('training_programs')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        client:users!training_programs_client_id_fkey(name, organization),
        creator:users!training_programs_created_by_fkey(name)
      `)
      .single()

    if (error) {
      console.error('Error updating training program:', error)
      return NextResponse.json(
        { error: 'Failed to update training program' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update training program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting training program:', error)
      return NextResponse.json(
        { error: 'Failed to delete training program' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Training program deleted successfully' })

  } catch (error) {
    console.error('Delete training program error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}