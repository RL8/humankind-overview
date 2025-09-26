import { config } from '@/lib/config'

export interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
}

export interface TranslationResponse {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
}

export class TranslationService {
  private static baseUrl = '/api'

  static async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const response = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Translation failed')
    }

    return response.json()
  }

  static async translateModule(moduleId: string, targetLanguage: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target_language: targetLanguage }),
    })

    if (!response.ok) {
      throw new Error('Module translation failed')
    }

    return response.json()
  }

  static async getSupportedLanguages(): Promise<{ code: string; name: string }[]> {
    // For now, return the languages we support
    return [
      { code: 'en', name: 'English' },
      { code: 'nl', name: 'Dutch' },
      { code: 'fr', name: 'French' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' }
    ]
  }

  static async getTranslationStatus(moduleId: string): Promise<{ [language: string]: boolean }> {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}/translation-status`)
    
    if (!response.ok) {
      throw new Error('Failed to get translation status')
    }

    return response.json()
  }
}
