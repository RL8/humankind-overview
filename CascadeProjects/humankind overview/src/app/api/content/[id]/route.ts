import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware/auth-middleware'
import { ContentService } from '@/services/content-service'
import { StorageService } from '@/lib/storage'
import { UserRole } from '@/lib/auth'

// Get single content item
async function handleGetContent(
  req: NextRequest & { user?: any },
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id
    const content = await ContentService.getContent(contentId)

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Get metadata if it exists
    const metadata = await ContentService.getContentMetadata(contentId)

    // Get public URL for the file
    const publicUrl = StorageService.getPublicUrl(content.file_path)

    return NextResponse.json({
      content: {
        ...content,
        public_url: publicUrl
      },
      metadata
    })

  } catch (error) {
    console.error('Get content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get content' },
      { status: 500 }
    )
  }
}

// Update content metadata
async function handleUpdateContent(
  req: NextRequest & { user?: any },
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id
    const body = await req.json()
    
    const {
      title,
      description,
      language,
      content_type,
      status,
      programme_id,
      course_id,
      module_id,
      unit_id,
      metadata
    } = body

    // Update content file record
    const updates = {
      title,
      description,
      language,
      content_type,
      status,
      programme_id,
      course_id,
      module_id,
      unit_id
    }

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof typeof updates] === undefined) {
        delete updates[key as keyof typeof updates]
      }
    })

    const content = await ContentService.updateContent(contentId, updates)

    // Update metadata if provided
    if (metadata) {
      await ContentService.updateContentMetadata(contentId, metadata)
    }

    return NextResponse.json({
      message: 'Content updated successfully',
      content
    })

  } catch (error) {
    console.error('Update content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update content' },
      { status: 500 }
    )
  }
}

// Delete content
async function handleDeleteContent(
  req: NextRequest & { user?: any },
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id

    // Get content to get file path for deletion
    const content = await ContentService.getContent(contentId)
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Delete file from storage
    try {
      await StorageService.deleteFile(content.file_path)
    } catch (storageError) {
      console.warn('Failed to delete file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete content record from database
    await ContentService.deleteContent(contentId)

    return NextResponse.json({
      message: 'Content deleted successfully'
    })

  } catch (error) {
    console.error('Delete content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete content' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGetContent, {
  requireAuth: true
}) as any

export const PUT = withAuth(handleUpdateContent, {
  requireAuth: true,
  allowedRoles: [UserRole.COMPOSER, UserRole.PRINCIPAL, UserRole.ADMIN]
}) as any

export const DELETE = withAuth(handleDeleteContent, {
  requireAuth: true,
  allowedRoles: [UserRole.COMPOSER, UserRole.PRINCIPAL, UserRole.ADMIN]
}) as any
