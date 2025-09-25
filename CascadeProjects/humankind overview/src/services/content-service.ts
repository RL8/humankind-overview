import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

// Content types and interfaces
export interface ContentFile {
  id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  file_hash?: string
  storage_bucket: string
  
  // Content association
  programme_id?: string
  course_id?: string
  module_id?: string
  unit_id?: string
  
  // Metadata
  title?: string
  description?: string
  language: string
  content_type: ContentType
  status: ContentStatus
  
  // Ownership and timestamps
  uploaded_by?: string
  created_at: string
  updated_at: string
}

export interface ContentVersion {
  id: string
  content_file_id: string
  version_number: number
  file_path: string
  file_size: number
  file_hash?: string
  change_summary?: string
  changed_by?: string
  created_at: string
}

export interface ContentMetadata {
  id: string
  content_file_id: string
  tags?: string[]
  keywords?: string[]
  duration_minutes?: number
  page_count?: number
  resolution?: string
  difficulty_level?: DifficultyLevel
  learning_objectives?: string[]
  prerequisites?: string[]
  custom_properties?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ContentSearchResult {
  id: string
  title?: string
  description?: string
  filename: string
  content_type: ContentType
  language: string
  status: ContentStatus
  file_size: number
  mime_type?: string
  created_at: string
  programme_title?: string
  uploaded_by_name?: string
  rank?: number
}

export type ContentType = 'document' | 'image' | 'video' | 'audio' | 'other'
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface CreateContentData {
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  file_hash?: string
  programme_id?: string
  course_id?: string
  module_id?: string
  unit_id?: string
  title?: string
  description?: string
  language?: string
  content_type: ContentType
  status?: ContentStatus
}

export interface UpdateContentData {
  title?: string
  description?: string
  language?: string
  content_type?: ContentType
  status?: ContentStatus
  programme_id?: string
  course_id?: string
  module_id?: string
  unit_id?: string
}

export interface SearchFilters {
  query?: string
  content_type?: ContentType
  language?: string
  status?: ContentStatus
  client_id?: string
  programme_id?: string
  limit?: number
  offset?: number
}

export class ContentService {
  // Create content file record
  static async createContent(data: CreateContentData, userId: string): Promise<ContentFile> {
    const { data: result, error } = await supabase
      .from('content_files')
      .insert({
        ...data,
        uploaded_by: userId,
        language: data.language || 'en',
        status: data.status || 'draft'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create content: ${error.message}`)
    }

    return result
  }

  // Get content file by ID
  static async getContent(id: string): Promise<ContentFile | null> {
    const { data, error } = await supabase
      .from('content_files')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to get content: ${error.message}`)
    }

    return data
  }

