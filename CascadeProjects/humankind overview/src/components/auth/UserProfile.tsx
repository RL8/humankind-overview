'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

interface UserProfileProps {
  onPasswordChangeClick?: () => void
}

export default function UserProfile({ onPasswordChangeClick }: UserProfileProps) {
  const { user, updateProfile, loading, error, clearError } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    organization: user?.organization || ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long'
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

    const success = await updateProfile({
      name: formData.name.trim(),
      organization: formData.organization.trim() || undefined
    })

    if (success) {
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
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

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      organization: user?.organization || ''
    })
    setFormErrors({})
    setIsEditing(false)
    clearError()
  }

  const getRoleDisplayName = (role?: UserRole) => {
    switch (role) {
      case UserRole.COMPOSER:
        return 'Composer'
      case UserRole.PRINCIPAL:
        return 'Principal'
      case UserRole.CLIENT:
        return 'Client'
      case UserRole.ADMIN:
        return 'Administrator'
      default:
        return 'Unknown'
    }
  }

  if (!user) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="text-sm text-green-600">Profile updated successfully!</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500">
            {user.email}
          </div>
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500">
            {getRoleDisplayName(user.role)}
          </div>
          <p className="mt-1 text-xs text-gray-500">Role is assigned by administrators</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          {isEditing ? (
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
          ) : (
            <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              {user.name || 'Not provided'}
            </div>
          )}
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
            Organization
          </label>
          {isEditing ? (
            <input
              id="organization"
              name="organization"
              type="text"
              value={formData.organization}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your organization"
            />
          ) : (
            <div className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
              {user.organization || 'Not provided'}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      {!isEditing && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          <button
            onClick={onPasswordChangeClick}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Change Password
          </button>
        </div>
      )}
    </div>
  )
}
