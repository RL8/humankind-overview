'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import RichTextEditor from '@/components/content/RichTextEditor'
import CommentSystem from '@/components/common/CommentSystem'
import TranslationWorkspace from '@/components/content/TranslationWorkspace'
import { ContentService } from '@/services/content-service'
import { Course, Module, CreateModuleInput } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

interface CourseDetailPageProps {
  params: { id: string }
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModule, setShowCreateModule] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [translatingModule, setTranslatingModule] = useState<Module | null>(null)
  const [newModule, setNewModule] = useState<CreateModuleInput>({
    course_id: params.id,
    title: '',
    content: '',
    order_index: 0,
    language: 'en'
  })

  useEffect(() => {
    loadCourseData()
  }, [params.id])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      const modulesData = await ContentService.getModules(params.id)
      setModules(modulesData || [])
      // Note: In a real app, you'd also fetch course details
      setCourse({
        id: params.id,
        programme_id: '',
        title: 'Sample Course',
        description: 'Course description',
        order_index: 0,
        status: 'draft',
        created_at: new Date().toISOString()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const module = await ContentService.createModule(params.id, {
        ...newModule,
        course_id: params.id
      })
      setModules([...modules, module])
      setNewModule({ course_id: params.id, title: '', content: '', order_index: modules.length, language: 'en' })
      setShowCreateModule(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module')
    }
  }

  const handleUpdateModule = async (moduleId: string, content: string) => {
    try {
      await ContentService.updateModule(moduleId, { content })
      setModules(modules.map(m => m.id === moduleId ? { ...m, content } : m))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module')
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
              <p className="text-gray-600">Loading course...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
              <p className="text-gray-600 mb-4">{error || 'The requested course could not be found.'}</p>
              <button
                onClick={() => window.history.back()}
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
                ← Go Back
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
                        <span className="ml-4 text-sm font-medium text-gray-500">{course.title}</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                )}
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
                  {course.status.replace('_', ' ')}
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

          {/* Create Module Form */}
          {showCreateModule && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Module</h3>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Module Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter module title"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    id="language"
                    value={newModule.language}
                    onChange={(e) => setNewModule({ ...newModule, language: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="nl">Dutch</option>
                    <option value="fr">French</option>
                    <option value="zh-CN">Chinese (Simplified)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModule(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Module
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modules Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Modules ({modules.length})
              </h3>
              <button
                onClick={() => setShowCreateModule(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Module
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No modules</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new module.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-gray-900">{module.title}</h4>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>Order: {module.order_index}</span>
                            <span className="ml-4">Language: {module.language}</span>
                            <span className="ml-4">Created {new Date(module.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                            {module.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => setEditingModule(editingModule?.id === module.id ? null : module)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            {editingModule?.id === module.id ? 'Cancel Edit' : 'Edit Content'}
                          </button>
                          <button
                            onClick={() => setTranslatingModule(translatingModule?.id === module.id ? null : module)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            {translatingModule?.id === module.id ? 'Cancel Translation' : 'Translate'}
                          </button>
                        </div>
                      </div>

                      {editingModule?.id === module.id ? (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Module Content
                          </label>
                          <RichTextEditor
                            value={module.content || ''}
                            onChange={(content) => handleUpdateModule(module.id, content)}
                            placeholder="Enter module content..."
                            height={300}
                          />
                        </div>
                      ) : (
                        <div className="mt-4">
                          {module.content ? (
                            <div 
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: module.content }}
                            />
                          ) : (
                            <p className="text-gray-500 italic">No content yet. Click "Edit Content" to add content.</p>
                          )}
                          
                          {/* Comments Section */}
                          <div className="mt-6">
                            <CommentSystem
                              contentId={module.id}
                              contentType="module"
                              onCommentAdded={(comment) => {
                                console.log('New comment added:', comment)
                              }}
                              onCommentUpdated={(comment) => {
                                console.log('Comment updated:', comment)
                              }}
                              onCommentDeleted={(commentId) => {
                                console.log('Comment deleted:', commentId)
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Translation Workspace */}
                      {translatingModule?.id === module.id && (
                        <div className="mt-4">
                          <TranslationWorkspace
                            module={module}
                            onTranslationComplete={(translatedModule) => {
                              console.log('Translation completed:', translatedModule)
                              setTranslatingModule(null)
                              // Reload modules to show the new translated module
                              loadCourseData()
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
