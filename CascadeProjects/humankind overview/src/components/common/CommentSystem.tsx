'use client'

import React, { useState, useEffect } from 'react'
import { CommentService } from '@/services/comment-service'
import { Comment, CreateCommentInput } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface CommentSystemProps {
  contentId: string
  contentType: 'module' | 'unit'
  onCommentAdded?: (comment: Comment) => void
  onCommentUpdated?: (comment: Comment) => void
  onCommentDeleted?: (commentId: string) => void
}

export default function CommentSystem({
  contentId,
  contentType,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted
}: CommentSystemProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    loadComments()
  }, [contentId, contentType])

  const loadComments = async () => {
    try {
      setLoading(true)
      const commentsData = await CommentService.getComments(contentId, contentType)
      setComments(commentsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    try {
      const commentData: CreateCommentInput = {
        content_id: contentId,
        content_type: contentType,
        message: newComment.trim()
      }

      const comment = await CommentService.createComment(commentData, user.id)
      setComments([...comments, comment])
      setNewComment('')
      onCommentAdded?.(comment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return

    try {
      const updatedComment = await CommentService.updateComment(commentId, {
        message: editText.trim()
      })
      setComments(comments.map(c => c.id === commentId ? updatedComment : c))
      setEditingComment(null)
      setEditText('')
      onCommentUpdated?.(updatedComment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await CommentService.deleteComment(commentId)
      setComments(comments.filter(c => c.id !== commentId))
      onCommentDeleted?.(commentId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment')
    }
  }

  const handleResolveComment = async (commentId: string) => {
    try {
      const updatedComment = await CommentService.updateComment(commentId, {
        status: 'resolved'
      })
      setComments(comments.map(c => c.id === commentId ? updatedComment : c))
      onCommentUpdated?.(updatedComment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve comment')
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditText(comment.message)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditText('')
  }

  const canEditComment = (comment: Comment) => {
    return user && (user.id === comment.author_id || user.role === 'admin' || user.role === 'principal')
  }

  const canResolveComment = (comment: Comment) => {
    return user && (user.role === 'admin' || user.role === 'principal' || user.role === 'composer')
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Comments & Feedback ({comments.length})
        </h3>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* New Comment Form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div>
              <label htmlFor="new-comment" className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment
              </label>
              <textarea
                id="new-comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts, suggestions, or concerns..."
                disabled={submitting}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-2">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`border rounded-lg p-4 ${comment.status === 'resolved' ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author?.name || comment.author?.email || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        comment.status === 'open' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {comment.status}
                      </span>
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {canEditComment(comment) && editingComment !== comment.id && (
                      <button
                        onClick={() => startEditing(comment)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                    )}
                    {canResolveComment(comment) && comment.status === 'open' && (
                      <button
                        onClick={() => handleResolveComment(comment.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Resolve
                      </button>
                    )}
                    {canEditComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
