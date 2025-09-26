'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail, UserRole } from '@/lib/auth'
import { config } from '@/lib/config'

interface LoginFormProps {
  onSuccess?: () => void
  onRegisterClick?: () => void
  onForgotPasswordClick?: () => void
}

export default function LoginForm({ onSuccess, onRegisterClick, onForgotPasswordClick }: LoginFormProps) {
  const { login, loading, error, clearError, createTestUser } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    const success = await login(formData)
    if (success && onSuccess) {
      onSuccess()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleTestUserLogin = async (role: UserRole = UserRole.CLIENT) => {
    clearError()
    const success = await createTestUser(role)
    if (success && onSuccess) {
      onSuccess()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onRegisterClick}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </span>
          </div>

          {/* Test User Buttons - Development Only */}
          {config.app.isDevelopment && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">Development Testing</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleTestUserLogin(UserRole.CLIENT)}
                    disabled={loading}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Quick Test Login (Client)
                  </button>
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
        </form>
      </div>
    </div>
  )
}
