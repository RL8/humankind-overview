'use client'

import React from 'react'
import { Editor } from '@tinymce/tinymce-react'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing here...',
  height = 500,
}: RichTextEditorProps) {
  const handleEditorChange = (content: string, editor: any) => {
    onChange(content)
  }

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'} // Replace with your TinyMCE API key
      init={{
        height: height,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help',
        placeholder: placeholder,
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
      value={value}
      onEditorChange={handleEditorChange}
    />
  )
}
