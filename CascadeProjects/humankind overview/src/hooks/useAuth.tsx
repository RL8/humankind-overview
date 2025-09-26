'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthService, UserRole, type RegisterData, type LoginData } from '@/lib/auth'
import { deduplicateUserRequest } from '@/lib/request-deduplication'

interface AuthUser {
  id: string
  email: string
  name?: string
  role?: UserRole
  organization?: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
  login: (data: LoginData) => Promise<{ success: boolean; user?: any }>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<boolean>
  updateProfile: (updates: { name?: string; organization?: string }) => Promise<boolean>
  refreshSession: () => Promise<void>
  createTestUser: (role?: UserRole) => Promise<{ success: boolean; user?: any }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize auth state with caching
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for cached auth state first
        const cachedUser = localStorage.getItem('auth-user')
        const cachedSession = localStorage.getItem('auth-session')
        
        if (cachedUser && cachedSession) {
          try {
            const parsedUser = JSON.parse(cachedUser)
            const parsedSession = JSON.parse(cachedSession)
            
            // Verify session is still valid
            if (parsedSession.expires_at && parsedSession.expires_at * 1000 > Date.now()) {
              setUser(parsedUser)
              setSession(parsedSession)
              setLoading(false)
              setInitialized(true)
              return
            }
          } catch (e) {
            // Clear invalid cached data
            localStorage.removeItem('auth-user')
            localStorage.removeItem('auth-session')
          }
        }

        // Get fresh session from Supabase
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession) {
          setSession(initialSession)
          await setUserFromSession(initialSession)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setSession(session)
        
        if (session) {
          await setUserFromSession(session)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Set user data from session with caching and deduplication
  const setUserFromSession = async (session: Session) => {
    if (!session.user) return

    try {
      // Use deduplication to prevent race conditions
      const role = await deduplicateUserRequest(
        session.user.id,
        'getUserRole',
        () => AuthService.getUserRole(session.user.id)
      )
      
      // If no role found in database, try to get it from user metadata as fallback
      const fallbackRole = role || session.user.user_metadata?.role || 'client'
      
      const userData = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name,
        role: fallbackRole as UserRole,
        organization: session.user.user_metadata?.organization
      }
      
      setUser(userData)
      
      // Cache user data and session
      localStorage.setItem('auth-user', JSON.stringify(userData))
      localStorage.setItem('auth-session', JSON.stringify(session))
      
    } catch (error) {
      console.error('Error setting user from session:', error)
      // Fallback to user metadata only with default role
      const userData = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name,
        role: (session.user.user_metadata?.role as UserRole) || UserRole.CLIENT,
        organization: session.user.user_metadata?.organization
      }
      
      setUser(userData)
      
      // Cache fallback user data
      localStorage.setItem('auth-user', JSON.stringify(userData))
      localStorage.setItem('auth-session', JSON.stringify(session))
    }
  }

  // Auto-refresh session before it expires
  useEffect(() => {
    if (!session) return

    const refreshThreshold = 60 * 1000 // 1 minute before expiry
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    const timeUntilRefresh = expiresAt - Date.now() - refreshThreshold

    if (timeUntilRefresh > 0) {
      const timeout = setTimeout(() => {
        refreshSession()
      }, timeUntilRefresh)

      return () => clearTimeout(timeout)
    }
  }, [session])

  const login = async (data: LoginData): Promise<{ success: boolean; user?: any }> => {
    setLoading(true)
    setError(null)

    try {
      const { user: authUser, error: authError } = await AuthService.login(data)
      
      if (authError) {
        setError(authError.message)
        return { success: false }
      }

      if (!authUser) {
        setError('Login failed')
        return { success: false }
      }

      return { success: true, user: authUser }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { user: authUser, error: authError } = await AuthService.register(data)
      
      if (authError) {
        setError(authError.message)
        return false
      }

      if (!authUser) {
        setError('Registration failed')
        return false
      }

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const { error: logoutError } = await AuthService.logout()
      
      if (logoutError) {
        setError(logoutError.message)
      } else {
        setUser(null)
        setSession(null)
        
        // Clear cached auth data
        localStorage.removeItem('auth-user')
        localStorage.removeItem('auth-session')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await AuthService.requestPasswordReset(email)
      
      if (resetError) {
        setError(resetError.message)
        return false
      }

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await AuthService.updatePassword(password)
      
      if (updateError) {
        setError(updateError.message)
        return false
      }

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: { name?: string; organization?: string }): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await AuthService.updateProfile(updates)
      
      if (updateError) {
        setError(updateError.message)
        return false
      }

      // Update local user state
      if (user) {
        setUser({
          ...user,
          ...updates
        })
      }

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { data, error } = await AuthService.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        setError('Session refresh failed')
      } else if (data.session) {
        setSession(data.session)
        await setUserFromSession(data.session)
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      setError('Session refresh failed')
    }
  }

  const createTestUser = async (role: UserRole = UserRole.COMPOSER): Promise<{ success: boolean; user?: any }> => {
    setLoading(true)
    setError(null)

    try {
      const { success, user: testUser, error: testError } = await AuthService.createTestUser(role)
      
      if (!success || testError) {
        setError(testError || 'Failed to create test user')
        return { success: false }
      }

      if (!testUser) {
        setError('No test user data returned')
        return { success: false }
      }

      // Auto-login with the test user
      const loginResult = await login({
        email: testUser.email,
        password: testUser.password
      })

      return loginResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test user creation failed'
      setError(errorMessage)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    createTestUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for routes that require authentication
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectTo
    }
  }, [user, loading, redirectTo])

  return { user, loading }
}

// Hook to check if user has specific role
export function useRole(requiredRole: UserRole | UserRole[]) {
  const { user } = useAuth()
  
  const hasRole = React.useMemo(() => {
    if (!user?.role) return false
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }
    
    return user.role === requiredRole
  }, [user?.role, requiredRole])

  return hasRole
}
