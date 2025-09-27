import { NextRequest, NextResponse } from 'next/server'
import { TrainingProgramService } from '@/services/training-program-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'en'
    
    // Use direct service call instead of ContentFileService
    const program = await TrainingProgramService.getTrainingProgram(params.id)
    if (!program) {
      return NextResponse.json(
        { error: 'Training program not found' },
        { status: 404 }
      )
    }
    
    // Get available languages
    const availableLanguages = await TrainingProgramService.getAvailableLanguages(params.id)
    const targetLanguage = availableLanguages.includes(language) ? language : availableLanguages[0] || 'en'
    
    // For now, return mock data structure that matches ContentFileData interface
    // In a real implementation, you would get actual files from the file system
    const mockFiles = [
      {
        id: `base/floorbook-approach/content-grids/${targetLanguage}/floorbook-approach-${targetLanguage}.md`,
        filename: `floorbook-approach-${targetLanguage}.md`,
        file_path: `base/floorbook-approach/content-grids/${targetLanguage}/floorbook-approach-${targetLanguage}.md`,
        language: targetLanguage,
        content_type: 'markdown' as const,
        size: 5000,
        last_modified: '2024-01-01T00:00:00Z'
      }
    ]
    
    return NextResponse.json(mockFiles)
  } catch (error) {
    console.error('Error fetching content files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content files' },
      { status: 500 }
    )
  }
}
