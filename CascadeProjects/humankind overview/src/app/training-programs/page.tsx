'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import { ContentService } from '@/services/content-service'
import { DefaultProgramService } from '@/services/default-program-service'
import { TrainingProgram } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'
import { TranslationModal } from '@/components/common/TranslationModal'

export default function TrainingProgramsPage() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [copyingProgram, setCopyingProgram] = useState<string | null>(null)
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null)
  const [newProgram, setNewProgram] = useState({
    title: '',
    description: '',
    client_id: ''
  })

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      // Mock data with translation variants for now
      const mockPrograms: TrainingProgram[] = [
        {
          id: 'floorbook-approach',
          title: 'Floorbook Approach - Complete Learning Series',
          description: 'A comprehensive learning series that transforms how you understand children, learning, and your role as an educator.',
          status: 'published',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          created_by: 'system',
          client_id: null,
          users: undefined,
          language: 'en',
          translationStatus: {
            'nl': { exists: true, upToDate: true, lastTranslated: '2024-01-15T11:00:00Z' },
            'de': { exists: false, upToDate: false, lastTranslated: '' },
            'zh-CN': { exists: false, upToDate: false, lastTranslated: '' }
          }
        },
        {
          id: 'floorbook-approach-nl',
          title: 'Floorbook Aanpak - Volledige Leerserie',
          description: 'Een transformerende professionele leerreis die zal revolutioneren hoe je kinderen, leren en jouw rol als opvoeder begrijpt.',
          status: 'published',
          created_at: '2024-01-15T11:00:00Z',
          updated_at: '2024-01-15T11:00:00Z',
          created_by: 'system',
          client_id: null,
          users: undefined,
          language: 'nl',
          parentProgramId: 'floorbook-approach',
          translationStatus: {
            'en': { exists: true, upToDate: true, lastTranslated: '2024-01-15T10:30:00Z' },
            'de': { exists: false, upToDate: false, lastTranslated: '' },
            'zh-CN': { exists: false, upToDate: false, lastTranslated: '' }
          }
        }
      ]
      setPrograms(mockPrograms)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const program = await ContentService.createTrainingProgram({
        ...newProgram,
        created_by: user?.id || ''
      })
      setPrograms([program, ...programs])
      setNewProgram({ title: '', description: '', client_id: '' })
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create program')
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
      setPrograms([result.program, ...programs])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create copy')
    } finally {
      setCopyingProgram(null)
    }
  }

  const handleViewTranslations = (program: TrainingProgram) => {
    setSelectedProgram(program)
    setShowTranslationModal(true)
  }

  const handleViewDetails = (program: TrainingProgram) => {
    window.location.href = `/training-programs/${program.id}/details`
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
              <p className="text-gray-600">Loading training programs...</p>
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
                Training Programs
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your training programs and content
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
                New Program
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Create Program Form */}
          {showCreateForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Program</h3>
              <form onSubmit={handleCreateProgram} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Program Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newProgram.title}
                    onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter program title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter program description"
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
                    Create Program
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Programs List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {programs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No programs</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new training program.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Program
                  </button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {programs.map((program) => {
                  const isDefault = DefaultProgramService.isDefaultProgram(program.id)
                  const canCreateCopy = user && DefaultProgramService.canCreateCopy(user.role as string)
                  const canEditOriginal = user && DefaultProgramService.canEditOriginal(user.role as string)
                  const isTranslation = program.parentProgramId
                  
                  return (
                    <li key={program.id}>
                      <div className={`px-4 py-4 flex items-center justify-between hover:bg-gray-50 ${isDefault ? 'bg-blue-50 border-l-4 border-blue-400' : isTranslation ? 'bg-gray-50 border-l-4 border-gray-300 ml-4' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {program.title}
                              </h3>
                              {isDefault && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Default Program
                                </span>
                              )}
                              {isTranslation && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {program.language ? program.language.toUpperCase() : 'EN'} Translation
                                </span>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                              {program.status.replace('_', ' ')}
                            </span>
                          </div>
                          {program.description && (
                            <p className="mt-1 text-sm text-gray-500 truncate">
                              {program.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            {isDefault ? (
                              <span className="text-blue-600 font-medium">Available to all users</span>
                            ) : isTranslation ? (
                              <span className="text-gray-600 font-medium">Translation variant</span>
                            ) : (
                              <>
                                <span>Created {new Date(program.created_at).toLocaleDateString()}</span>
                                {program.users && (
                                  <span className="ml-4">Client: {program.users.name}</span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                          {isDefault && canCreateCopy && (
                            <button
                              onClick={() => handleCreateCopy(program.id)}
                              disabled={copyingProgram === program.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {copyingProgram === program.id ? (
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
                          {!isTranslation && (
                            <button
                              onClick={() => handleViewTranslations(program)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                              </svg>
                              View Translations
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(program)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View Details
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

      {/* Translation Modal */}
      {showTranslationModal && selectedProgram && (
        <TranslationModal
          programId={selectedProgram.id}
          programTitle={selectedProgram.title}
          currentLanguage={selectedProgram.language || 'en'}
          translationStatus={selectedProgram.translationStatus || {}}
          onClose={() => {
            setShowTranslationModal(false)
            setSelectedProgram(null)
          }}
        />
      )}
    </ProtectedRoute>
  )
}
