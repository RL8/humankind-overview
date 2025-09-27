import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Window-level singleton to prevent multiple client instances across module imports
declare global {
  interface Window {
    __supabaseClient?: ReturnType<typeof createClient<Database>>
    __supabaseAdminClient?: ReturnType<typeof createClient<Database>>
  }
}

// Create a single supabase client for interacting with your database
export const supabase = (() => {
  if (typeof window !== 'undefined') {
    if (!window.__supabaseClient) {
      console.log('Creating new Supabase client instance (window singleton)')
      window.__supabaseClient = createClient<Database>(
        config.supabase.url,
        config.supabase.anonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined
          }
        }
      )
    }
    return window.__supabaseClient
  } else {
    // Server-side fallback
    return createClient<Database>(
      config.supabase.url,
      config.supabase.anonKey
    )
  }
})()

// Create a supabase client with service role for admin operations
// Only available server-side for security reasons
let adminClient: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should not be used in browser - use API routes instead')
  }
  
  if (!adminClient) {
    console.log('Creating new Supabase admin client instance (server-side)')
    adminClient = createClient<Database>(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )
  }
  
  return adminClient
}

// Legacy export for backward compatibility (returns null in browser)
export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    console.warn('supabaseAdmin is not available in browser - use API routes instead')
    return null as any
  }
  return getSupabaseAdmin()
})()

// Export a function to check client instances (for debugging)
export const getClientInstanceInfo = () => ({
  hasClient: typeof window !== 'undefined' ? !!window.__supabaseClient : true,
  hasAdminClient: typeof window !== 'undefined' ? false : !!adminClient
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
      training_programs: {
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

