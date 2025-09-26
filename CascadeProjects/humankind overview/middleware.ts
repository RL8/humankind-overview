import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client for middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/content', '/training-programs']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, API routes, and home page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/' // Allow home page to load
  ) {
    return NextResponse.next()
  }

  // Only check authentication for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      // Get session from Supabase cookies
      const accessToken = request.cookies.get('sb-dqxjonbsczuxeqorxqvz-auth-token')?.value
      
      if (!accessToken) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      
      if (error || !user) {
        // Invalid token - clear cookies and redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url))
        response.cookies.delete('sb-dqxjonbsczuxeqorxqvz-auth-token')
        response.cookies.delete('sb-dqxjonbsczuxeqorxqvz-auth-token.0')
        return response
      }

      // Add user info to headers for use in components
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      requestHeaders.set('x-user-email', user.email || '')
      requestHeaders.set('x-user-role', user.user_metadata?.role || 'client')

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

    } catch (error) {
      console.error('Middleware error:', error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Allow all other routes to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
