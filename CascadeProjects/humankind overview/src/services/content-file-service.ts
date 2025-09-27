import { ContentFile } from '@/types'

export interface ContentFileData {
  id: string
  filename: string
  file_path: string
  language: string
  content_type: 'markdown' | 'pdf' | 'image' | 'other'
  size: number
  last_modified: string
  content?: string
}

export class ContentFileService {
  private static getBaseUrl(): string {
    // Use environment variable for base URL, fallback to relative for client-side
    if (typeof window !== 'undefined') {
      // Client-side: use relative URLs
      return '/api/content'
    } else {
      // Server-side: use absolute URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'
      return `${baseUrl}/api/content`
    }
  }

  /**
   * Get content files for a specific program and language
   */
  static async getContentFiles(programId: string, language: string = 'en'): Promise<ContentFileData[]> {
    try {
      const baseUrl = this.getBaseUrl()
      const url = `${baseUrl}/training-programs/${programId}/files?language=${language}`
      console.log(`Fetching content files from: ${url}`)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch content files: ${response.status} ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching content files:', error)
      // Return mock data for now
      return this.getMockContentFiles(programId, language)
    }
  }

  /**
   * Get specific content file content
   */
  static async getContentFileContent(programId: string, filePath: string): Promise<string> {
    try {
      const baseUrl = this.getBaseUrl()
      const url = `${baseUrl}/training-programs/${programId}/content/${filePath}`
      console.log(`Fetching content from: ${url}`)
      
      const response = await fetch(url)
      if (!response.ok) {
        console.error(`HTTP ${response.status}: ${response.statusText} for ${url}`)
        throw new Error(`Failed to fetch content file: ${response.status} ${response.statusText}`)
      }
      return response.text()
    } catch (error) {
      console.error(`Error fetching content file content for ${programId}/${filePath}:`, error)
      return 'Content not available'
    }
  }

  /**
   * Get available languages for a program
   */
  static async getAvailableLanguages(programId: string): Promise<string[]> {
    try {
      const baseUrl = this.getBaseUrl()
      const url = `${baseUrl}/training-programs/${programId}/languages`
      console.log(`Fetching available languages from: ${url}`)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch available languages: ${response.status} ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching available languages:', error)
      return ['en', 'nl', 'fr', 'zh']
    }
  }

  /**
   * Mock content files for development
   */
  private static getMockContentFiles(programId: string, language: string): ContentFileData[] {
    const baseFiles = [
      {
        id: `base/floorbook-approach/content-grids/${language}/floorbook-approach-${language}.md`,
        filename: `floorbook-approach-${language}.md`,
        file_path: `base/floorbook-approach/content-grids/${language}/floorbook-approach-${language}.md`,
        language,
        content_type: 'markdown' as const,
        size: 5000,
        last_modified: '2024-01-01T00:00:00Z'
      },
      {
        id: `base/floorbook-approach/content-grids/${language}/course1-${language}.md`,
        filename: `course1-${language}.md`,
        file_path: `base/floorbook-approach/content-grids/${language}/course1-${language}.md`,
        language,
        content_type: 'markdown' as const,
        size: 8000,
        last_modified: '2024-01-01T00:00:00Z'
      },
      {
        id: `base/floorbook-approach/content-grids/${language}/course2-${language}.md`,
        filename: `course2-${language}.md`,
        file_path: `base/floorbook-approach/content-grids/${language}/course2-${language}.md`,
        language,
        content_type: 'markdown' as const,
        size: 7500,
        last_modified: '2024-01-01T00:00:00Z'
      },
      {
        id: `base/floorbook-approach/content-grids/${language}/course3-${language}.md`,
        filename: `course3-${language}.md`,
        file_path: `base/floorbook-approach/content-grids/${language}/course3-${language}.md`,
        language,
        content_type: 'markdown' as const,
        size: 7200,
        last_modified: '2024-01-01T00:00:00Z'
      },
      {
        id: `base/floorbook-approach/content-grids/${language}/course4-${language}.md`,
        filename: `course4-${language}.md`,
        file_path: `base/floorbook-approach/content-grids/${language}/course4-${language}.md`,
        language,
        content_type: 'markdown' as const,
        size: 6800,
        last_modified: '2024-01-01T00:00:00Z'
      }
    ]

    // Add source documents
    const sourceDocs = [
      {
        id: `base/floorbook-approach/source-documents/brandbook.pdf`,
        filename: 'brandbook.pdf',
        file_path: `base/floorbook-approach/source-documents/brandbook.pdf`,
        language: 'en',
        content_type: 'pdf' as const,
        size: 2500000,
        last_modified: '2024-01-01T00:00:00Z'
      },
      {
        id: `base/floorbook-approach/source-documents/vision-policy.pdf`,
        filename: 'vision-policy.pdf',
        file_path: `base/floorbook-approach/source-documents/vision-policy.pdf`,
        language: 'en',
        content_type: 'pdf' as const,
        size: 1800000,
        last_modified: '2024-01-01T00:00:00Z'
      },
      {
        id: `base/floorbook-approach/source-documents/floorbook-approach.pdf`,
        filename: 'floorbook-approach.pdf',
        file_path: `base/floorbook-approach/source-documents/floorbook-approach.pdf`,
        language: 'en',
        content_type: 'pdf' as const,
        size: 3200000,
        last_modified: '2024-01-01T00:00:00Z'
      },
      {
        id: `base/floorbook-approach/assets/images/mindstretchers-logo.png`,
        filename: 'mindstretchers-logo.png',
        file_path: `base/floorbook-approach/assets/images/mindstretchers-logo.png`,
        language: 'en',
        content_type: 'image' as const,
        size: 150000,
        last_modified: '2024-01-01T00:00:00Z'
      }
    ]

    return [...baseFiles, ...sourceDocs]
  }

  /**
   * Parse markdown content and extract structured data
   */
  static parseMarkdownContent(content: string): {
    title: string
    sections: Array<{
      heading: string
      content: string
      level: number
    }>
  } {
    const lines = content.split('\n')
    const sections: Array<{
      heading: string
      content: string
      level: number
    }> = []
    
    let currentSection = {
      heading: '',
      content: '',
      level: 0
    }
    
    let title = ''
    
    for (const line of lines) {
      if (line.startsWith('# ')) {
        title = line.substring(2).trim()
      } else if (line.startsWith('## ')) {
        if (currentSection.heading) {
          sections.push({ ...currentSection })
        }
        currentSection = {
          heading: line.substring(3).trim(),
          content: '',
          level: 2
        }
      } else if (line.startsWith('### ')) {
        if (currentSection.heading) {
          sections.push({ ...currentSection })
        }
        currentSection = {
          heading: line.substring(4).trim(),
          content: '',
          level: 3
        }
      } else if (line.trim()) {
        currentSection.content += line + '\n'
      }
    }
    
    if (currentSection.heading) {
      sections.push(currentSection)
    }
    
    return { title, sections }
  }
}
