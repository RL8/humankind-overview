'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import { ContentService } from '@/services/content-service'
import { TrainingProgramme } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

export default function ClientDashboardPage() {
  const { user } = useAuth()
  const [programmes, setProgrammes] = useState<TrainingProgramme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalProgrammes: 0,
    pendingReview: 0,
    approved: 0,
    completed: 0
  })

  useEffect(() => {
    if (user?.role === UserRole.CLIENT) {
      loadClientData()
    }
  }, [user])

  const loadClientData = async () => {
    try {
      setLoading(true)
      const response = await ContentService.getTrainingProgrammes({
        clientId: user?.id
      })
      const clientProgrammes = response.data || []
      setProgrammes(clientProgrammes)
      
      // Calculate stats
      setStats({
        totalProgrammes: clientProgrammes.length,
        pendingReview: clientProgrammes.filter(p => p.status === 'in_review').length,
        approved: clientProgrammes.filter(p => p.status === 'approved').length,
        completed: clientProgrammes.filter(p => p.status === 'published').length
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'in_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'draft': return 'Content is being prepared'
      case 'in_review': return 'Awaiting your review'
      case 'approved': return 'Ready for publication'
      case 'published': return 'Live and available'
      default: return 'Unknown status'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user?.name || user?.email?.split('@')[0]}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review your training programmes and provide feedback
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📚</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Programmes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalProgrammes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⏳</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Review
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pendingReview}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">✅</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Approved
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.approved}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🎉</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completed
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.completed}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Programmes Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Training Programmes
              </h3>

              {programmes.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No programmes yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your training programmes will appear here once they're created.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programmes.map((programme) => (
                    <div key={programme.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-900">{programme.title}</h4>
                          {programme.description && (
                            <p className="mt-1 text-sm text-gray-500">{programme.description}</p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span>{getStatusMessage(programme.status)}</span>
                            <span className="ml-4">Created {new Date(programme.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(programme.status)}`}>
                            {programme.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => window.location.href = `/client/programmes/${programme.id}`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            {programme.status === 'in_review' ? 'Review Now' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 sm:px-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-4xl">💬</div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-semibold text-white">
                      Need Help?
                    </h3>
                    <p className="mt-1 text-blue-100">
                      Have questions about your training programmes? Contact our support team or 
                      use the feedback system to communicate with the content creators.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => alert('Contact support functionality coming soon!')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Contact Support
                        <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
