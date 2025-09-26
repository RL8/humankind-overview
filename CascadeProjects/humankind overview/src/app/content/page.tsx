'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import FileUpload from '@/components/content/FileUpload'
import { ContentService } from '@/services/content-service'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/auth'

interface ContentFile {
  id: string
  filename: string
  original_filename: string
  content_type: string
  status: string
  file_size: number
  language: string
  created_at: string
  users?: { name: string }
}

export default function ContentPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<ContentFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    contentType: '',
    language: '',
    status: ''
  })
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    loadContent()
  }, [searchQuery, filters])

  const loadContent = async () => {
    try {
      setLoading(true)
      if (searchQuery.trim()) {
        const response = await ContentService.searchContent(searchQuery, {
          contentType: filters.contentType || undefined,
          language: filters.language || undefined,
          status: filters.status || undefined,
          clientId: user?.role === UserRole.CLIENT ? user.id : undefined
        })
        setFiles(response.data || [])
      } else {
        // Load all content for the user
        setFiles([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (file: any) => {
    setFiles([file, ...files])
    setShowUpload(false)
  }

  const handleUploadError = (error: string) => {
    setError(error)
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

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'document': return '📄'
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      case 'presentation': return '📊'
      default: return '📁'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const canUpload = user?.role === UserRole.COMPOSER || user?.role === UserRole.PRINCIPAL || user?.role === UserRole.ADMIN

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Content Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your training content and files
              </p>
            </div>
            {canUpload && (
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload Content
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Upload Modal */}
          {showUpload && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Content</h3>
                  <FileUpload
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    accept="*/*"
                    maxSize={10 * 1024 * 1024}
                    multiple={false}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setShowUpload(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Content
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by filename..."
                />
              </div>
              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
                  Content Type
                </label>
                <select
                  id="contentType"
                  value={filters.contentType}
                  onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading content...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No content found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by uploading some content.'}
                </p>
                {canUpload && !searchQuery && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowUpload(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Upload Content
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file.id}>
                    <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getContentTypeIcon(file.content_type)}</span>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {file.original_filename}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                              {file.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span className="ml-4">Language: {file.language}</span>
                            <span className="ml-4">Type: {file.content_type}</span>
                            <span className="ml-4">Uploaded {new Date(file.created_at).toLocaleDateString()}</span>
                            {file.users && (
                              <span className="ml-4">by {file.users.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => {
                            // In a real app, this would download or open the file
                            alert('File download functionality coming soon!')
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}