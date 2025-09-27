'use client'

import { useState, useEffect, useRef } from 'react'

interface Comment {
  id: string
  text: string
  comment: string
  author: string
  timestamp: string
  position: {
    start: number
    end: number
  }
}

interface CommentSystemProps {
  programId: string
  onClose: () => void
}

export function CommentSystem({ programId, onClose }: CommentSystemProps) {
  const [selectedText, setSelectedText] = useState('')
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing comments
    loadComments()
  }, [programId])

  useEffect(() => {
    // Add selection event listeners
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        const text = selection.toString().trim()
        setSelectedText(text)
        
        // Calculate position in the content
        const range = selection.getRangeAt(0)
        const startOffset = getTextOffset(range.startContainer, range.startOffset)
        const endOffset = getTextOffset(range.endContainer, range.endOffset)
        
        setSelectionRange({ start: startOffset, end: endOffset })
        setShowCommentForm(true)
      }
    }

    document.addEventListener('mouseup', handleSelection)
    return () => document.removeEventListener('mouseup', handleSelection)
  }, [])

  const getTextOffset = (node: Node, offset: number): number => {
    let textOffset = 0
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT
    )
    
    let currentNode
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset
      }
      textOffset += currentNode.textContent?.length || 0
    }
    
    return textOffset
  }

  const loadComments = async () => {
    try {
      // Mock data for now - will be replaced with actual API call
      const mockComments: Comment[] = [
        {
          id: '1',
          text: 'children are natural researchers',
          comment: 'This is a key concept that needs emphasis in the Dutch translation',
          author: 'John Doe',
          timestamp: '2024-01-15T10:30:00Z',
          position: { start: 150, end: 180 }
        },
        {
          id: '2',
          text: 'inquiry-based learning',
          comment: 'Consider using a more specific term in German',
          author: 'Jane Smith',
          timestamp: '2024-01-15T11:15:00Z',
          position: { start: 200, end: 220 }
        }
      ]
      setComments(mockComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!comment.trim() || !selectedText.trim() || !selectionRange) return

    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        text: selectedText,
        comment: comment.trim(),
        author: 'Current User', // Will be replaced with actual user
        timestamp: new Date().toISOString(),
        position: selectionRange
      }

      setComments(prev => [...prev, newComment])
      setComment('')
      setSelectedText('')
      setSelectionRange(null)
      setShowCommentForm(false)
      
      // Clear selection
      window.getSelection()?.removeAllRanges()
    } catch (error) {
      console.error('Failed to save comment:', error)
    }
  }

  const handleCancelComment = () => {
    setComment('')
    setSelectedText('')
    setSelectionRange(null)
    setShowCommentForm(false)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Comment System */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Select text to add comments
          </p>
          </div>

        {/* Comment Form */}
        {showCommentForm && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Text:
              </label>
              <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                "{selectedText}"
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Comment:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSubmitComment}
                disabled={!comment.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Comment
              </button>
              <button
                onClick={handleCancelComment}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No comments yet</p>
              <p className="text-sm">Select text to add the first comment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {comment.author}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                    "{comment.text}"
                  </div>
                  <div className="text-sm text-gray-800">
                    {comment.comment}
                  </div>
                </div>
              ))}
              </div>
          )}
        </div>
      </div>
    </>
  )
}