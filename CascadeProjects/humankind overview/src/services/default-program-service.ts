import { TrainingProgramme, Course, Module } from '@/types'
import { FLOORBOOK_PROGRAM, FLOORBOOK_COURSES, FLOORBOOK_MODULES, getCompleteFloorbookProgram } from '@/data/floorbook-program'
import { ContentService } from './content-service'

export class DefaultProgramService {
  /**
   * Get the default Floorbook program that should appear for all users
   */
  static getDefaultProgram(): TrainingProgramme {
    return FLOORBOOK_PROGRAM
  }

  /**
   * Get all courses for the default program
   */
  static getDefaultCourses(): Course[] {
    return FLOORBOOK_COURSES
  }

  /**
   * Get modules for a specific course in the default program
   */
  static getDefaultModules(courseId: string): Module[] {
    return FLOORBOOK_MODULES.filter(module => module.course_id === courseId)
  }

  /**
   * Get the complete default program with all courses and modules
   */
  static getCompleteDefaultProgram() {
    return getCompleteFloorbookProgram()
  }

  /**
   * Check if a program is the default program
   */
  static isDefaultProgram(programId: string): boolean {
    return programId === FLOORBOOK_PROGRAM.id
  }

  /**
   * Check if a course belongs to the default program
   */
  static isDefaultCourse(courseId: string): boolean {
    return FLOORBOOK_COURSES.some(course => course.id === courseId)
  }

  /**
   * Check if a module belongs to the default program
   */
  static isDefaultModule(moduleId: string): boolean {
    return FLOORBOOK_MODULES.some(module => module.id === moduleId)
  }

  /**
   * Create a personal copy of the default program for a user
   */
  static async createPersonalCopy(userId: string, userRole: string): Promise<TrainingProgramme> {
    // Check if user has permission to create copies
    if (!this.canCreateCopy(userRole)) {
      throw new Error('You do not have permission to create a copy of this program')
    }

    const defaultProgram = this.getCompleteDefaultProgram()
    
    // Create the main program
    const personalProgram = await ContentService.createTrainingProgramme({
      title: `${defaultProgram.programme.title} - My Copy`,
      description: defaultProgram.programme.description,
      client_id: userId,
      created_by: userId
    })

    // Create courses and modules
    for (const course of defaultProgram.courses) {
      const personalCourse = await ContentService.createCourse(personalProgram.id, {
        programme_id: personalProgram.id,
        title: course.title,
        description: course.description,
        order_index: course.order_index
      })

      // Create modules for this course
      for (const module of course.modules) {
        await ContentService.createModule(personalCourse.id, {
          course_id: personalCourse.id,
          title: module.title,
          content: module.content,
          order_index: module.order_index,
          language: module.language
        })
      }
    }

    return personalProgram
  }

  /**
   * Check if user can create a copy of the default program
   */
  static canCreateCopy(userRole: string): boolean {
    return ['composer', 'principal', 'admin'].includes(userRole)
  }

  /**
   * Check if user can edit the original default program
   */
  static canEditOriginal(userRole: string): boolean {
    return userRole === 'admin'
  }

  /**
   * Get user's programs including the default program
   */
  static async getUserPrograms(userId: string, userRole: string) {
    // Get user's own programs
    const userPrograms = await ContentService.getTrainingProgrammes({
      clientId: userRole === 'client' ? userId : undefined
    })

    // Add the default program at the beginning
    const defaultProgram = this.getDefaultProgram()
    
    return {
      data: [defaultProgram, ...(userPrograms.data || [])],
      pagination: userPrograms.pagination
    }
  }

  /**
   * Get courses for a program (including default program courses)
   */
  static async getProgramCourses(programId: string) {
    if (this.isDefaultProgram(programId)) {
      return this.getDefaultCourses()
    } else {
      return ContentService.getCourses(programId)
    }
  }

  /**
   * Get modules for a course (including default program modules)
   */
  static async getCourseModules(courseId: string) {
    if (this.isDefaultCourse(courseId)) {
      return this.getDefaultModules(courseId)
    } else {
      return ContentService.getModules(courseId)
    }
  }
}
