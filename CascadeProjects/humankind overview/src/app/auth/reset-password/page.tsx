'use client'

import React from 'react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  const handleSuccess = () => {
    // Redirect to dashboard after successful password reset
    window.location.href = '/dashboard'
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
        <ResetPasswordForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
