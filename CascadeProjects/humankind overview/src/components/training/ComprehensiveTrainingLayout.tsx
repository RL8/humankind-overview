'use client'

import React, { useState, useEffect } from 'react'
import { Course, Module, ContentFileData } from '@/types'
import { ContentFileService } from '@/services/content-file-service'
import MarkdownRenderer from '@/components/common/MarkdownRenderer'

interface ComprehensiveTrainingLayoutProps {
  courses: Course[]
  program: any
  onLanguageChange?: (language: string) => void
  currentLanguage?: string
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
]

export default function ComprehensiveTrainingLayout({ 
  courses, 
  program, 
  onLanguageChange,
  currentLanguage = 'en' 
}: ComprehensiveTrainingLayoutProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [contentFiles, setContentFiles] = useState<ContentFileData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage)
  const [seriesOverviewContent, setSeriesOverviewContent] = useState<string>('')
  const [courseContents, setCourseContents] = useState<Record<string, string>>({})

  useEffect(() => {
    loadContentFiles()
  }, [selectedLanguage])

  const loadContentFiles = async () => {
    try {
      setLoading(true)
      const files = await ContentFileService.getContentFiles(program.id, selectedLanguage)
      setContentFiles(files)
      
      // Load series overview content
      const seriesFile = files.find(f => f.filename.includes('floorbook-approach'))
      if (seriesFile) {
        const content = await ContentFileService.getContentFileContent(program.id, seriesFile.file_path)
        setSeriesOverviewContent(content)
      }
      
      // Load course contents
      const newCourseContents: Record<string, string> = {}
      for (let i = 1; i <= 4; i++) {
        const courseFile = files.find(f => f.filename.includes(`course${i}`))
        if (courseFile) {
          const content = await ContentFileService.getContentFileContent(program.id, courseFile.file_path)
          newCourseContents[`course${i}`] = content
        }
      }
      setCourseContents(newCourseContents)
    } catch (error) {
      console.error('Error loading content files:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    onLanguageChange?.(language)
  }

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId)


  const renderModuleContent = (module: Module) => {
    if (!isExpanded(`module-${module.id}`)) {
      return (
        <div className="text-sm text-gray-500">
          {module.content ? 
            module.content.substring(0, 200) + '...' : 
            'No content available'
          }
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {module.content ? (
          <MarkdownRenderer content={module.content} />
        ) : (
          <div className="text-gray-500 italic">No content available</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Language Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">🌍 Language Selection</h3>
          <div className="flex space-x-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedLanguage === lang.code
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Series Overview */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('series-overview')}
          className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              📚 SERIES OVERVIEW
            </h2>
            <span className="text-gray-500">
              {isExpanded('series-overview') ? '▼' : '▶'}
            </span>
          </div>
        </button>
        
        {isExpanded('series-overview') && (
          <div className="px-6 pb-6 border-t border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading content...</span>
              </div>
            ) : seriesOverviewContent ? (
              <MarkdownRenderer content={seriesOverviewContent} />
            ) : (
              <div className="text-gray-500 italic">Content not available in {selectedLanguage}</div>
            )}
          </div>
        )}
      </div>

      {/* Courses */}
      {courses.map((course) => (
        <div key={course.id} className="bg-white border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection(`course-${course.id}`)}
            className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                📖 {course.title}
              </h2>
              <span className="text-gray-500">
                {isExpanded(`course-${course.id}`) ? '▼' : '▶'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {course.description}
            </p>
          </button>
          
          {isExpanded(`course-${course.id}`) && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <div className="space-y-4">
                {/* Course Content */}
                <div className="prose prose-sm max-w-none">
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading content...</span>
                    </div>
                  ) : (() => {
                    const courseNumber = course.id.split('-').pop()
                    const courseContent = courseContents[`course${courseNumber}`]
                    return courseContent ? (
                      <MarkdownRenderer content={courseContent} />
                    ) : (
                      <div>
                        <p>{course.description}</p>
                        <div className="text-gray-500 italic mt-2">
                          Detailed content not available in {selectedLanguage}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Modules */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">Modules</h3>
                  {course.modules?.map((module: Module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleSection(`module-${module.id}`)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-gray-900 flex items-center">
                            📋 {module.title}
                          </h4>
                          <span className="text-gray-500">
                            {isExpanded(`module-${module.id}`) ? '▼' : '▶'}
                          </span>
                        </div>
                      </button>
                      
                      {isExpanded(`module-${module.id}`) && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                          {renderModuleContent(module)}
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="text-sm text-gray-500 italic">
                      No modules available for this course.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Source Documents & Resources */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('resources')}
          className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              📁 SOURCE DOCUMENTS & RESOURCES
            </h2>
            <span className="text-gray-500">
              {isExpanded('resources') ? '▼' : '▶'}
            </span>
          </div>
        </button>
        
        {isExpanded('resources') && (
          <div className="px-6 pb-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium text-gray-900">brandbook.pdf</div>
                  <div className="text-sm text-gray-500">Brand guidelines</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium text-gray-900">vision-policy.pdf</div>
                  <div className="text-sm text-gray-500">Vision and policy</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-medium text-gray-900">floorbook-approach.pdf</div>
                  <div className="text-sm text-gray-500">Complete guide</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <span className="text-2xl">🖼️</span>
                <div>
                  <div className="font-medium text-gray-900">mindstretchers-logo.png</div>
                  <div className="text-sm text-gray-500">Logo file</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                📥 Download All Resources
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
