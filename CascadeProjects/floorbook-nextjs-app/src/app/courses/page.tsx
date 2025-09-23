"use client";

import { useState, useEffect, Suspense } from 'react';
import { CourseLayout, CourseContent } from '@/components/course-layout';
import { Language, CourseId } from '@/lib/content';
import { useSearchParams, useRouter } from 'next/navigation';

function CoursesContent() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentCourse, setCurrentCourse] = useState<CourseId>('series-overview');
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize from URL parameters
  useEffect(() => {
    const urlLang = searchParams.get('lang') as Language;
    const urlCourse = searchParams.get('course') as CourseId;
    
    if (urlLang && (urlLang === 'en' || urlLang === 'nl')) {
      setLanguage(urlLang);
    }
    
    if (urlCourse) {
      setCurrentCourse(urlCourse);
    }
    
    // Load from localStorage
    const savedLang = localStorage.getItem('preferred-language') as Language;
    if (savedLang && !urlLang) {
      setLanguage(savedLang);
    }
  }, [searchParams]);

  // Load course content
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/content/${currentCourse}?lang=${language}`);
        if (response.ok) {
          const content = await response.json();
          setCourseContent(content);
        } else {
          console.error('Failed to load content');
          setCourseContent(null);
        }
      } catch (error) {
        console.error('Error loading course content:', error);
        setCourseContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [currentCourse, language]);

  // Update URL and localStorage when language changes
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
    
    const params = new URLSearchParams(searchParams);
    params.set('lang', newLanguage);
    router.push(`/courses?${params.toString()}`);
  };

  // Update URL when course changes
  const handleCourseChange = (newCourse: CourseId) => {
    setCurrentCourse(newCourse);
    
    const params = new URLSearchParams(searchParams);
    params.set('course', newCourse);
    router.push(`/courses?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading content...' : 'Inhoud laden...'}
          </p>
        </div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {language === 'en' ? 'Content Not Available' : 'Inhoud Niet Beschikbaar'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Sorry, this content is not yet available.' 
              : 'Sorry, deze inhoud is nog niet beschikbaar.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <CourseLayout
      courseContent={courseContent}
      language={language}
      onLanguageChange={handleLanguageChange}
      onCourseChange={handleCourseChange}
      currentCourse={currentCourse}
    />
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
