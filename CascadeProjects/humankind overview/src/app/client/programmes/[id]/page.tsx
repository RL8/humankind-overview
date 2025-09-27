'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import { ContentService } from '@/services/content-service'
import { TrainingProgram, Course, Module } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

interface ClientProgramPageProps {
  params: { id: string }
}

export default function ClientProgramPage({ params }: ClientProgramPageProps) {
  const { user } = useAuth()
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    if (user?.role === UserRole.CLIENT) {
      loadProgramData()
    }
  }, [params.id, user])

  const loadProgramData = async () => {
    try {
      setLoading(true)
      const [programData, coursesData] = await Promise.all([
        ContentService.getTrainingProgram(params.id),
        ContentService.getCourses(params.id)
      ])
      setProgram(programData)
      setCourses(coursesData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load program data')
    } finally {
      setLoading(false)
    }
  }

  const loadModuleContent = async (courseId: string, moduleId: string) => {
    try {
      const modules = await ContentService.getModules(courseId)
      const module = modules.find((m: any) => m.id === moduleId)
      setSelectedModule(module || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load module content')
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !selectedModule) return

    setSubmittingFeedback(true)
    try {
      // In a real app, this would submit feedback to the API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      alert('Feedback submitted successfully!')
      setFeedback('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleApproveProgram = async () => {
    if (!program) return

    try {
      await ContentService.updateTrainingProgram(program.id, { status: 'approved' })
      setProgram({ ...program, status: 'approved' })
      alert('Program approved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve program')
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
              <p className="text-gray-600">Loading program...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !program) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h1>
              <p className="text-gray-600 mb-4">{error || 'The requested program could not be found.'}</p>
              <button
                onClick={() => window.location.href = '/client/dashboard'}
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
                ← Back to Dashboard
              </button>
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
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <button
                        onClick={() => window.location.href = '/client/dashboard'}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span className="sr-only">Home</span>
                      </button>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-4 text-sm font-medium text-gray-500">Dashboard</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-4 text-sm font-medium text-gray-500">{program.title}</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {program.title}
                </h1>
                {program.description && (
                  <p className="mt-1 text-sm text-gray-500">{program.description}</p>
                )}
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(program.status)}`}>
                  {program.status.replace('_', ' ')}
                </span>
                {program.status === 'in_review' && (
                  <button
                    onClick={handleApproveProgram}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve Program
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Courses List */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Course Content
                  </h3>
                  
                  {courses.length === 0 ? (
                    <p className="text-gray-500 text-sm">No courses available yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {courses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          {course.description && (
                            <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                          )}
                          <div className="mt-2">
                            <button
                              onClick={() => loadModuleContent(course.id, '')}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              View Modules →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Module Content Viewer */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {selectedModule ? (
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        {selectedModule.title}
                      </h3>
                      
                      <div className="prose max-w-none mb-6">
                        {selectedModule.content ? (
                          <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
                        ) : (
                          <p className="text-gray-500 italic">No content available for this module.</p>
                        )}
                      </div>

                      {/* Feedback Section */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Provide Feedback</h4>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Share your thoughts, suggestions, or concerns about this content..."
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={handleSubmitFeedback}
                            disabled={!feedback.trim() || submittingFeedback}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Select a module</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose a course to view its modules and content.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
