'use client'

import React, { useEffect } from 'react'
import { useAuth, useRole } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: UserRole | UserRole[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
  fallback,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const hasRequiredRole = useRole(allowedRoles || [])

  useEffect(() => {
    // Redirect if authentication is required but user is not logged in
    if (!loading && requireAuth && !user) {
      window.location.href = redirectTo
      return
    }

    // Redirect if user doesn't have required role
    if (!loading && user && allowedRoles && !hasRequiredRole) {
      window.location.href = '/unauthorized'
      return
    }
  }, [user, loading, requireAuth, allowedRoles, hasRequiredRole, redirectTo])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Check role requirement
  if (user && allowedRoles && !hasRequiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Required role(s): {Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}

// Convenience components for specific roles
export function ComposerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={UserRole.COMPOSER} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function PrincipalRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={UserRole.PRINCIPAL} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function ClientRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={UserRole.CLIENT} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={UserRole.ADMIN} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function ComposerOrPrincipalRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.COMPOSER, UserRole.PRINCIPAL]} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function PrincipalOrAdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.PRINCIPAL, UserRole.ADMIN]} {...props}>
      {children}
    </ProtectedRoute>
  )
}
