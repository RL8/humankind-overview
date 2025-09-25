import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware/auth-middleware'
import { StorageService, validateFile, generateFilePath, calculateFileHash } from '@/lib/storage'
import { ContentService } from '@/services/content-service'
import { UserRole } from '@/lib/auth'

async function handleUpload(req: NextRequest & { user?: any }) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const programmeId = formData.get('programme_id') as string
    const courseId = formData.get('course_id') as string
    const moduleId = formData.get('module_id') as string
    const unitId = formData.get('unit_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const language = formData.get('language') as string || 'en'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!req.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `File validation failed: ${validation.errors.join(', ')}` },
        { status: 400 }
      )
    }

    // For now, use a default client ID if programme_id is not provided
    // In a real implementation, you'd get this from the programme or user context
    const clientId = 'default-client'

    // Generate file path
    const filePath = generateFilePath(
      clientId,
      programmeId || 'general',
      file.name,
      req.user.id
    )

    // Calculate file hash for deduplication
    const fileHash = await calculateFileHash(file)

    // Upload file to storage
    const uploadResult = await StorageService.uploadFile(file, filePath)

    // Create content record in database
    const contentData = {
      filename: uploadResult.fileName,
      original_filename: file.name,
      file_path: uploadResult.path,
      file_size: uploadResult.fileSize,
      mime_type: file.type,
      file_hash: fileHash,
      programme_id: programmeId || undefined,
      course_id: courseId || undefined,
      module_id: moduleId || undefined,
      unit_id: unitId || undefined,
      title: title || file.name,
      description: description || undefined,
      language,
      content_type: validation.contentType!,
      status: 'draft' as const
    }

    const content = await ContentService.createContent(contentData, req.user.id)

    return NextResponse.json({
      message: 'File uploaded successfully',
      content: {
        ...content,
        public_url: uploadResult.publicUrl
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handleUpload, {
  requireAuth: true,
  allowedRoles: [UserRole.COMPOSER, UserRole.PRINCIPAL, UserRole.ADMIN]
}) as any
