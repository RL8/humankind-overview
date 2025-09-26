'use client'

import React, { useState, useEffect } from 'react'
import { TranslationService } from '@/services/translation-service'
import { Module } from '@/types'

interface TranslationWorkspaceProps {
  module: Module
  onTranslationComplete?: (translatedModule: Module) => void
}

export default function TranslationWorkspace({ module, onTranslationComplete }: TranslationWorkspaceProps) {
  const [targetLanguage, setTargetLanguage] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<any>(null)
  const [supportedLanguages, setSupportedLanguages] = useState<{ code: string; name: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSupportedLanguages()
  }, [])

  const loadSupportedLanguages = async () => {
    try {
      const languages = await TranslationService.getSupportedLanguages()
      setSupportedLanguages(languages.filter(lang => lang.code !== module.language))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load supported languages')
    }
  }

  const handleTranslate = async () => {
    if (!targetLanguage) return

    setIsTranslating(true)
    setError(null)

    try {
      const result = await TranslationService.translateModule(module.id, targetLanguage)
      setTranslationResult(result)
      onTranslationComplete?.(result.translatedModule)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setIsTranslating(false)
    }
  }

  const getLanguageName = (code: string) => {
    return supportedLanguages.find(lang => lang.code === code)?.name || code
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Translation Workspace
        </h3>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* Translation Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="target-language" className="block text-sm font-medium text-gray-700">
              Translate to
            </label>
            <select
              id="target-language"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select target language</option>
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleTranslate}
              disabled={!targetLanguage || isTranslating}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Translating...
                </div>
              ) : (
                'Translate Module'
              )}
            </button>
          </div>
        </div>

        {/* Translation Result */}
        {translationResult && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Translation Complete
            </h4>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm text-green-800">
                <p className="font-medium">Successfully translated to {getLanguageName(targetLanguage)}</p>
                <p className="mt-1">Confidence: {Math.round((translationResult.confidence || 0) * 100)}%</p>
                <p className="mt-1">New module created: {translationResult.translatedModule?.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* Original Content Preview */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Original Content ({getLanguageName(module.language)})
          </h4>
          <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
            {module.content ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: module.content }}
              />
            ) : (
              <p className="text-gray-500 italic">No content available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
