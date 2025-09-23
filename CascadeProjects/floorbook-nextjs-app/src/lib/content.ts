// Client-side content types and utilities (no fs operations)

export type Language = 'en' | 'nl';
export type CourseId = 'series-overview' | 'course1' | 'course2' | 'course3' | 'course4';

export interface CourseContent {
  id: CourseId;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

// Course configuration for client-side use
export const courseNavigation = [
  { id: 'series-overview' as CourseId, en: 'Series Overview', nl: 'Serie Overzicht' },
  { id: 'course1' as CourseId, en: 'Course 1: Foundations', nl: 'Cursus 1: Fundamenten' },
  { id: 'course2' as CourseId, en: 'Course 2: First Steps', nl: 'Cursus 2: Eerste Stappen' },
  { id: 'course3' as CourseId, en: 'Course 3: Next Level', nl: 'Cursus 3: Volgend Niveau' },
  { id: 'course4' as CourseId, en: 'Course 4: Mastery', nl: 'Cursus 4: Meesterschap' },
];

export function getAllCourseIds(): CourseId[] {
  return courseNavigation.map(course => course.id);
}

export function getCourseTitle(courseId: CourseId, language: Language): string {
  const course = courseNavigation.find(c => c.id === courseId);
  return course ? course[language] : courseId;
}