import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null

// Track client creation to debug multiple instances
let clientCreationCount = 0
let adminClientCreationCount = 0

// Create a single supabase client for interacting with your database
export const supabase = (() => {
  if (!supabaseInstance) {
    clientCreationCount++
    console.log(`Creating new Supabase client instance #${clientCreationCount}`)
    if (clientCreationCount > 1) {
      console.warn('⚠️ Multiple Supabase client instances detected! This may cause authentication issues.')
    }
    supabaseInstance = createClient<Database>(
      config.supabase.url,
      config.supabase.anonKey
    )
  } else {
    console.log('Reusing existing Supabase client instance')
  }
  return supabaseInstance!
})()

// Create a supabase client with service role for admin operations
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    adminClientCreationCount++
    console.log(`Creating new Supabase admin client instance #${adminClientCreationCount}`)
    if (adminClientCreationCount > 1) {
      console.warn('⚠️ Multiple Supabase admin client instances detected!')
    }
    supabaseAdminInstance = createClient<Database>(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )
  } else {
    console.log('Reusing existing Supabase admin client instance')
  }
  return supabaseAdminInstance!
})()

// Export a function to check client instances (for debugging)
export const getClientInstanceInfo = () => ({
  clientCreationCount,
  adminClientCreationCount,
  hasClient: !!supabaseInstance,
  hasAdminClient: !!supabaseAdminInstance
})

// Database types (to be updated when schema is finalized)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'composer' | 'principal' | 'client' | 'admin'
          name: string
          organization?: string
          created_at: string
          last_login?: string
        }
        Insert: {
          id?: string
          email: string
          role: 'composer' | 'principal' | 'client' | 'admin'
          name: string
          organization?: string
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'composer' | 'principal' | 'client' | 'admin'
          name?: string
          organization?: string
          created_at?: string
          last_login?: string
        }
      }
      training_programmes: {
        Row: {
          id: string
          title: string
          description?: string
          status: 'draft' | 'in_review' | 'approved' | 'published'
          client_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status?: 'draft' | 'in_review' | 'approved' | 'published'
          client_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'draft' | 'in_review' | 'approved' | 'published'
          client_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      content_files: {
        Row: {
          id: string
          uploaded_by: string
          language: string
          status: 'draft' | 'in_review' | 'approved' | 'published'
          filename: string
          original_filename: string
          file_path: string
          file_size: number
          mime_type: string
          file_hash?: string
          content_type: 'document' | 'video' | 'audio' | 'image' | 'presentation'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          uploaded_by: string
          language: string
          status?: 'draft' | 'in_review' | 'approved' | 'published'
          filename: string
          original_filename: string
          file_path: string
          file_size: number
          mime_type: string
          file_hash?: string
          content_type: 'document' | 'video' | 'audio' | 'image' | 'presentation'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          uploaded_by?: string
          language?: string
          status?: 'draft' | 'in_review' | 'approved' | 'published'
          filename?: string
          original_filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          file_hash?: string
          content_type?: 'document' | 'video' | 'audio' | 'image' | 'presentation'
          created_at?: string
          updated_at?: string
        }
      }
      content_metadata: {
        Row: {
          id: string
          content_file_id: string
          tags?: string[]
          keywords?: string[]
          duration_minutes?: number
          page_count?: number
          resolution?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          learning_objectives?: string[]
          prerequisites?: string[]
          custom_properties?: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_file_id: string
          tags?: string[]
          keywords?: string[]
          duration_minutes?: number
          page_count?: number
          resolution?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          learning_objectives?: string[]
          prerequisites?: string[]
          custom_properties?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_file_id?: string
          tags?: string[]
          keywords?: string[]
          duration_minutes?: number
          page_count?: number
          resolution?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          learning_objectives?: string[]
          prerequisites?: string[]
          custom_properties?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      search_content: {
        Args: {
          p_query: string
          p_content_type: 'document' | 'video' | 'audio' | 'image' | 'presentation' | null
          p_language: string | null
          p_status: 'draft' | 'in_review' | 'approved' | 'published' | null
          p_client_id: string | null
          p_limit: number
          p_offset: number
        }
        Returns: {
          id: string
          filename: string
          content_type: string
          status: string
          file_size: number
          created_at: string
        }[]
      }
      create_content_version: {
        Args: {
          p_content_file_id: string
          p_file_path: string
          p_file_size: number
          p_file_hash: string
          p_change_summary: string
          p_changed_by: string
        }
        Returns: {
          id: string
        }
      }
    }
  }
}

