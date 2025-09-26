import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

// Training Program Types
export interface TrainingProgram {
  id: string
  name: string
  description: string
  version: string
  status: string
  created_date: string
  last_updated: string
  author: string
  languages: string[]
  courses: Course[]
  type: 'base' | 'client'
  client_id?: string
}

export interface Course {
  id: string
  title: string
  level: string
  modules: number
  content_files: ContentFile[]
}

export interface ContentFile {
  id: string
  filename: string
  file_path: string
  language: string
  content_type: 'markdown' | 'pdf' | 'image' | 'other'
  size: number
  last_modified: string
}

export interface I18nVariables {
  [language: string]: {
    [key: string]: string
  }
}

export interface ClientPlaceholders {
  [clientId: string]: {
    [key: string]: string
  }
}

export interface TrainingProgramMetadata {
  training_program_info: any
  i18n_variables: I18nVariables
  client_placeholders: ClientPlaceholders
}

export class TrainingProgramService {
  private static basePath = path.join(process.cwd(), 'src/app/api/content/training-programs')
  
  // Get all training programs
  static async getAllTrainingPrograms(): Promise<TrainingProgram[]> {
    const programs: TrainingProgram[] = []
    
    try {
      // Get base programs
      const basePath = path.join(this.basePath, 'base')
      if (fs.existsSync(basePath)) {
        const basePrograms = await this.getProgramsFromDirectory(basePath, 'base')
        programs.push(...basePrograms)
      }
      
      // Get client programs
      const clientsPath = path.join(this.basePath, 'clients')
      if (fs.existsSync(clientsPath)) {
        const clientDirs = fs.readdirSync(clientsPath)
        for (const clientDir of clientDirs) {
          const clientPath = path.join(clientsPath, clientDir)
          const clientPrograms = await this.getProgramsFromDirectory(clientPath, 'client', clientDir)
          programs.push(...clientPrograms)
        }
      }
    } catch (error) {
      console.error('Error getting training programs:', error)
    }
    
    return programs
  }
  
  // Get programs from a specific directory
  private static async getProgramsFromDirectory(
    dirPath: string, 
    type: 'base' | 'client', 
    clientId?: string
  ): Promise<TrainingProgram[]> {
    const programs: TrainingProgram[] = []
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const programPath = path.join(dirPath, entry.name)
          const metadataPath = path.join(programPath, 'metadata', 'training-program-info.yaml')
          
          if (fs.existsSync(metadataPath)) {
            const metadata = yaml.load(fs.readFileSync(metadataPath, 'utf8')) as any
            const contentFiles = await this.getContentFiles(programPath)
            
            const program: TrainingProgram = {
              id: `${type}-${entry.name}`,
              name: metadata.name || entry.name,
              description: metadata.description || '',
              version: metadata.version || '1.0.0',
              status: metadata.status || 'active',
              created_date: metadata.created_date || new Date().toISOString(),
              last_updated: metadata.last_updated || new Date().toISOString(),
              author: metadata.author || 'Unknown',
              languages: metadata.languages || ['en'],
              courses: metadata.courses || [],
              type,
              client_id: clientId
            }
            
            programs.push(program)
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error)
    }
    
