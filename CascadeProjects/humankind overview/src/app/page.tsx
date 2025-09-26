'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'
import { Skeleton } from '@/components/ui/skeleton'
import UnifiedAuth from '@/components/auth/UnifiedAuth'

// Helper function to determine redirect URL based on user role
const getRedirectUrl = (userRole?: UserRole): string => {
  switch (userRole) {
    case UserRole.COMPOSER:
      return '/training-programs'
    case UserRole.PRINCIPAL:
    case UserRole.ADMIN:
    case UserRole.CLIENT:
    default:
      return '/dashboard'
  }
}

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role if already logged in
      const redirectUrl = getRedirectUrl(user.role)
      router.push(redirectUrl)
    }
  }, [user, loading, router])

  // Show content immediately with embedded auth
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Course Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Collaborative Training Program Management Platform
          </p>
        </div>

        {/* Show loading state while checking auth */}
        {loading ? (
          <div className="flex justify-center mb-12">
            <div className="space-y-4">
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <div className="flex justify-center mt-8">
                <Skeleton className="h-12 w-32 rounded-full" />
              </div>
            </div>
          </div>
        ) : user ? (
          // Show redirect message for logged in users
          <div className="flex justify-center mb-12">
            <div className="space-y-4">
              <p className="text-gray-600">
                Redirecting to your workspace...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        ) : (
          // Show embedded authentication for non-logged in users
          <div className="flex justify-center mb-12">
            <UnifiedAuth />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Training Programs</h3>
            <p className="text-gray-600">
              Create and manage comprehensive training programs with courses, modules, and units.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Client Collaboration</h3>
            <p className="text-gray-600">
              Enable clients to review content, provide feedback, and participate in the process.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">Multi-Language</h3>
            <p className="text-gray-600">
              Automated translation workflows for Dutch, French, and Simplified Chinese.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