  // Get content files with filters
  static async getContentList(filters: SearchFilters = {}): Promise<ContentFile[]> {
    let query = supabase
      .from('content_files')
      .select('*')

    // Apply filters
    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type)
    }
    if (filters.language) {
      query = query.eq('language', filters.language)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.programme_id) {
      query = query.eq('programme_id', filters.programme_id)
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1)
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get content list: ${error.message}`)
    }

    return data || []
  }

  // Update content file
  static async updateContent(id: string, updates: UpdateContentData): Promise<ContentFile> {
    const { data, error } = await supabase
      .from('content_files')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update content: ${error.message}`)
    }

    return data
  }

  // Delete content file
  static async deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_files')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete content: ${error.message}`)
    }
  }

  // Search content using full-text search
  static async searchContent(filters: SearchFilters = {}): Promise<ContentSearchResult[]> {
    const { data, error } = await supabase
      .rpc('search_content', {
        p_query: filters.query || '',
        p_content_type: filters.content_type || null,
        p_language: filters.language || null,
        p_status: filters.status || null,
        p_client_id: filters.client_id || null,
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0
      })

    if (error) {
      throw new Error(`Failed to search content: ${error.message}`)
    }

    return data || []
  }

  // Get content versions
  static async getContentVersions(contentFileId: string): Promise<ContentVersion[]> {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('content_file_id', contentFileId)
      .order('version_number', { ascending: false })

    if (error) {
      throw new Error(`Failed to get content versions: ${error.message}`)
    }

    return data || []
  }

  // Create content version
  static async createContentVersion(
    contentFileId: string,
    filePath: string,
    fileSize: number,
    fileHash: string,
    changeSummary: string,
    userId: string
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('create_content_version', {
        p_content_file_id: contentFileId,
        p_file_path: filePath,
        p_file_size: fileSize,
        p_file_hash: fileHash,
        p_change_summary: changeSummary,
        p_changed_by: userId
      })

    if (error) {
      throw new Error(`Failed to create content version: ${error.message}`)
    }

    return data
  }

  // Get content metadata
  static async getContentMetadata(contentFileId: string): Promise<ContentMetadata | null> {
    const { data, error } = await supabase
      .from('content_metadata')
      .select('*')
      .eq('content_file_id', contentFileId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to get content metadata: ${error.message}`)
    }

    return data
  }

  // Update content metadata
  static async updateContentMetadata(
    contentFileId: string,
    metadata: Partial<Omit<ContentMetadata, 'id' | 'content_file_id' | 'created_at' | 'updated_at'>>
  ): Promise<ContentMetadata> {
    // Try to update existing metadata first
    const { data: existingData, error: selectError } = await supabase
      .from('content_metadata')
      .select('id')
      .eq('content_file_id', contentFileId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing metadata: ${selectError.message}`)
    }

    let result
    if (existingData) {
      // Update existing metadata
      const { data, error } = await supabase
        .from('content_metadata')
        .update(metadata)
        .eq('content_file_id', contentFileId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update content metadata: ${error.message}`)
      }
      result = data
    } else {
      // Create new metadata
      const { data, error } = await supabase
        .from('content_metadata')
        .insert({
          content_file_id: contentFileId,
          ...metadata
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create content metadata: ${error.message}`)
      }
      result = data
    }

    return result
  }

  // Get content by programme
  static async getContentByProgramme(programmeId: string): Promise<ContentFile[]> {
    const { data, error } = await supabase
      .from('content_files')
      .select('*')
      .eq('programme_id', programmeId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get programme content: ${error.message}`)
    }

    return data || []
  }

  // Get user's content
  static async getUserContent(userId: string, filters: SearchFilters = {}): Promise<ContentFile[]> {
    let query = supabase
      .from('content_files')
      .select('*')
      .eq('uploaded_by', userId)

    // Apply filters
    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get user content: ${error.message}`)
    }

    return data || []
  }

  // Get content statistics
  static async getContentStats(userId?: string): Promise<{
    total: number
    by_type: Record<ContentType, number>
    by_status: Record<ContentStatus, number>
    total_size: number
  }> {
    let query = supabase
      .from('content_files')
      .select('content_type, status, file_size')

    if (userId) {
      query = query.eq('uploaded_by', userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get content stats: ${error.message}`)
    }

    const stats = {
      total: data?.length || 0,
      by_type: {} as Record<ContentType, number>,
      by_status: {} as Record<ContentStatus, number>,
      total_size: 0
    }

    data?.forEach(item => {
      // Count by type
      const contentType = item.content_type as ContentType
      stats.by_type[contentType] = (stats.by_type[contentType] || 0) + 1
      
      // Count by status
      const status = item.status as ContentStatus
      stats.by_status[status] = (stats.by_status[status] || 0) + 1
      
      // Sum file sizes
      stats.total_size += item.file_size || 0
    })

    return stats
  }

  // Duplicate content (create a copy)
  static async duplicateContent(id: string, userId: string, newTitle?: string): Promise<ContentFile> {
    const original = await this.getContent(id)
    if (!original) {
      throw new Error('Content not found')
    }

    const duplicateData: CreateContentData = {
      filename: `copy_${original.filename}`,
      original_filename: `Copy of ${original.original_filename}`,
      file_path: original.file_path, // Will need to copy the actual file too
      file_size: original.file_size,
      mime_type: original.mime_type,
      file_hash: original.file_hash,
      programme_id: original.programme_id,
      course_id: original.course_id,
      module_id: original.module_id,
      unit_id: original.unit_id,
      title: newTitle || `Copy of ${original.title}`,
      description: original.description,
      language: original.language,
      content_type: original.content_type,
      status: 'draft' // Always start copies as draft
    }

    return this.createContent(duplicateData, userId)
  }
}
