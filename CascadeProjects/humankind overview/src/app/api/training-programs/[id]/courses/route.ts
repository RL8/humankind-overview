import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Course, CreateCourseInput } from '@/types'
import { DefaultProgramService } from '@/services/default-program-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if this is the default program
    if (DefaultProgramService.isDefaultProgram(params.id)) {
      const defaultCourses = DefaultProgramService.getDefaultCourses()
      return NextResponse.json(defaultCourses)
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('programme_id', params.id)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error('Courses API error:', error)
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
    const { title, description, order_index }: CreateCourseInput = body

    // Validate required fields
    if (!title || order_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, order_index' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        programme_id: params.id,
        title,
        description,
        order_index,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
