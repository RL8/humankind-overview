import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Comment, CreateCommentInput } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('content_id')
    const contentType = searchParams.get('content_type')
    const status = searchParams.get('status')

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'content_id and content_type are required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('comments')
      .select(`
        *,
        users!comments_author_id_fkey(name, email)
      `)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content_id, content_type, message, author_id }: CreateCommentInput & { author_id: string } = body

    // Validate required fields
    if (!content_id || !content_type || !message || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: content_id, content_type, message, author_id' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content_id,
        content_type,
        message,
        author_id,
        status: 'open'
      })
      .select(`
        *,
        users!comments_author_id_fkey(name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
