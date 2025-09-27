/**
 * Core application types
 */

// User types
export interface User {
  id: string
  email: string
  role: 'composer' | 'principal' | 'client' | 'admin'
  name: string
  organization?: string
  created_at: string
  last_login?: string
}

// Training Program types
export interface TrainingProgram {
  id: string
  title: string
  description?: string
  status: 'draft' | 'in_review' | 'approved' | 'published'
  client_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  is_default?: boolean
  language?: string
  parentProgramId?: string
  translationStatus?: {
    [language: string]: {
      exists: boolean
      upToDate: boolean
      lastTranslated: string
    }
  }
  users?: {
    name: string
    organization?: string
  }
}

export interface CreateTrainingProgramInput {
  title: string
  description?: string
  client_id: string
  created_by?: string
}

export interface UpdateTrainingProgramInput {
  title?: string
  description?: string
  status?: 'draft' | 'in_review' | 'approved' | 'published'
}

// Course types
export interface Course {
  id: string
  program_id: string
  title: string
  description?: string
  order_index: number
  status: 'draft' | 'in_review' | 'approved' | 'published'
  created_at: string
  modules?: Module[]
}

export interface CreateCourseInput {
  program_id: string
  title: string
  description?: string
  order_index: number
}

// Module types
export interface Module {
  id: string
  course_id: string
  title: string
  content?: string
  order_index: number
  language: string
  status: 'draft' | 'in_review' | 'approved' | 'published'
  created_at: string
  updated_at: string
}

export interface CreateModuleInput {
  course_id: string
  title: string
  content?: string
  order_index: number
  language?: string
}

// Unit types
export interface Unit {
  id: string
  module_id: string
  title: string
  content?: string
  order_index: number
  duration_minutes?: number
  created_at: string
}

export interface CreateUnitInput {
  module_id: string
  title: string
  content?: string
  order_index: number
  duration_minutes?: number
}

// Comment types
export interface Comment {
  id: string
  content_id: string
  content_type: 'module' | 'unit'
  author_id: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
  author?: User // Optional populated author
}

export interface CreateCommentInput {
  content_id: string
  content_type: 'module' | 'unit'
  message: string
}

// API Response types
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: string
  badge?: string
  children?: NavItem[]
}

// Content File types
export interface ContentFile {
  id: string
  filename: string
  file_path: string
  language: string
  content_type: 'markdown' | 'pdf' | 'image' | 'other'
  size: number
  last_modified: string
  content?: string
}

export interface ContentFileData extends ContentFile {
  content?: string
}

// Status types
export type Status = 'draft' | 'in_review' | 'approved' | 'published'
export type UserRole = 'composer' | 'principal' | 'client' | 'admin'
export type ContentType = 'module' | 'unit'
export type CommentStatus = 'open' | 'resolved'

