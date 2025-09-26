'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to dashboard if already logged in
        router.push('/dashboard')
      } else {
        // Redirect to login if not logged in
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  // Show content immediately with skeleton loading
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
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <div className="flex justify-center mt-8">
                <Skeleton className="h-12 w-32 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                {user ? 'Redirecting to your dashboard...' : 'Redirecting to login...'}
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          )}
        </div>

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

