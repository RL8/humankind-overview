import { supabase } from './supabase'
import { ContentType } from '@/services/content-service'

// File validation constants
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const ALLOWED_MIME_TYPES = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ],
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  video: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'audio/webm'
  ]
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  contentType?: ContentType
}

export interface UploadResult {
  path: string
  publicUrl: string
  fileSize: number
  fileName: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// File validation utilities
export function validateFile(file: File): FileValidationResult {
  const errors: string[] = []
  let contentType: ContentType = 'other'

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`)
  }

  // Check file type and determine content type
  let isValidType = false
  for (const [type, mimeTypes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimeTypes.includes(file.type)) {
      contentType = type as ContentType
      isValidType = true
      break
    }
  }

  if (!isValidType) {
    errors.push(`File type ${file.type} is not supported`)
  }

  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    errors.push('File name is required')
  }

  if (file.name.length > 255) {
    errors.push('File name must be less than 255 characters')
  }

  // Check for dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (dangerousExtensions.includes(fileExtension)) {
    errors.push('File type is not allowed for security reasons')
  }

  return {
    isValid: errors.length === 0,
    errors,
    contentType: isValidType ? contentType : undefined
  }
}

// Generate secure file path
export function generateFilePath(
  clientId: string,
  programmeId: string,
  fileName: string,
  userId: string
): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'))
  const sanitizedName = fileName
    .replace(fileExtension, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .substring(0, 50)
  
  return `clients/${clientId}/programmes/${programmeId}/${userId}/${timestamp}-${randomId}-${sanitizedName}${fileExtension}`
}

// Calculate file hash (for deduplication)
export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Storage service class
export class StorageService {
  private static readonly BUCKET_NAME = 'content'

  // Upload file to Supabase Storage
  static async uploadFile(
    file: File,
    filePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file first
      const validation = validateFile(file)
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`)
      }

      // Create file path if it doesn't exist
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath)

      return {
        path: uploadData.path,
        publicUrl: urlData.publicUrl,
        fileSize: file.size,
        fileName: file.name
      }
    } catch (error) {
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Download file from Supabase Storage
  static async downloadFile(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath)

      if (error) {
        throw new Error(`Download failed: ${error.message}`)
      }

      if (!data) {
        throw new Error('File not found')
      }

      return data
    } catch (error) {
      throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Delete file from Supabase Storage
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      throw new Error(`File deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get file public URL
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Create signed URL for temporary access
  static async createSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn)

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`)
      }

      if (!data) {
        throw new Error('Failed to generate signed URL')
      }

      return data.signedUrl
    } catch (error) {
      throw new Error(`Signed URL creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Copy file (for versioning or duplication)
  static async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .copy(sourcePath, destinationPath)

      if (error) {
        throw new Error(`Copy failed: ${error.message}`)
      }
    } catch (error) {
      throw new Error(`File copy failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Move file (for reorganization)
  static async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .move(sourcePath, destinationPath)

      if (error) {
        throw new Error(`Move failed: ${error.message}`)
      }
    } catch (error) {
      throw new Error(`File move failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // List files in a directory
  static async listFiles(path: string = ''): Promise<Array<{
    name: string
    id: string
    size: number
    created_at: string
    updated_at: string
    last_accessed_at: string
    metadata: Record<string, any>
  }>> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path, {
          limit: 100,
          offset: 0
        })

      if (error) {
        throw new Error(`List failed: ${error.message}`)
      }

      // Map the Supabase FileObject to our expected format
      return (data || []).map(file => ({
        name: file.name,
        id: file.id || file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at || new Date().toISOString(),
        updated_at: file.updated_at || new Date().toISOString(),
        last_accessed_at: file.last_accessed_at || new Date().toISOString(),
        metadata: file.metadata || {}
      }))
    } catch (error) {
      throw new Error(`File listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get file metadata
  static async getFileInfo(filePath: string): Promise<{
    size: number
    created_at: string
    updated_at: string
    last_accessed_at: string
    metadata: Record<string, any>
  } | null> {
    try {
      const files = await this.listFiles(filePath.substring(0, filePath.lastIndexOf('/')))
      const fileName = filePath.substring(filePath.lastIndexOf('/') + 1)
      const file = files.find(f => f.name === fileName)
      
      if (!file) {
        return null
      }

      return {
        size: file.size,
        created_at: file.created_at,
        updated_at: file.updated_at,
        last_accessed_at: file.last_accessed_at,
        metadata: file.metadata
      }
    } catch (error) {
      throw new Error(`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Check if file exists
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      const info = await this.getFileInfo(filePath)
      return info !== null
    } catch (error) {
      return false
    }
  }

  // Get storage usage statistics
  static async getStorageStats(path: string = ''): Promise<{
    totalFiles: number
    totalSize: number
    filesByType: Record<string, number>
    sizeByType: Record<string, number>
  }> {
    try {
      const files = await this.listFiles(path)
      
      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        filesByType: {} as Record<string, number>,
        sizeByType: {} as Record<string, number>
      }

      files.forEach(file => {
        const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase()
        
        stats.totalSize += file.size
        stats.filesByType[extension] = (stats.filesByType[extension] || 0) + 1
        stats.sizeByType[extension] = (stats.sizeByType[extension] || 0) + file.size
      })

      return stats
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Utility functions for file handling
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(fileName: string): string {
  return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
}

export function getContentTypeFromMimeType(mimeType: string): ContentType {
  for (const [type, mimeTypes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimeTypes.includes(mimeType)) {
      return type as ContentType
    }
  }
  return 'other'
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200) // Limit length
}

// File type icons mapping
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📈'
  return '📁'
}
