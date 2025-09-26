import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware/auth-middleware'
import { ContentService } from '@/services/content-service'
import { ContentType } from '@/types'
import { UserRole } from '@/lib/auth'

// Get content list with optional filtering
async function handleGetContent(req: NextRequest & { user?: any }) {
  try {
    const { searchParams } = new URL(req.url)
    
    const filters = {
      query: searchParams.get('q') || undefined,
      content_type: searchParams.get('type') as ContentType || undefined,
      language: searchParams.get('language') || undefined,
      status: searchParams.get('status') || undefined,
      programme_id: searchParams.get('programme_id') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    let content
    if (filters.query) {
      // Use search if query is provided
      content = await ContentService.searchContent(filters)
    } else {
      // Use regular list if no search query
      content = await ContentService.getContentList(filters)
    }

    return NextResponse.json({
      content,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        has_more: content.length === filters.limit
      }
    })

  } catch (error) {
    console.error('Get content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get content' },
      { status: 500 }
    )
  }
}

// Create new content (metadata only, file upload is separate)
async function handleCreateContent(req: NextRequest & { user?: any }) {
  try {
    const body = await req.json()
    const {
      filename,
      original_filename,
      file_path,
      file_size,
      mime_type,
      file_hash,
      programme_id,
      course_id,
      module_id,
      unit_id,
      title,
      description,
      language,
      content_type,
      status
    } = body

    if (!filename || !file_path || !file_size || !mime_type || !content_type) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, file_path, file_size, mime_type, content_type' },
        { status: 400 }
      )
    }

    const contentData = {
      filename,
      original_filename: original_filename || filename,
      file_path,
      file_size,
      mime_type,
      file_hash,
      programme_id,
      course_id,
      module_id,
      unit_id,
      title,
      description,
      language: language || 'en',
      content_type,
      status: status || 'draft'
    }

    const content = await ContentService.createContent(contentData, req.user!.id)

    return NextResponse.json({
      message: 'Content created successfully',
      content
    })

  } catch (error) {
    console.error('Create content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create content' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGetContent, {
  requireAuth: true
}) as any

export const POST = withAuth(handleCreateContent, {
  requireAuth: true,
  allowedRoles: [UserRole.COMPOSER, UserRole.PRINCIPAL, UserRole.ADMIN]
}) as any
