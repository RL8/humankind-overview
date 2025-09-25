import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware/auth-middleware'
import { StorageService } from '@/lib/storage'
import { ContentService } from '@/services/content-service'

async function handleDownload(
  req: NextRequest & { user?: any },
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id

    if (!req.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get content record
    const content = await ContentService.getContent(contentId)
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Create signed URL for secure download
    const signedUrl = await StorageService.createSignedUrl(content.file_path, 3600) // 1 hour expiry

    return NextResponse.json({
      download_url: signedUrl,
      filename: content.original_filename,
      file_size: content.file_size,
      mime_type: content.mime_type
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Download failed' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleDownload, {
  requireAuth: true
}) as any
