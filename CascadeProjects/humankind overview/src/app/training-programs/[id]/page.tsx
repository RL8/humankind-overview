'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import { ContentService } from '@/services/content-service'
import { DefaultProgramService } from '@/services/default-program-service'
import { TrainingProgramme, Course, Module } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

interface ProgrammeDetailPageProps {
  params: { id: string }
}

export default function ProgrammeDetailPage({ params }: ProgrammeDetailPageProps) {
  const { user } = useAuth()
  const [programme, setProgramme] = useState<TrainingProgramme | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    order_index: 0
  })

  useEffect(() => {
    loadProgrammeData()
  }, [params.id])

  const loadProgrammeData = async () => {
    try {
      setLoading(true)
      
      // Check if this is the default program
      if (DefaultProgramService.isDefaultProgram(params.id)) {
        const defaultProgram = DefaultProgramService.getCompleteDefaultProgram()
        setProgramme(defaultProgram.programme)
        setCourses(defaultProgram.courses)
      } else {
        const [programmeData, coursesData] = await Promise.all([
          ContentService.getTrainingProgramme(params.id),
          ContentService.getCourses(params.id)
        ])
        setProgramme(programmeData)
        setCourses(coursesData || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programme data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const course = await ContentService.createCourse(params.id, {
        ...newCourse,
        programme_id: params.id
      })
      setCourses([...courses, course])
      setNewCourse({ title: '', description: '', order_index: courses.length })
      setShowCreateCourse(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
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
              <p className="text-gray-600">Loading programme...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !programme) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Programme Not Found</h1>
              <p className="text-gray-600 mb-4">{error || 'The requested programme could not be found.'}</p>
              <button
                onClick={() => window.location.href = '/training-programs'}
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
                ← Back to Programmes
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
                        onClick={() => window.location.href = '/training-programs'}
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
                        <span className="ml-4 text-sm font-medium text-gray-500">Programmes</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-4 text-sm font-medium text-gray-500">{programme.title}</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {programme.title}
                </h1>
                {programme.description && (
                  <p className="mt-1 text-sm text-gray-500">{programme.description}</p>
                )}
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(programme.status)}`}>
                  {programme.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Default Program Notice */}
          {DefaultProgramService.isDefaultProgram(params.id) && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Default Training Program
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This is the default Floorbook Approach program available to all users. 
                      {user && DefaultProgramService.canCreateCopy(user.role as string) && (
                        <> You can create your own editable copy by clicking "Create My Copy" on the programs list.</>
                      )}
                      {user && !DefaultProgramService.canCreateCopy(user.role as string) && (
                        <> You can view and comment on this program, but cannot create your own copy.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Course Form - Hidden for default programs */}
          {showCreateCourse && !DefaultProgramService.isDefaultProgram(params.id) && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Course</h3>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Course Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter course description"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateCourse(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Courses Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Courses ({courses.length})
                </h3>
                {!DefaultProgramService.isDefaultProgram(params.id) && (
                  <button
                    onClick={() => setShowCreateCourse(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Course
                </button>
                )}
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                          {course.description && (
                            <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                          )}
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span>Order: {course.order_index}</span>
                            <span className="ml-4">Created {new Date(course.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                            {course.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => window.location.href = `/courses/${course.id}`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
