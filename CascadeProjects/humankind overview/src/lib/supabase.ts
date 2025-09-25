import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
)

// Create a supabase client with service role for admin operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
)

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
    }
  }
}

