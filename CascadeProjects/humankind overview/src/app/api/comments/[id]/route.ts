import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, message } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (message !== undefined) updateData.message = message

    const { data, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        users!comments_author_id_fkey(name, email)
      `)
      .single()

    if (error) {
      console.error('Error updating comment:', error)
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update comment error:', error)
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
      .from('comments')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Comment deleted successfully' })

  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
