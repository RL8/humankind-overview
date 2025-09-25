'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

type AuthMode = 'login' | 'register' | 'forgot-password'

export default function AuthPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard'
    }
  }, [user])

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful auth
    window.location.href = '/dashboard'
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Tracker
          </h1>
          <p className="text-gray-600">
            Training content management platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {mode === 'login' && (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onRegisterClick={() => setMode('register')}
            onForgotPasswordClick={() => setMode('forgot-password')}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onLoginClick={() => setMode('login')}
          />
        )}

        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onSuccess={() => setMode('login')}
            onBackToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  )
}
