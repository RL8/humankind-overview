import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('training_programmes')
      .select(`
        *,
        users!training_programmes_client_id_fkey(name, organization),
        users!training_programmes_created_by_fkey(name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Training programme not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching training programme:', error)
      return NextResponse.json(
        { error: 'Failed to fetch training programme' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Training programme API error:', error)
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

    const { data, error } = await supabase
      .from('training_programmes')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        users!training_programmes_client_id_fkey(name, organization),
        users!training_programmes_created_by_fkey(name)
      `)
      .single()

    if (error) {
      console.error('Error updating training programme:', error)
      return NextResponse.json(
        { error: 'Failed to update training programme' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update training programme error:', error)
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
      .from('training_programmes')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting training programme:', error)
      return NextResponse.json(
        { error: 'Failed to delete training programme' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Training programme deleted successfully' })

  } catch (error) {
    console.error('Delete training programme error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}