'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import { ContentService } from '@/services/content-service'
import { DefaultProgramService } from '@/services/default-program-service'
import { TrainingProgramme } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

export default function TrainingProgrammesPage() {
  const { user } = useAuth()
  const [programmes, setProgrammes] = useState<TrainingProgramme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [copyingProgram, setCopyingProgram] = useState<string | null>(null)
  const [newProgramme, setNewProgramme] = useState({
    title: '',
    description: '',
    client_id: ''
  })

  useEffect(() => {
    loadProgrammes()
  }, [])

  const loadProgrammes = async () => {
    try {
      setLoading(true)
      const response = await ContentService.getTrainingProgrammes({
        clientId: user?.role === UserRole.CLIENT ? user.id : undefined,
        includeDefault: true
      })
      setProgrammes(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programmes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgramme = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const programme = await ContentService.createTrainingProgramme({
        ...newProgramme,
        created_by: user?.id || ''
      })
      setProgrammes([programme, ...programmes])
      setNewProgramme({ title: '', description: '', client_id: '' })
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create programme')
    }
  }

  const handleCreateCopy = async (programId: string) => {
    if (!user) return
    
    try {
      setCopyingProgram(programId)
      const response = await fetch('/api/training-programs/copy-default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userRole: user.role
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create copy')
      }

      const result = await response.json()
      setProgrammes([result.program, ...programmes])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create copy')
    } finally {
      setCopyingProgram(null)
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading training programmes...</p>
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
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Training Programmes
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your training programmes and content
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Programme
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Create Programme Form */}
          {showCreateForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Programme</h3>
              <form onSubmit={handleCreateProgramme} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Programme Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newProgramme.title}
                    onChange={(e) => setNewProgramme({ ...newProgramme, title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter programme title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProgramme.description}
                    onChange={(e) => setNewProgramme({ ...newProgramme, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter programme description"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Programme
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Programmes List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {programmes.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No programmes</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new training programme.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Programme
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {programmes.map((programme) => {
                  const isDefault = DefaultProgramService.isDefaultProgram(programme.id)
                  const canCreateCopy = user && DefaultProgramService.canCreateCopy(user.role as string)
                  const canEditOriginal = user && DefaultProgramService.canEditOriginal(user.role as string)
                  
                  return (
                    <li key={programme.id}>
                      <div className={`px-4 py-4 flex items-center justify-between hover:bg-gray-50 ${isDefault ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {programme.title}
                              </h3>
                              {isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Default Program
                                </span>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(programme.status)}`}>
                              {programme.status.replace('_', ' ')}
                            </span>
                          </div>
                          {programme.description && (
                            <p className="mt-1 text-sm text-gray-500 truncate">
                              {programme.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            {isDefault ? (
                              <span className="text-blue-600 font-medium">Available to all users</span>
                            ) : (
                              <>
                                <span>Created {new Date(programme.created_at).toLocaleDateString()}</span>
                                {programme.users && (
                                  <span className="ml-4">Client: {programme.users.name}</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                          {isDefault && canCreateCopy && (
                            <button
                              onClick={() => handleCreateCopy(programme.id)}
                              disabled={copyingProgram === programme.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {copyingProgram === programme.id ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Creating...
                                </>
                              ) : (
                                'Create My Copy'
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => window.location.href = `/training-programs/${programme.id}`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            {isDefault ? 'View Program' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
