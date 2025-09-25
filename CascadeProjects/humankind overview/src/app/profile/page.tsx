'use client'

import React from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import UserProfile from '@/components/auth/UserProfile'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { logout } = useAuth()

  const handlePasswordChangeClick = () => {
    // For now, redirect to password reset flow
    // In a full implementation, you might have a dedicated change password modal
    alert('Password change functionality would be implemented here')
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/auth/login'
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              My Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <UserProfile onPasswordChangeClick={handlePasswordChangeClick} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
