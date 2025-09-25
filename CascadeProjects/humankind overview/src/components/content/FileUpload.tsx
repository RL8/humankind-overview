'use client'

import React, { useState, useRef } from 'react'
import { validateFile, formatFileSize, getFileTypeIcon } from '@/lib/storage'
import { ContentType } from '@/services/content-service'

interface FileUploadProps {
  onUpload?: (file: File, metadata: UploadMetadata) => Promise<void>
  onProgress?: (progress: number) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  programmeId?: string
  courseId?: string
  moduleId?: string
  unitId?: string
}

interface UploadMetadata {
  title?: string
  description?: string
  language?: string
  programme_id?: string
  course_id?: string
  module_id?: string
  unit_id?: string
}

interface UploadFile extends File {
  id: string
  preview?: string
  uploadProgress?: number
  error?: string
  contentType?: ContentType
}

export default function FileUpload({
  onUpload,
  onProgress,
  accept,
  maxSize,
  multiple = false,
  disabled = false,
  className = '',
  programmeId,
  courseId,
  moduleId,
  unitId
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => {
      const validation = validateFile(file)
      const uploadFile = file as UploadFile
      uploadFile.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      uploadFile.contentType = validation.contentType
      
      if (!validation.isValid) {
        uploadFile.error = validation.errors.join(', ')
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        uploadFile.preview = URL.createObjectURL(file)
      }

      return uploadFile
    })

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles])
    } else {
      setFiles(newFiles)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Revoke object URL to prevent memory leaks
      const removedFile = prev.find(f => f.id === fileId)
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview)
      }
      return updated
    })
  }

  const uploadFile = async (file: UploadFile, metadata: UploadMetadata) => {
    if (!onUpload || file.error) return

    try {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, uploadProgress: 0 }
          : f
      ))

      await onUpload(file, metadata)

      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, uploadProgress: 100 }
          : f
      ))
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ))
    }
  }

  const uploadAllFiles = async () => {
    if (!onUpload || isUploading) return

    setIsUploading(true)
    
    try {
      const validFiles = files.filter(f => !f.error)
      
      for (const file of validFiles) {
        const metadata: UploadMetadata = {
          title: file.name,
          description: '',
          language: 'en',
          programme_id: programmeId,
          course_id: courseId,
          module_id: moduleId,
          unit_id: unitId
        }

        await uploadFile(file, metadata)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const clearFiles = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    setFiles([])
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileInputChange}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <div className="text-lg font-medium text-gray-900">
            {isDragOver ? 'Drop files here' : 'Drop files or click to browse'}
          </div>
          <div className="text-sm text-gray-500">
            {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
            {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Selected Files ({files.length})</h3>
            <div className="space-x-2">
              <button
                onClick={uploadAllFiles}
                disabled={isUploading || files.every(f => f.error || f.uploadProgress === 100)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
              <button
                onClick={clearFiles}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={() => removeFile(file.id)}
                onUpload={(metadata) => uploadFile(file, metadata)}
                disabled={isUploading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface FileItemProps {
  file: UploadFile
  onRemove: () => void
  onUpload: (metadata: UploadMetadata) => Promise<void>
  disabled?: boolean
}

function FileItem({ file, onRemove, onUpload, disabled }: FileItemProps) {
  const [metadata, setMetadata] = useState<UploadMetadata>({
    title: file.name,
    description: '',
    language: 'en'
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleUpload = async () => {
    await onUpload(metadata)
  }

  const isUploaded = file.uploadProgress === 100
  const hasError = !!file.error
  const isUploading = file.uploadProgress !== undefined && file.uploadProgress < 100

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        {/* File Icon/Preview */}
        <div className="flex-shrink-0">
          {file.preview ? (
            <img
              src={file.preview}
              alt={file.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center text-2xl">
              {getFileTypeIcon(file.type)}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            {file.contentType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {file.contentType}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formatFileSize(file.size)}
          </p>
          
          {hasError && (
            <p className="text-sm text-red-600 mt-1">
              Error: {file.error}
            </p>
          )}
          
          {isUploading && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${file.uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {file.uploadProgress}%
                </span>
              </div>
            </div>
          )}
          
          {isUploaded && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Uploaded successfully
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {!hasError && !isUploaded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Less' : 'Details'}
            </button>
          )}
          
          <button
            onClick={onRemove}
            disabled={disabled}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && !hasError && !isUploaded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={metadata.title || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={metadata.description || ''}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              value={metadata.language || 'en'}
              onChange={(e) => setMetadata(prev => ({ ...prev, language: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="nl">Dutch</option>
              <option value="fr">French</option>
              <option value="zh-cn">Chinese (Simplified)</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleUpload}
              disabled={disabled || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
