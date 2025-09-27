import { NextRequest, NextResponse } from 'next/server'
import { TrainingProgramService } from '@/services/training-program-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use direct service call
    const languages = await TrainingProgramService.getAvailableLanguages(params.id)
    
    return NextResponse.json(languages)
  } catch (error) {
    console.error('Error fetching available languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available languages' },
      { status: 500 }
    )
  }
}