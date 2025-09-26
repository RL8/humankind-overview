import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Module, CreateModuleInput } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', params.id)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching modules:', error)
      return NextResponse.json(
        { error: 'Failed to fetch modules' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error('Modules API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, order_index, language = 'en' }: CreateModuleInput = body

    // Validate required fields
    if (!title || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, order_index' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('modules')
      .insert({
        course_id: params.id,
        title,
        content,
        order_index,
        language,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating module:', error)
      return NextResponse.json(
        { error: 'Failed to create module' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Create module error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
