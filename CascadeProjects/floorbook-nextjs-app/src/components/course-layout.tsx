"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { ThemeToggle } from '@/components/theme-toggle';
import { Language, CourseId } from '@/lib/content';
import { cn } from '@/lib/utils';

export interface CourseContent {
  id: CourseId;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

// Extract module information from course content
function extractModules(content: string): { id: string; title: string }[] {
  const modules: { id: string; title: string }[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Look for h2 headings that contain "Module" - updated pattern
    const moduleMatch = line.match(/^## \*\*Module (\d+): (.+?)\*\*$/) || 
                       line.match(/^## Module (\d+): (.+)$/) ||
                       line.match(/^## \*\*Module (\d+)\*\*/) ||
                       line.match(/^## Module (\d+)/);
    
    if (moduleMatch) {
      const [, number, title] = moduleMatch;
      modules.push({
        id: `module-${number}`,
        title: title ? `Module ${number}: ${title}` : `Module ${number}`
      });
    }
  }
  
  return modules;
}

// Get content for a specific module
function getModuleContent(courseContent: string, moduleId: string): string {
  if (moduleId === 'overview') {
    // Return content up to first module
    const lines = courseContent.split('\n');
    const moduleStartIndex = lines.findIndex(line => 
      line.match(/^## \*\*Module \d+:/) || 
      line.match(/^## Module \d+:/) ||
      line.match(/^## \*\*Module \d+\*\*/) ||
      line.match(/^## Module \d+/)
    );
    if (moduleStartIndex === -1) return courseContent;
    return lines.slice(0, moduleStartIndex).join('\n');
  }

  const moduleNumber = moduleId.replace('module-', '');
  const lines = courseContent.split('\n');
  
  const startIndex = lines.findIndex(line => 
    line.match(new RegExp(`^## \\*\\*Module ${moduleNumber}:`)) ||
    line.match(new RegExp(`^## Module ${moduleNumber}:`)) ||
    line.match(new RegExp(`^## \\*\\*Module ${moduleNumber}\\*\\*`)) ||
    line.match(new RegExp(`^## Module ${moduleNumber}`))
  );
  
  if (startIndex === -1) return '';
  
  // Find the end of this module (start of next module or end of content)
  const endIndex = lines.findIndex((line, index) => 
    index > startIndex && (
      line.match(/^## \*\*Module \d+:/) ||
      line.match(/^## Module \d+:/) ||
      line.match(/^## \*\*Module \d+\*\*/) ||
      line.match(/^## Module \d+/)
    )
  );
  
  const moduleLines = endIndex === -1 
    ? lines.slice(startIndex) 
    : lines.slice(startIndex, endIndex);
    
  return moduleLines.join('\n');
}

interface CourseLayoutProps {
  courseContent: CourseContent;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onCourseChange: (courseId: CourseId) => void;
  currentCourse: CourseId;
}

const courseNavigation = [
  { id: 'series-overview' as CourseId, en: 'Series Overview', nl: 'Serie Overzicht' },
  { id: 'course1' as CourseId, en: 'Course 1: Foundations', nl: 'Cursus 1: Fundamenten' },
  { id: 'course2' as CourseId, en: 'Course 2: First Steps', nl: 'Cursus 2: Eerste Stappen' },
  { id: 'course3' as CourseId, en: 'Course 3: Next Level', nl: 'Cursus 3: Volgend Niveau' },
  { id: 'course4' as CourseId, en: 'Course 4: Mastery', nl: 'Cursus 4: Meesterschap' },
];

export function CourseLayout({ 
  courseContent, 
  language, 
  onLanguageChange, 
  onCourseChange,
  currentCourse 
}: CourseLayoutProps) {
  const [currentModule, setCurrentModule] = useState('overview');
  
  const modules = extractModules(courseContent.content);
  const displayContent = getModuleContent(courseContent.content, currentModule);
  
  const showModuleNavigation = currentCourse !== 'series-overview' && modules.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-serif">
                  {language === 'en' ? 'Floorbook Approach' : 'Floorbook Aanpak'}
                </h1>
                <p className="text-sm opacity-90">
                  {language === 'en' ? 'Professional Learning Series' : 'Professionele Leerserie'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onLanguageChange(language === 'en' ? 'nl' : 'en')}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  {language === 'en' ? '🇳🇱 Nederlands' : '🇬🇧 English'}
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Course Navigation */}
        <div className="bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 py-2">
            <div className="flex space-x-1 overflow-x-auto">
              {courseNavigation.map((course) => (
                <Button
                  key={course.id}
                  variant={currentCourse === course.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onCourseChange(course.id);
                    setCurrentModule('overview');
                  }}
                  className={cn(
                    "flex-shrink-0 rounded-t-lg rounded-b-none transition-all",
                    currentCourse === course.id
                      ? "bg-background text-foreground shadow-sm transform translate-y-0.5"
                      : "text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  {course[language]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Module Navigation */}
        {showModuleNavigation && (
          <div className="bg-muted/30 border-b">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={currentModule === 'overview' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentModule('overview')}
                  className="rounded-full"
                >
                  {language === 'en' ? 'Course Overview' : 'Cursus Overzicht'}
                </Button>
                {modules.map((module) => (
                  <Button
                    key={module.id}
                    variant={currentModule === module.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentModule(module.id)}
                    className="rounded-full"
                  >
                    {module.id.replace('module-', language === 'en' ? 'Module ' : 'Module ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <MarkdownRenderer 
              content={displayContent}
              className="max-w-none"
            />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="font-serif">
              {language === 'en' 
                ? 'Floorbook Approach Learning Series - Built with Next.js & ShadCN UI'
                : 'Floorbook Aanpak Leerserie - Gebouwd met Next.js & ShadCN UI'
              }
            </p>
            <p className="text-sm mt-2">
              {language === 'en'
                ? 'Professional learning for inquiry-based education'
                : 'Professioneel leren voor onderzoekgericht onderwijs'
              }
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
