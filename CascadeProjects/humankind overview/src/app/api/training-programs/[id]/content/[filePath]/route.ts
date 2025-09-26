import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/middleware/auth-middleware'
import { TrainingProgramService } from '@/services/training-program-service'

// Get content file content with i18n processing
async function handleGetContentFile(
  req: NextRequest & { user?: any },
  { params }: { params: { id: string; filePath: string } }
) {
  try {
    const programId = params.id
    const filePath = decodeURIComponent(params.filePath)
    const { searchParams } = new URL(req.url)
    const language = searchParams.get('language') || 'en'
    
    // Get the raw content
    const content = await TrainingProgramService.getContentFileContent(filePath)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content file not found' },
        { status: 404 }
      )
    }
    
    // Process content with i18n variables and client placeholders
    const processedContent = await TrainingProgramService.processContent(
      content, 
      programId, 
      language
    )
    
    return NextResponse.json({
      content: processedContent,
      file_path: filePath,
      language,
      program_id: programId
    })

  } catch (error) {
    console.error('Get content file error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get content file' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGetContentFile, {
  requireAuth: true
}) as any
