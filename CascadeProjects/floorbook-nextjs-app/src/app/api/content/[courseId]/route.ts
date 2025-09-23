import { NextRequest, NextResponse } from 'next/server';
import { getCourseContent, CourseId, Language } from '@/lib/content-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const courseIdTyped = courseId as CourseId;
    const searchParams = request.nextUrl.searchParams;
    const language = (searchParams.get('lang') || 'en') as Language;

    const content = getCourseContent(courseIdTyped, language);
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
