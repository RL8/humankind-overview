import { NextRequest, NextResponse } from 'next/server'
import { AuthService, UserRole } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: UserRole
    name?: string
    organization?: string
  }
}

// Middleware to verify JWT token and add user to request
export async function withAuth(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean
    allowedRoles?: UserRole[]
  }
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const { requireAuth = true, allowedRoles } = options || {}

    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (!token && requireAuth) {
        return NextResponse.json(
          { error: 'No authorization token provided' },
          { status: 401 }
        )
      }

      let authenticatedReq = req as AuthenticatedRequest

      if (token) {
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
          if (requireAuth) {
            return NextResponse.json(
              { error: 'Invalid or expired token' },
              { status: 401 }
            )
          }
        } else {
          // Get user role from database
          const userRole = await AuthService.getUserRole(user.id)
          
          if (!userRole && requireAuth) {
            return NextResponse.json(
              { error: 'User role not found' },
              { status: 403 }
            )
          }

          // Check role permissions
          if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            )
          }

          // Add user data to request
          authenticatedReq.user = {
            id: user.id,
            email: user.email!,
            role: userRole!,
            name: user.user_metadata?.name,
            organization: user.user_metadata?.organization
          }
        }
      }

      return handler(authenticatedReq, ...args)

    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
  }
}

// Helper function to create role-based middleware
export const requireRole = (roles: UserRole | UserRole[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  return (handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) =>
    withAuth(handler, { requireAuth: true, allowedRoles })
}

// Convenience middleware functions
export const requireComposer = requireRole(UserRole.COMPOSER)
export const requirePrincipal = requireRole(UserRole.PRINCIPAL)
export const requireClient = requireRole(UserRole.CLIENT)
export const requireAdmin = requireRole(UserRole.ADMIN)

export const requireComposerOrPrincipal = requireRole([UserRole.COMPOSER, UserRole.PRINCIPAL])
export const requirePrincipalOrAdmin = requireRole([UserRole.PRINCIPAL, UserRole.ADMIN])
export const requireAnyRole = requireRole([UserRole.COMPOSER, UserRole.PRINCIPAL, UserRole.CLIENT, UserRole.ADMIN])

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>,
  options: {
    maxRequests: number
    windowMs: number
  }
) {
  return async (req: AuthenticatedRequest, ...args: any[]): Promise<NextResponse> => {
    const { maxRequests, windowMs } = options
    const key = req.ip || 'anonymous'
    const now = Date.now()
    
    const record = rateLimitMap.get(key)
    
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return handler(req, ...args)
    }
    
    if (record.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    record.count++
    return handler(req, ...args)
  }
}
