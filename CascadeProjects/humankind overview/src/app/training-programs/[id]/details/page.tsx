'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer'
import { CommentSystem } from '@/components/common/CommentSystem'
import { TranslationModal } from '@/components/common/TranslationModal'

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

  useEffect(() => {
    loadProgramDetails()
  }, [programId])

  const loadProgramDetails = async () => {
    try {
      setLoading(true)
      // Mock data for now - will be replaced with actual API call
      const mockProgram: ProgramDetails = {
        id: programId,
        title: 'Floorbook Approach - Complete Learning Series',
        language: 'en',
        content: `# Floorbook Approach - Complete Learning Series

## Table of Contents
- [Series Overview](#series-overview)
- [Course 1: Foundations of Inquiry-Based Learning](#course-1-foundations-of-inquiry-based-learning)
- [Course 2: My First Floorbook & Talking Tub](#course-2-my-first-floorbook--talking-tub)
- [Course 3: Next Level Floorbooks & Talking Tubs](#course-3-next-level-floorbooks--talking-tubs)
- [Course 4: Mastering the Floorbook Approach](#course-4-mastering-the-floorbook-approach)

---

## Series Overview

Welcome to a transformative professional learning journey that will revolutionize how you understand children, learning, and your role as an educator. The Floorbook Approach Learning Series is carefully designed as a progressive pathway that takes you from foundational philosophy to masterful practice, ensuring each step builds meaningfully on the previous one.

This comprehensive series recognizes that becoming an inquiry-based educator is not just about learning new techniques—it's about fundamentally shifting your mindset, developing sophisticated skills, and ultimately becoming a leader who can transform learning environments and mentor others. Each course is designed to meet you where you are while challenging you to grow beyond what you thought possible.

## Progressive Learning Pathway

### **Foundation → Beginner → Intermediate → Advanced**

**Course 1: Foundations of Inquiry-Based Learning**
*The Philosophical Foundation*
Begin your transformation by understanding the revolutionary shift from traditional teaching to child-centered learning. You'll discover how to see children as natural researchers and capable thinkers, learning to ask questions that spark curiosity rather than test knowledge. This foundation is essential—without this mindset shift, the techniques in later courses won't reach their full potential.

**Course 2: My First Floorbook & Talking Tub**
*From Theory to Practice*
Put your new understanding into action by creating your very first Floorbook and Talking Tub, transforming you from observer to active documenter of children's brilliant thinking. You'll learn the art of capturing authentic conversations, making children's learning visible, and turning everyday moments into powerful documentation. Through practical exercises and real classroom examples, you'll gain confidence in facilitating meaningful discussions and creating collaborative learning records that children are excited to revisit and build upon. By course completion, you'll have working Floorbooks and the skills to facilitate rich conversations that honor children's natural curiosity.

**Course 3: Next Level Floorbooks & Talking Tubs**
*Sophisticated Practice*
Elevate your practice to new heights with sophisticated techniques that transform good documentation into extraordinary learning experiences. This intermediate course empowers you to create deliberate provocations that spark deep investigations, facilitate sustained inquiries that unfold over weeks, and craft documentation that tells compelling learning stories. You'll master the art of connecting learning across different experiences, helping children see themselves as capable researchers building knowledge over time. Through advanced techniques and real classroom applications, you'll develop the confidence to guide complex investigations while maintaining the child-led spirit of inquiry-based learning.

**Course 4: Mastering the Floorbook Approach**
*Leadership and Mastery*
Step into mastery and become a leader in the field of inquiry-based learning. This advanced course prepares you to create transformative learning environments that truly embody the phrase "expansive, powerful, and potentiating." You'll learn to orchestrate sophisticated conversations where children build complex ideas together, use Floorbooks as living curriculum documents, and develop the skills to mentor others on their journey. This is where you transition from practitioner to innovator, contributing to the field while creating learning experiences that children will remember for a lifetime. You'll emerge as a confident leader ready to champion inquiry-based learning in your community.

## What Makes This Series Unique

**Incremental Skill Building**: Each course builds systematically on the previous one, ensuring no gaps in your learning journey.

**Philosophy + Practice**: We don't just teach techniques—we help you understand the 'why' behind every approach, making you a thoughtful practitioner.

**Real Classroom Application**: Every module includes practical exercises, real examples, and opportunities to implement learning immediately in your setting.

**Ongoing Support**: Through Child Voice and Practitioner Voice audio scenarios, you'll hear from children and experienced educators throughout your journey.

**Professional Growth**: By series completion, you'll not only transform your own practice but be equipped to guide others in their learning journey.

## Expected Transformation

**After Course 1**: You'll see children differently and understand the power of inquiry-based approaches.

**After Course 2**: You'll have practical tools working in your setting and confidence in facilitating meaningful conversations.

**After Course 3**: Your practice will be sophisticated and intentional, with deep impact on children's learning experiences.

**After Course 4**: You'll be a master practitioner and leader, ready to mentor others and contribute to the field.

## Time Investment & Commitment

Each course is designed for busy educators, with flexible pacing that respects your professional demands while ensuring deep learning. The series represents approximately 40-60 hours of professional development, spread across practical modules that you can implement immediately in your setting.

This isn't just professional development—it's a career transformation that will change how you see yourself as an educator and how children experience learning in your care.

**Ready to begin your transformation? Start with Course 1: Foundations of Inquiry-Based Learning.**`,
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
      
      setProgram(mockProgram)
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
                  Language: {program.language.toUpperCase()} • 
                  Last modified: {new Date(program.lastModified).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
            <MarkdownRenderer content={program.content} />
          </div>
        </div>
      </div>

      {/* Comment System */}
      {commentMode && (
        <CommentSystem
          programId={programId}
          onClose={() => setCommentMode(false)}
        />
      )}

      {/* Translation Modal */}
      {showTranslationModal && (
        <TranslationModal
          programId={programId}
          programTitle={program.title}
          currentLanguage={program.language}
          translationStatus={program.translationStatus}
          onClose={() => setShowTranslationModal(false)}
        />
      )}
    </div>
  )
}
