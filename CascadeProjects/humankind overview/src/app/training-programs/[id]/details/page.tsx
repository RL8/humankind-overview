'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'
import { CommentSystem } from '@/components/common/CommentSystem'
import { TranslationModal } from '@/components/common/TranslationModal'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

interface ProgramDetails {
  id: string
  title: string
  language: string
  content: string
  lastModified: string
  translationStatus: {
    [language: string]: {
      exists: boolean
      upToDate: boolean
      lastTranslated: string
    }
  }
}

export default function ProgramDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const programId = params.id as string
  
  const [program, setProgram] = useState<ProgramDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [commentMode, setCommentMode] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'minimal' | 'academic' | 'modern' | 'warm'>('default')

  useEffect(() => {
    loadProgramDetails()
  }, [programId])

  const loadProgramDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Determine filename based on program ID
      const filename = (programId === 'floorbook_default' || programId === 'floorbook-approach')
        ? 'floorbook-approach-complete-series-en-v2' 
        : programId
      
      const response = await fetch(`/api/content/markdown/${filename}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      const program: ProgramDetails = {
        id: programId,
        title: 'Floorbook Approach - Complete Learning Series',
        language: 'en',
        content: data.content,
        lastModified: '2024-01-15T10:30:00Z',
        translationStatus: {
          'nl': {
            exists: true,
            upToDate: true,
            lastTranslated: '2024-01-15T11:00:00Z'
          },
          'de': {
            exists: false,
            upToDate: false,
            lastTranslated: ''
          },
          'zh-CN': {
            exists: false,
            upToDate: false,
            lastTranslated: ''
          }
        }
      }
      
      setProgram(program)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load program details')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToPrograms = () => {
    router.push('/training-programs')
  }

  const handleViewTranslations = () => {
    setShowTranslationModal(true)
  }

  const handleCommentToggle = () => {
    setCommentMode(!commentMode)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading program details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBackToPrograms}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Programs
          </button>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Program not found</div>
          <button
            onClick={handleBackToPrograms}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Programs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToPrograms}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{program.title}</h1>
                <p className="text-sm text-gray-500">
                  Language: {program.language ? program.language.toUpperCase() : 'EN'} • 
                  Last modified: {new Date(program.lastModified).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default Theme</option>
                <option value="minimal">Minimal</option>
                <option value="academic">Academic</option>
                <option value="modern">Modern</option>
                <option value="warm">Warm</option>
              </select>
              <button
                onClick={handleViewTranslations}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View Translations
              </button>
              <button
                onClick={handleCommentToggle}
                className={`px-4 py-2 rounded-md transition-colors ${
                  commentMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {commentMode ? 'Exit Comment Mode' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8">
            <ErrorBoundary>
              <MarkdownRenderer content={program.content} theme={selectedTheme} />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Comment System */}
      {commentMode && (
        <ErrorBoundary>
          <CommentSystem
            programId={programId}
            onClose={() => setCommentMode(false)}
          />
        </ErrorBoundary>
      )}

      {/* Translation Modal */}
      {showTranslationModal && (
        <ErrorBoundary>
          <TranslationModal
            programId={programId}
            programTitle={program.title}
            currentLanguage={program.language}
            translationStatus={program.translationStatus}
            onClose={() => setShowTranslationModal(false)}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}
