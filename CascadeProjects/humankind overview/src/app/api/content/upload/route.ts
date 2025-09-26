import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('user_id') as string
    const language = formData.get('language') as string || 'en'
    const contentType = formData.get('content_type') as string || 'document'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'audio/wav'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `content/${userId}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('content-files')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('content-files')
      .getPublicUrl(filePath)

    // Save file metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('content_files')
      .insert({
        uploaded_by: userId,
        language,
        filename: fileName,
        original_filename: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        content_type: contentType,
        status: 'draft'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('content-files').remove([filePath])
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: dbData.id,
      filename: dbData.filename,
      original_filename: dbData.original_filename,
      file_size: dbData.file_size,
      mime_type: dbData.mime_type,
      content_type: dbData.content_type,
      public_url: urlData.publicUrl,
      status: dbData.status,
      created_at: dbData.created_at
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}