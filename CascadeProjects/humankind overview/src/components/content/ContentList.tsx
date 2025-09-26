'use client'

import React, { useState, useEffect } from 'react'
import { ContentType } from '@/services/content-service'
import { ContentFile, ContentStatus, ContentSearchResult } from '@/types'
import { formatFileSize, getFileTypeIcon } from '@/lib/storage'
import { useAuth } from '@/hooks/useAuth'

interface ContentListProps {
  programmeId?: string
  courseId?: string
  moduleId?: string
  unitId?: string
  showSearch?: boolean
  showFilters?: boolean
  onContentSelect?: (content: ContentFile | ContentSearchResult) => void
  className?: string
}

export default function ContentList({
  programmeId,
  courseId,
  moduleId,
  unitId,
  showSearch = true,
  showFilters = true,
  onContentSelect,
  className = ''
}: ContentListProps) {
  const { user, session } = useAuth()
  const [content, setContent] = useState<(ContentFile | ContentSearchResult)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    type: '' as ContentType | '',
    language: '',
    status: '' as ContentStatus | ''
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: false
  })

  const fetchContent = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (searchQuery) params.append('q', searchQuery)
      if (filters.type) params.append('type', filters.type)
      if (filters.language) params.append('language', filters.language)
      if (filters.status) params.append('status', filters.status)
      if (programmeId) params.append('programme_id', programmeId)
      
      params.append('limit', pagination.limit.toString())
      params.append('offset', reset ? '0' : pagination.offset.toString())

      const response = await fetch(`/api/content?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }

      const data = await response.json()
      
      if (reset) {
        setContent(data.content)
        setPagination(prev => ({ ...prev, offset: 0, hasMore: data.pagination.has_more }))
      } else {
        setContent(prev => [...prev, ...data.content])
        setPagination(prev => ({ 
          ...prev, 
          offset: prev.offset + pagination.limit,
          hasMore: data.pagination.has_more 
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent(true)
  }, [searchQuery, filters, programmeId, courseId, moduleId, unitId])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchContent(false)
    }
  }

  const handleContentClick = (item: ContentFile | ContentSearchResult) => {
    if (onContentSelect) {
      onContentSelect(item)
    }
  }

  const deleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      // Remove from local state
      setContent(prev => prev.filter(c => c.id !== contentId))
    } catch (err) {
      alert(`Failed to delete content: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const downloadContent = async (contentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/content/${contentId}/download`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const data = await response.json()
      
      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = data.download_url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      alert(`Failed to download content: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {showSearch && (
            <div>
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="nl">Dutch</option>
                <option value="fr">French</option>
                <option value="zh-cn">Chinese (Simplified)</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Content List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {loading && content.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📁</div>
          <p>No content found</p>
          {searchQuery && (
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((item) => (
            <ContentItem
              key={item.id}
              content={item}
              onClick={() => handleContentClick(item)}
              onDownload={() => downloadContent(item.id, item.filename)}
              onDelete={() => deleteContent(item.id)}
              showActions={true}
            />
          ))}

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ContentItemProps {
  content: ContentFile | ContentSearchResult
  onClick?: () => void
  onDownload?: () => void
  onDelete?: () => void
  showActions?: boolean
}

function ContentItem({ 
  content, 
  onClick, 
  onDownload, 
  onDelete, 
  showActions = true 
}: ContentItemProps) {
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {/* File Icon */}
        <div className="flex-shrink-0 text-3xl">
          {getFileTypeIcon(content.mime_type || '')}
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 
              className="text-lg font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={onClick}
            >
              {content.title || content.filename}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
              {content.status}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {content.content_type}
            </span>
          </div>

          {content.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {content.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{formatFileSize(content.file_size)}</span>
            <span>•</span>
            <span>{formatDate(content.created_at)}</span>
            <span>•</span>
            <span className="capitalize">{content.language}</span>
            {'programme_title' in content && content.programme_title && (
              <>
                <span>•</span>
                <span>{content.programme_title}</span>
              </>
            )}
            {'uploaded_by_name' in content && content.uploaded_by_name && (
              <>
                <span>•</span>
                <span>by {content.uploaded_by_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onDownload}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
              title="Download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <button
              onClick={onClick}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
              title="View Details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
