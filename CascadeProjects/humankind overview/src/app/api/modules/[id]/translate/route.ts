import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TranslationService } from '@/services/translation-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { target_language } = body

    if (!target_language) {
      return NextResponse.json(
        { error: 'target_language is required' },
        { status: 400 }
      )
    }

    // Get the module
    const { data: module, error: moduleError } = await (supabase as any)
      .from('modules')
      .select('*')
      .eq('id', params.id)
      .single()

    if (moduleError || !module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    if (!module.content) {
      return NextResponse.json(
        { error: 'Module has no content to translate' },
        { status: 400 }
      )
    }

    // Translate the content
    const translation = await TranslationService.translateText({
      text: module.content,
      sourceLanguage: module.language || 'en',
      targetLanguage: target_language
    })

    // Create a new module with translated content
    const { data: translatedModule, error: createError } = await (supabase as any)
      .from('modules')
      .insert({
        course_id: module.course_id,
        title: `[${target_language.toUpperCase()}] ${module.title}`,
        content: translation.translatedText,
        order_index: module.order_index,
        language: target_language,
        status: 'draft'
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating translated module:', createError)
      return NextResponse.json(
        { error: 'Failed to create translated module' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Translation completed successfully',
      translatedModule,
      confidence: translation.confidence
    })

  } catch (error) {
    console.error('Module translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