    return programs
  }
  
  // Get content files for a program
  private static async getContentFiles(programPath: string): Promise<ContentFile[]> {
    const contentFiles: ContentFile[] = []
    
    try {
      const contentGridsPath = path.join(programPath, 'content-grids')
      if (fs.existsSync(contentGridsPath)) {
        const files = await this.getFilesRecursively(contentGridsPath)
        contentFiles.push(...files)
      }
      
      const sourceDocsPath = path.join(programPath, 'source-documents')
      if (fs.existsSync(sourceDocsPath)) {
        const files = await this.getFilesRecursively(sourceDocsPath)
        contentFiles.push(...files)
      }
    } catch (error) {
      console.error(`Error getting content files for ${programPath}:`, error)
    }
    
    return contentFiles
  }
  
  // Get files recursively from a directory
  private static async getFilesRecursively(dirPath: string): Promise<ContentFile[]> {
    const files: ContentFile[] = []
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          const subFiles = await this.getFilesRecursively(fullPath)
          files.push(...subFiles)
        } else {
          const stats = fs.statSync(fullPath)
          const relativePath = path.relative(this.basePath, fullPath)
          
          // Determine content type
          let contentType: 'markdown' | 'pdf' | 'image' | 'other' = 'other'
          const ext = path.extname(entry.name).toLowerCase()
          if (ext === '.md') contentType = 'markdown'
          else if (ext === '.pdf') contentType = 'pdf'
          else if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) contentType = 'image'
          
          files.push({
            id: relativePath.replace(/\\/g, '/'),
            filename: entry.name,
            file_path: relativePath.replace(/\\/g, '/'),
            language: this.extractLanguageFromPath(fullPath),
            content_type: contentType,
            size: stats.size,
            last_modified: stats.mtime.toISOString()
          })
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error)
    }
    
    return files
  }
  
  // Extract language from file path
  private static extractLanguageFromPath(filePath: string): string {
    const pathParts = filePath.split(path.sep)
    const contentGridsIndex = pathParts.findIndex(part => part === 'content-grids')
    
    if (contentGridsIndex !== -1 && contentGridsIndex + 1 < pathParts.length) {
      return pathParts[contentGridsIndex + 1]
    }
    
    return 'en' // Default to English
  }
  
  // Get a specific training program
  static async getTrainingProgram(programId: string): Promise<TrainingProgram | null> {
    const programs = await this.getAllTrainingPrograms()
    return programs.find(p => p.id === programId) || null
  }
  
  // Get content file content
  static async getContentFileContent(filePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.basePath, filePath)
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8')
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error)
    }
    
    return null
  }
  
  // Get i18n variables for a program
  static async getI18nVariables(programId: string): Promise<I18nVariables | null> {
    try {
      const program = await this.getTrainingProgram(programId)
      if (!program) return null
      
      const metadataPath = path.join(
        this.basePath, 
        program.type === 'base' ? 'base' : `clients/${program.client_id}`,
        program.name.toLowerCase().replace(/\s+/g, '-'),
        'metadata',
        'i18n-variables.yaml'
      )
      
      if (fs.existsSync(metadataPath)) {
        return yaml.load(fs.readFileSync(metadataPath, 'utf8')) as I18nVariables
      }
    } catch (error) {
      console.error(`Error getting i18n variables for ${programId}:`, error)
    }
    
    return null
  }
  
  // Get client placeholders for a program
  static async getClientPlaceholders(programId: string): Promise<ClientPlaceholders | null> {
    try {
      const program = await this.getTrainingProgram(programId)
      if (!program) return null
      
      const metadataPath = path.join(
        this.basePath, 
        program.type === 'base' ? 'base' : `clients/${program.client_id}`,
        program.name.toLowerCase().replace(/\s+/g, '-'),
        'metadata',
        'client-placeholders.yaml'
      )
      
      if (fs.existsSync(metadataPath)) {
        return yaml.load(fs.readFileSync(metadataPath, 'utf8')) as ClientPlaceholders
      }
    } catch (error) {
      console.error(`Error getting client placeholders for ${programId}:`, error)
    }
    
    return null
  }
  
  // Process content with i18n variables and client placeholders
  static async processContent(
    content: string, 
    programId: string, 
    language: string = 'en'
  ): Promise<string> {
    try {
      const i18nVars = await this.getI18nVariables(programId)
      const clientPlaceholders = await this.getClientPlaceholders(programId)
      
      let processedContent = content
      
      // Apply i18n variables
      if (i18nVars && i18nVars[language]) {
        for (const [key, value] of Object.entries(i18nVars[language])) {
          const placeholder = `{{${key}}}`
          processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value)
        }
      }
      
      // Apply client placeholders
      if (clientPlaceholders) {
        const program = await this.getTrainingProgram(programId)
        if (program && program.client_id && clientPlaceholders[program.client_id]) {
          for (const [key, value] of Object.entries(clientPlaceholders[program.client_id])) {
            const placeholder = `{{${key}}}`
            processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value)
          }
        }
      }
      
      return processedContent
    } catch (error) {
      console.error(`Error processing content for ${programId}:`, error)
      return content
    }
  }
  
  // Get all available languages for a program
  static async getAvailableLanguages(programId: string): Promise<string[]> {
    const program = await this.getTrainingProgram(programId)
    return program?.languages || ['en']
  }
}
