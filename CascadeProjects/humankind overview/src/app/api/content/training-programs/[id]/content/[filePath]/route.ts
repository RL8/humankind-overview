import { NextRequest, NextResponse } from 'next/server'
import { TrainingProgramService } from '@/services/training-program-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; filePath: string } }
) {
  try {
    // Use TrainingProgramService directly to avoid circular dependency
    const content = await TrainingProgramService.getContentFileContent(params.filePath)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content file not found' },
        { status: 404 }
      )
    }
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error fetching content file:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content file' },
      { status: 500 }
    )
  }
}
