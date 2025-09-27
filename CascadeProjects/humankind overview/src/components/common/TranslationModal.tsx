'use client'

import { useState } from 'react'

interface TranslationStatus {
  [language: string]: {
    exists: boolean
    upToDate: boolean
    lastTranslated: string
  }
}

interface TranslationModalProps {
  programId: string
  programTitle: string
  currentLanguage: string
  translationStatus: TranslationStatus
  onClose: () => void
}

const SUPPORTED_LANGUAGES = [
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'fr-CA', name: 'Canadian French', flag: '🇨🇦' }
]

export function TranslationModal({
  programId,
  programTitle,
  currentLanguage,
  translationStatus,
  onClose
}: TranslationModalProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationProgress, setTranslationProgress] = useState(0)
  const [translationResults, setTranslationResults] = useState<{[key: string]: 'success' | 'error' | 'pending'}>({})

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode)
        ? prev.filter(lang => lang !== languageCode)
        : [...prev, languageCode]
    )
  }

  const handleStartTranslation = async () => {
    if (selectedLanguages.length === 0) return

    setIsTranslating(true)
    setTranslationProgress(0)
    setTranslationResults({})

    // Simulate translation process
    for (let i = 0; i < selectedLanguages.length; i++) {
      const language = selectedLanguages[i]
      setTranslationResults(prev => ({ ...prev, [language]: 'pending' }))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success/error
      const success = Math.random() > 0.1 // 90% success rate
      setTranslationResults(prev => ({ 
        ...prev, 
        [language]: success ? 'success' : 'error' 
      }))
      
      setTranslationProgress(((i + 1) / selectedLanguages.length) * 100)
    }

    setIsTranslating(false)
  }

  const getStatusIcon = (languageCode: string) => {
    const status = translationStatus[languageCode]
    if (!status || !status.exists) {
      return <span className="text-gray-400">○</span>
    }
    if (status.upToDate) {
      return <span className="text-green-500">●</span>
    }
    return <span className="text-yellow-500">●</span>
  }

  const getStatusText = (languageCode: string) => {
    const status = translationStatus[languageCode]
    if (!status || !status.exists) {
      return 'Not translated'
    }
    if (status.upToDate) {
      return 'Up to date'
    }
    return 'Requires update'
  }

  const getTranslationResultIcon = (languageCode: string) => {
    const result = translationResults[languageCode]
    if (!result) return null
    
    switch (result) {
      case 'success':
        return <span className="text-green-500">✓</span>
      case 'error':
        return <span className="text-red-500">✗</span>
      case 'pending':
        return <span className="text-blue-500 animate-spin">⟳</span>
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">View Translations</h3>
              <p className="text-sm text-gray-500 mt-1">{programTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isTranslating ? (
            <>
              {/* Language Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Select languages to translate to:
                </h4>
                <div className="space-y-3">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <div key={language.code} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <div className="font-medium text-gray-900">{language.name}</div>
                          <div className="text-sm text-gray-500">
                            {getStatusIcon(language.code)} {getStatusText(language.code)}
                            {translationStatus[language.code]?.lastTranslated && (
                              <span className="ml-2">
                                (Last translated: {new Date(translationStatus[language.code].lastTranslated).toLocaleDateString()})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getTranslationResultIcon(language.code)}
                        <button
                          onClick={() => handleLanguageToggle(language.code)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            selectedLanguages.includes(language.code)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {selectedLanguages.includes(language.code) ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartTranslation}
                  disabled={selectedLanguages.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedLanguages.length === 0 
                    ? 'Select Languages' 
                    : `Translate to ${selectedLanguages.length} language${selectedLanguages.length > 1 ? 's' : ''}`
                  }
                </button>
              </div>
            </>
          ) : (
            /* Translation Progress */
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Translating Content</h4>
                <p className="text-gray-600">Please wait while we translate your content...</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${translationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{Math.round(translationProgress)}% complete</p>
              </div>

              {/* Translation Status */}
              <div className="space-y-2">
                {selectedLanguages.map((languageCode) => {
                  const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode)
                  const result = translationResults[languageCode]
                  return (
                    <div key={languageCode} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{language?.flag}</span>
                        <span className="text-sm font-medium">{language?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result === 'pending' && (
                          <span className="text-blue-500 animate-spin">⟳</span>
                        )}
                        {result === 'success' && (
                          <span className="text-green-500">✓ Completed</span>
                        )}
                        {result === 'error' && (
                          <span className="text-red-500">✗ Failed</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Close Button (when translation is complete) */}
              {translationProgress === 100 && (
                <div className="mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
