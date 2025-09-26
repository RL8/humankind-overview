'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface FileUploadProps {
  onUploadSuccess?: (file: any) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  className?: string
}

export default function FileUpload({
  onUploadSuccess,
  onUploadError,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className = ''
}: FileUploadProps) {
  const { user } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    if (!user) {
      onUploadError?.('You must be logged in to upload files')
      return
    }

    if (!multiple && files.length > 1) {
      onUploadError?.('Only one file can be uploaded at a time')
      return
    }

    for (const file of files) {
      if (file.size > maxSize) {
        onUploadError?.(`File ${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`)
        continue
      }

      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', user!.id)
      formData.append('language', 'en')
      formData.append('content_type', getContentType(file))

      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadedFile = await response.json()
      onUploadSuccess?.(uploadedFile)
      setUploadProgress(100)

    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getContentType = (file: File): string => {
    const type = file.type
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.startsWith('audio/')) return 'audio'
    if (type.includes('pdf')) return 'document'
    if (type.includes('word') || type.includes('document')) return 'document'
    if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation'
    return 'document'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="text-center">
          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                {' '}or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                {accept === '*/*' ? 'Any file type' : `Accepted: ${accept}`} (max {formatFileSize(maxSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}