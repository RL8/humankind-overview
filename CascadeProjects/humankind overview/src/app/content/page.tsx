'use client'

import React, { useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/layout/Navigation'
import FileUpload from '@/components/content/FileUpload'
import ContentList from '@/components/content/ContentList'
import { ContentFile, ContentSearchResult } from '@/services/content-service'
import { formatFileSize } from '@/lib/storage'
import { UserRole } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

export default function ContentManagementPage() {
  const { user, session } = useAuth()
  const [selectedContent, setSelectedContent] = useState<ContentFile | ContentSearchResult | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUpload = async (file: File, metadata: any) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', metadata.title || file.name)
      formData.append('description', metadata.description || '')
      formData.append('language', metadata.language || 'en')
      
      if (metadata.programme_id) formData.append('programme_id', metadata.programme_id)
      if (metadata.course_id) formData.append('course_id', metadata.course_id)
      if (metadata.module_id) formData.append('module_id', metadata.module_id)
      if (metadata.unit_id) formData.append('unit_id', metadata.unit_id)

      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      // Refresh content list
      setRefreshKey(prev => prev + 1)
      
      // Show success message
      alert('File uploaded successfully!')
    } catch (error) {
      throw error // Re-throw to be handled by FileUpload component
    }
  }

  const handleContentSelect = (content: ContentFile | ContentSearchResult) => {
    setSelectedContent(content)
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.COMPOSER, UserRole.PRINCIPAL, UserRole.ADMIN]}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Content Management
                </h1>
                <p className="text-gray-600">
                  Upload, organize, and manage your training content
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {showUpload ? 'Hide Upload' : 'Upload Content'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Your Content
                </h2>
                <ContentList
                  key={refreshKey}
                  showSearch={true}
                  showFilters={true}
                  onContentSelect={handleContentSelect}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upload Section */}
              {showUpload && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upload New Content
                  </h3>
                  <FileUpload
                    onUpload={handleUpload}
                    multiple={true}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
                  />
                </div>
              )}

              {/* Content Details */}
              {selectedContent && (
                <ContentDetails
                  content={selectedContent}
                  onClose={() => setSelectedContent(null)}
                />
              )}

              {/* Quick Stats */}
              <ContentStats />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

interface ContentDetailsProps {
  content: ContentFile | ContentSearchResult
  onClose: () => void
}

function ContentDetails({ content, onClose }: ContentDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Content Details
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Title</h4>
          <p className="text-sm text-gray-900">{content.title || content.filename}</p>
        </div>

        {content.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Description</h4>
            <p className="text-sm text-gray-900">{content.description}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700">File Details</h4>
          <div className="text-sm text-gray-900 space-y-1">
            <p>Filename: {content.filename}</p>
            <p>Size: {formatFileSize(content.file_size)}</p>
            <p>Type: {content.content_type}</p>
            <p>Language: {content.language}</p>
            <p>Status: {content.status}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Timestamps</h4>
          <div className="text-sm text-gray-900 space-y-1">
            <p>Created: {formatDate(content.created_at)}</p>
            {'updated_at' in content && content.updated_at && (
              <p>Updated: {formatDate(content.updated_at)}</p>
            )}
          </div>
        </div>

        {'programme_title' in content && content.programme_title && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Programme</h4>
            <p className="text-sm text-gray-900">{content.programme_title}</p>
          </div>
        )}

        {'uploaded_by_name' in content && content.uploaded_by_name && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">Uploaded By</h4>
            <p className="text-sm text-gray-900">{content.uploaded_by_name}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ContentStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        // This would be a separate API endpoint for getting content statistics
        // For now, we'll show a placeholder
        setStats({
          total: 0,
          by_type: {},
          by_status: {},
          total_size: 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Content Statistics
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Files</span>
          <span className="text-sm font-medium text-gray-900">{stats?.total || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Size</span>
          <span className="text-sm font-medium text-gray-900">
            {stats?.total_size ? formatFileSize(stats.total_size) : '0 Bytes'}
          </span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Content management system is ready for use. Upload your first files to get started!
          </p>
        </div>
      </div>
    </div>
  )
}
