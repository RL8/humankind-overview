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
  const [layoutView, setLayoutView] = useState(0)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

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

  const toggleLayoutView = () => {
    setLayoutView((prev) => (prev + 1) % 7)
  }

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses)
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId)
    } else {
      newExpanded.add(courseId)
    }
    setExpandedCourses(newExpanded)
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  // Layout Components
  const renderAccordionLayout = () => (
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleCourse(course.id)}
            className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">📖</span>
              <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
            </div>
            <span className="text-gray-500">{expandedCourses.has(course.id) ? '▼' : '▶'}</span>
          </button>
          {expandedCourses.has(course.id) && (
            <div className="px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Modules:</div>
                <div className="space-y-1">
                  <div className="text-sm">• Module 1: Know Your Teaching Style</div>
                  <div className="text-sm">• Module 2: Understanding Children as Researchers</div>
                  <div className="text-sm">• Module 3: The Art of Listening and Questioning</div>
                  <div className="text-sm">• Module 4: Creating Environments for Wonder</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderTabbedLayout = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 text-sm font-medium">Overview</button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium">Courses</button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium">Modules</button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm font-medium">Progress</button>
        </nav>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">📊 Program Stats</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <div>• 4 Courses</div>
            <div>• 6+ Modules</div>
            <div>• 12+ Hours</div>
            <div>• Published</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-2">🎯 Learning Path</h3>
          <div className="text-sm text-green-800">
            <div className="flex items-center space-x-2">
              <span>[1]</span>
              <span>→</span>
              <span>[2]</span>
              <span>→</span>
              <span>[3]</span>
              <span>→</span>
              <span>[4]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTimelineLayout = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">🏁 Learning Journey</h3>
        <div className="flex items-center space-x-4 overflow-x-auto">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="text-xs text-gray-600">Start</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          {courses.map((course, index) => (
            <div key={course.id} className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{index + 1}</div>
              <span className="text-xs text-gray-600 max-w-20 text-center">{course.title.split(':')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCardGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div>📚 4 Modules</div>
            <div>⏱️ 3-4 Hours</div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
          <div className="mt-3 space-y-1">
            <div className="text-sm text-gray-500">• Module 1.1: Know Your Teaching Style</div>
            <div className="text-sm text-gray-500">• Module 1.2: Understanding Children as Researchers</div>
            <div className="text-sm text-gray-500">• Module 1.3: The Art of Listening and Questioning</div>
            <div className="text-sm text-gray-500">• Module 1.4: Creating Environments for Wonder</div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderMasterDetailLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Navigation</h3>
          <div className="space-y-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => toggleCourse(course.id)}
                className="w-full text-left p-2 rounded hover:bg-gray-100 text-sm"
              >
                📚 {course.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Course Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">🎯 Learning Goals:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                <li>Identify teaching approach</li>
                <li>Understand IBL methods</li>
                <li>Develop active listening skills</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800">📋 Module Overview:</h3>
              <div className="mt-2 space-y-2">
                <div className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-sm">Module 1.1: Know Your Teaching Style</div>
                  <div className="text-xs text-gray-500 mt-1">• 12-min theory video • Interactive exercises • Practical activities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTreeLayout = () => (
    <div className="space-y-2">
      <div className="font-medium text-lg text-gray-900 mb-4">📚 Floorbook Approach</div>
      {courses.map((course) => (
        <div key={course.id} className="ml-4">
          <button
            onClick={() => toggleCourse(course.id)}
            className="flex items-center space-x-2 text-left hover:text-blue-600"
          >
            <span>{expandedCourses.has(course.id) ? '▼' : '▶'}</span>
            <span className="font-medium">{course.title}</span>
          </button>
          {expandedCourses.has(course.id) && (
            <div className="ml-6 mt-2 space-y-1">
              <div className="flex items-center space-x-2">
                <span>▼</span>
                <span className="text-sm">Module 1: Know Your Teaching Style</span>
              </div>
              <div className="ml-4 text-xs text-gray-500">• 12-minute theory video</div>
              <div className="ml-4 text-xs text-gray-500">• Interactive self-assessment</div>
              <div className="ml-4 text-xs text-gray-500">• Practical observation activities</div>
              <div className="flex items-center space-x-2">
                <span>▼</span>
                <span className="text-sm">Module 2: Understanding Children as Researchers</span>
              </div>
              <div className="ml-4 text-xs text-gray-500">• 15-minute video exploration</div>
              <div className="ml-4 text-xs text-gray-500">• Practice identifying research behaviors</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderDashboardLayout = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">📊 Quick Stats</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <div>• 4 Courses</div>
            <div>• 6+ Modules</div>
            <div>• 12+ Hours</div>
            <div>• Published</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-900 mb-2">🎯 Learning Path</h3>
          <div className="text-sm text-green-800">
            <div className="flex items-center space-x-1">
              <span>[1]</span>
              <span>→</span>
              <span>[2]</span>
              <span>→</span>
              <span>[3]</span>
              <span>→</span>
              <span>[4]</span>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900 mb-2">📚 Resources</h3>
          <div className="space-y-1 text-sm text-purple-800">
            <div>• Videos</div>
            <div>• Worksheets</div>
            <div>• Templates</div>
            <div>• Guides</div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">📖 {course.title}</h3>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">View Modules ▼</button>
                <button className="text-green-600 hover:text-green-800 text-sm">Start Course</button>
                <button className="text-gray-600 hover:text-gray-800 text-sm">Bookmark</button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">{course.description}</p>
            <div className="text-sm text-gray-500">📋 Modules: 4 • ⏱️ Duration: 3-4 hours</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderCurrentLayout = () => {
    switch (layoutView) {
      case 0: return renderAccordionLayout()
      case 1: return renderTabbedLayout()
      case 2: return renderTimelineLayout()
      case 3: return renderCardGridLayout()
      case 4: return renderMasterDetailLayout()
      case 5: return renderTreeLayout()
      case 6: return renderDashboardLayout()
      default: return renderAccordionLayout()
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

          {/* Layout Toggle and Courses Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Program Layout View
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    View {layoutView + 1} of 7
                  </span>
                  <button
                    onClick={toggleLayoutView}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Toggle Layout
                  </button>
                </div>
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
                <div>
                  {renderCurrentLayout()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
