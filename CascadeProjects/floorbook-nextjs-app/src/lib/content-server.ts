import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type Language = 'en' | 'nl';
export type CourseId = 'series-overview' | 'course1' | 'course2' | 'course3' | 'course4';

export interface CourseContent {
  id: CourseId;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

const contentDirectory = path.join(process.cwd(), 'content');

const courseConfig = {
  'series-overview': {
    en: { file: 'series-overview-en.md', title: 'Series Overview' },
    nl: { file: 'series-overview-nl.md', title: 'Serie Overzicht' }
  },
  'course1': {
    en: { file: 'course1-en.md', title: 'Course 1: Foundations of Inquiry-Based Learning' },
    nl: { file: 'course1-nl.md', title: 'Cursus 1: Grondslagen van onderzoekend leren' }
  },
  'course2': {
    en: { file: 'course2-en.md', title: 'Course 2: My First Floorbook & Talking Tub' },
    nl: { file: 'course2-nl.md', title: 'Cursus 2: Mijn eerste vloerboek & praatbad' }
  },
  'course3': {
    en: { file: 'course3-en.md', title: 'Course 3: Next Level Floorbooks & Talking Tubs' },
    nl: { file: 'course3-nl.md', title: 'Cursus 3: Floorbooks & Praatbadden op Hoger Niveau' }
  },
  'course4': {
    en: { file: 'course4-en.md', title: 'Course 4: Mastering the Floorbook Approach' },
    nl: { file: 'course4-nl.md', title: 'Cursus 4: Meesterschap in de Floorbook Aanpak' }
  }
};

export function getCourseContent(courseId: CourseId, language: Language): CourseContent | null {
  try {
    const config = courseConfig[courseId];
    if (!config || !config[language]) {
      return null;
    }

    const { file, title } = config[language];
    const filePath = path.join(contentDirectory, file);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContents);

    return {
      id: courseId,
      title,
      content,
      metadata: data
    };
  } catch (error) {
    console.error(`Error loading course content for ${courseId} (${language}):`, error);
    return null;
  }
}

export function getAllCourseIds(): CourseId[] {
  return Object.keys(courseConfig) as CourseId[];
}

export function getCourseTitle(courseId: CourseId, language: Language): string {
  const config = courseConfig[courseId];
  return config?.[language]?.title || courseId;
}
