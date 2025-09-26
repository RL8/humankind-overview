'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'
import { config } from '@/lib/config'

export default function AccessCodePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { createTestUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/access-code/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      })

      const result = await response.json()

      if (response.ok && result.valid) {
        // Store access code in session storage and cookie
        sessionStorage.setItem('accessCode', code.trim())
        // Set cookie for middleware
        document.cookie = `access-code=${code.trim()}; path=/; max-age=86400` // 24 hours
        // Redirect to login
        router.push('/auth/login')
      } else {
        setError(result.error || 'Invalid access code')
      }
    } catch (error) {
      setError('Failed to verify access code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestUserLogin = async (role: UserRole = UserRole.COMPOSER) => {
    setLoading(true)
    setError('')
    
    try {
      const success = await createTestUser(role)
      if (success) {
        // Set access code cookie for middleware
        document.cookie = `access-code=test-bypass; path=/; max-age=86400` // 24 hours
        // Redirect to dashboard (test user is already logged in)
        router.push('/dashboard')
      } else {
        setError('Failed to create test user')
      }
    } catch (error) {
      setError('Test user creation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Access Code Required
            </h1>
            <p className="text-gray-600">
              Please enter the access code sent to your email by the administrator
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your access code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Access Code'}
            </button>
          </form>

          {/* Test User Buttons - Development Only */}
          {config.app.isDevelopment && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">Development Testing</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleTestUserLogin(UserRole.COMPOSER)}
                    disabled={loading}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Quick Test Login (Composer)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
