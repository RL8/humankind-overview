'use client'

import { useEffect, useState } from 'react'
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
  const [isCreatingTestUser, setIsCreatingTestUser] = useState(false)
  const [testUserInfo, setTestUserInfo] = useState<{
    email: string
    password: string
    role: string
  } | null>(null)

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role if already logged in
      const redirectUrl = getRedirectUrl(user.role)
      router.push(redirectUrl)
    }
  }, [user, loading, router])

  const createTestUser = async (role: string = 'composer') => {
    setIsCreatingTestUser(true)
    try {
      const response = await fetch('/api/test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()
      
      if (data.success) {
        setTestUserInfo(data.user)
        // Auto-login with the test user
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.user.email,
            password: data.user.password,
          }),
        })
        
        if (loginResponse.ok) {
          // Refresh the page to trigger auth state update
          window.location.reload()
        }
      } else {
        alert(`Error creating test user: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating test user:', error)
      alert('Failed to create test user')
    } finally {
      setIsCreatingTestUser(false)
    }
  }

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
            <div className="space-y-6">
              <UnifiedAuth />
              
              {/* Test User Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-3">Quick Access</p>
                  <button
                    type="button"
                    onClick={() => createTestUser('composer')}
                    disabled={isCreatingTestUser}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingTestUser ? 'Creating...' : 'Quick Test Login (Composer)'}
                  </button>
                </div>
              </div>
            </div>
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

