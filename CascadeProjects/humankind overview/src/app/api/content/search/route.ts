import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const contentType = searchParams.get('content_type')
    const language = searchParams.get('language')
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Build search query
    let searchQuery = supabase
      .from('content_files')
      .select(`
        id,
        filename,
        original_filename,
        content_type,
        status,
        file_size,
        language,
        created_at,
        users!content_files_uploaded_by_fkey(name)
      `)
      .textSearch('original_filename', query)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (contentType) {
      searchQuery = searchQuery.eq('content_type', contentType)
    }

    if (language) {
      searchQuery = searchQuery.eq('language', language)
    }

    if (status) {
      searchQuery = searchQuery.eq('status', status)
    }

    if (clientId) {
      searchQuery = searchQuery.eq('uploaded_by', clientId)
    }

    const { data, error, count } = await searchQuery

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      query
    })

  } catch (error) {
    console.error('Content search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
