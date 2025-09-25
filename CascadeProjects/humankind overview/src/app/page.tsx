'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to dashboard if already logged in
        window.location.href = '/dashboard'
      } else {
        // Redirect to login if not logged in
        window.location.href = '/auth/login'
      }
    }
  }, [user, loading])

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Tracker</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

