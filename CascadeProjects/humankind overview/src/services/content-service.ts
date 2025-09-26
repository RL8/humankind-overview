import { TrainingProgram, Course, Module, Unit, CreateTrainingProgramInput, CreateCourseInput, CreateModuleInput, CreateUnitInput } from '@/types'

export class ContentService {
  private static baseUrl = '/api'

  // Training Programs
  static async getTrainingPrograms(params?: {
    clientId?: string
    status?: string
    limit?: number
    offset?: number
    includeDefault?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params?.clientId) searchParams.set('client_id', params.clientId)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.includeDefault !== undefined) searchParams.set('include_default', params.includeDefault.toString())

    const response = await fetch(`${this.baseUrl}/training-programs?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to fetch training programs')
    }
    return response.json()
  }

  static async getTrainingProgram(id: string) {
    const response = await fetch(`${this.baseUrl}/training-programs/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch training program')
    }
    return response.json()
  }

  static async createTrainingProgram(data: CreateTrainingProgramInput) {
    const response = await fetch(`${this.baseUrl}/training-programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create training program')
    }
    return response.json()
  }

  static async updateTrainingProgram(id: string, data: Partial<TrainingProgram>) {
    const response = await fetch(`${this.baseUrl}/training-programs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update training program')
    }
    return response.json()
  }

  static async deleteTrainingProgram(id: string) {
    const response = await fetch(`${this.baseUrl}/training-programs/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete training program')
    }
    return response.json()
  }

  // Courses
  static async getCourses(programId: string) {
    const response = await fetch(`${this.baseUrl}/training-programs/${programId}/courses`)
    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }
    return response.json()
  }

  static async createCourse(programId: string, data: CreateCourseInput) {
    const response = await fetch(`${this.baseUrl}/training-programs/${programId}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create course')
    }
    return response.json()
  }

  // Modules
  static async getModules(courseId: string) {
    const response = await fetch(`${this.baseUrl}/courses/${courseId}/modules`)
    if (!response.ok) {
      throw new Error('Failed to fetch modules')
    }
    return response.json()
  }

  static async createModule(courseId: string, data: CreateModuleInput) {
    const response = await fetch(`${this.baseUrl}/courses/${courseId}/modules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create module')
    }
    return response.json()
  }

  static async updateModule(moduleId: string, data: Partial<Module>) {
    const response = await fetch(`${this.baseUrl}/modules/${moduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update module')
    }
    return response.json()
  }

  // Content search
  static async searchContent(query: string, filters?: {
    contentType?: string
    language?: string
    status?: string
    clientId?: string
  }) {
    const searchParams = new URLSearchParams({ q: query })
    if (filters?.contentType) searchParams.set('content_type', filters.contentType)
    if (filters?.language) searchParams.set('language', filters.language)
    if (filters?.status) searchParams.set('status', filters.status)
    if (filters?.clientId) searchParams.set('client_id', filters.clientId)

    const response = await fetch(`${this.baseUrl}/content/search?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to search content')
    }
    return response.json()
  }

  // Content management
  static async getContent(id: string) {
    const response = await fetch(`${this.baseUrl}/content/${id}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch content')
    }
    return response.json()
  }

  static async updateContent(id: string, data: any) {
    const response = await fetch(`${this.baseUrl}/content/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to update content')
    }
    return response.json()
  }

  static async deleteContent(id: string) {
    const response = await fetch(`${this.baseUrl}/content/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete content')
    }
    return response.json()
  }

  static async getContentMetadata(id: string) {
    const response = await fetch(`${this.baseUrl}/content/${id}/metadata`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch content metadata')
    }
    return response.json()
  }

  static async updateContentMetadata(id: string, metadata: any) {
    const response = await fetch(`${this.baseUrl}/content/${id}/metadata`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })
    if (!response.ok) {
      throw new Error('Failed to update content metadata')
    }
    return response.json()
  }

  static async createContent(data: any, userId: string) {
    const response = await fetch(`${this.baseUrl}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, author_id: userId }),
    })
    if (!response.ok) {
      throw new Error('Failed to create content')
    }
    return response.json()
  }
}