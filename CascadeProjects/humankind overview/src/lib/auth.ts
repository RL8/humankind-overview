import { supabase, getSupabaseAdmin } from './supabase'
import type { User, AuthError } from '@supabase/supabase-js'

// User roles enum
export enum UserRole {
  COMPOSER = 'composer',
  PRINCIPAL = 'principal',
  CLIENT = 'client',
  ADMIN = 'admin'
}

// Auth result types
export interface AuthResult {
  user: User | null
  error: AuthError | null
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  organization?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

// Password validation
export const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }
  
  return errors
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Auth helper functions
export class AuthService {
  // Register a new user
  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Validate input
      if (!validateEmail(data.email)) {
        return {
          user: null,
          error: {
            name: 'ValidationError',
            message: 'Invalid email address'
          } as AuthError
        }
      }

      const passwordErrors = validatePassword(data.password)
      if (passwordErrors.length > 0) {
        return {
          user: null,
          error: {
            name: 'ValidationError',
            message: passwordErrors.join(', ')
          } as AuthError
        }
      }

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            organization: data.organization || null
          }
        }
      })

      if (authError) {
        return { user: null, error: authError }
      }

      // If user is created, also create a record in our users table
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            role: data.role,
            organization: data.organization || null,
            created_at: new Date().toISOString()
          } as any)

        if (dbError) {
          console.error('Error creating user record:', dbError)
          // Continue anyway - the auth user is created
        }
      }

      return { user: authData.user, error: null }
    } catch (error) {
      return {
        user: null,
        error: {
          name: 'UnknownError',
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        } as AuthError
      }
    }
  }

  // Login user
  static async login(data: LoginData): Promise<AuthResult> {
    try {
      if (!validateEmail(data.email)) {
        return {
          user: null,
          error: {
            name: 'ValidationError',
            message: 'Invalid email address'
          } as AuthError
        }
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        return { user: null, error }
      }

      // Update last login timestamp
      if (authData.user) {
        await (supabase as any)
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authData.user.id)
      }

      return { user: authData.user, error: null }
    } catch (error) {
      return {
        user: null,
        error: {
          name: 'UnknownError',
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        } as AuthError
      }
    }
  }

  // Logout user
  static async logout(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Get current session
  static async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Refresh session
  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    return { data, error }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<{ error: AuthError | null }> {
    if (!validateEmail(email)) {
      return {
        error: {
          name: 'ValidationError',
          message: 'Invalid email address'
        } as AuthError
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    return { error }
  }

  // Update password
  static async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      return {
        error: {
          name: 'ValidationError',
          message: passwordErrors.join(', ')
        } as AuthError
      }
    }

    const { error } = await supabase.auth.updateUser({
      password
    })

    return { error }
  }

  // Update user profile
  static async updateProfile(updates: { name?: string; organization?: string }): Promise<{ error: AuthError | null }> {
    const user = await this.getCurrentUser()
    if (!user) {
      return {
        error: {
          name: 'AuthError',
          message: 'No authenticated user'
        } as AuthError
      }
    }

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        ...updates
      }
    })

    if (authError) {
      return { error: authError }
    }

    // Update users table
    const { error: dbError } = await (supabase as any)
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (dbError) {
      console.error('Error updating user record:', dbError)
    }

    return { error: authError }
  }

  // Get user role using server-side API
  static async getUserRole(userId?: string): Promise<UserRole | null> {
    const user = userId ? { id: userId } : await this.getCurrentUser()
    if (!user) {
      console.log('No user provided to getUserRole')
      return null
    }

    console.log('Fetching role for user:', user.id)

    try {
      // Use server-side API
      const response = await fetch(`/api/users/role?userId=${user.id}`)
      const result = await response.json()

      if (!response.ok) {
        console.error('Error fetching user role:', result.error)
        return null
      }

      if (result.success) {
        console.log('Found user role:', result.role, 'for user:', result.user.email)
        return result.role as UserRole
      } else {
        // User not found, try to create/upsert user record
        console.log('User not found, creating user record...')
        return await this.createOrUpdateUser(user.id)
      }
    } catch (error) {
      console.error('Unexpected error in getUserRole:', error)
      return null
    }
  }

  // Create or update user record using server-side API
  private static async createOrUpdateUser(userId: string): Promise<UserRole | null> {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser) {
        console.error('Cannot create user record: no current user available')
        return UserRole.CLIENT
      }

      const response = await fetch('/api/users/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          name: currentUser.user_metadata?.name || 'Unknown User',
          role: currentUser.user_metadata?.role || UserRole.CLIENT,
          organization: currentUser.user_metadata?.organization || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error creating/updating user:', result.error)
        return (currentUser.user_metadata?.role as UserRole) || UserRole.CLIENT
      }

      console.log('Successfully created/updated user record:', result.user.role)
      return result.user.role as UserRole
    } catch (error) {
      console.error('Error creating/updating user record:', error)
      return UserRole.CLIENT
    }
  }

  // Check if user has role
  static async hasRole(role: UserRole, userId?: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId)
    return userRole === role
  }

  // Check if user has any of the specified roles
  static async hasAnyRole(roles: UserRole[], userId?: string): Promise<boolean> {
    const userRole = await this.getUserRole(userId)
    return userRole ? roles.includes(userRole) : false
  }

  // Admin function to assign role (requires service role)
  static async assignRole(userId: string, role: UserRole): Promise<{ error: AuthError | null }> {
    try {
      // Update users table
      const { error: dbError } = await (getSupabaseAdmin() as any)
        .from('users')
        .update({ role })
        .eq('id', userId)

      if (dbError) {
        return {
          error: {
            name: 'DatabaseError',
            message: dbError.message
          } as AuthError
        }
      }

      // Update auth metadata
      const { error: authError } = await getSupabaseAdmin().auth.admin.updateUserById(userId, {
        user_metadata: { role }
      })

      return { error: authError }
    } catch (error) {
      return {
        error: {
          name: 'UnknownError',
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        } as AuthError
      }
    }
  }

  // Create test user (development only)
  static async createTestUser(role: UserRole = UserRole.COMPOSER): Promise<{ 
    success: boolean
    user?: { email: string; password: string; name: string; role: string }
    error?: string 
  }> {
    try {
      const response = await fetch('/api/test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create test user' }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
