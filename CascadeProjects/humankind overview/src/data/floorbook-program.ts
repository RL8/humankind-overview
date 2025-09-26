import { TrainingProgram, Course, Module } from '@/types'

// Hardcoded Floorbook Approach program data
export const FLOORBOOK_PROGRAM: TrainingProgram = {
  id: 'floorbook-default',
  title: 'Floorbook Approach - Complete Learning Series',
  description: 'A transformative professional learning journey that will revolutionize how you understand children, learning, and your role as an educator. This comprehensive series takes you from foundational philosophy to masterful practice, ensuring each step builds meaningfully on the previous one.',
  status: 'published',
  client_id: 'system',
  created_by: 'system',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_default: true
}

export const FLOORBOOK_COURSES: Course[] = [
  {
    id: 'floorbook-course-1',
    programme_id: 'floorbook-default',
    title: 'Course 1: Foundations of Inquiry-Based Learning',
    description: 'Embark on a transformative journey that will fundamentally change how you see children and learning. This foundational course challenges traditional teaching methods and introduces you to the revolutionary Floorbook Approach.',
    order_index: 1,
    status: 'published',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'floorbook-course-2',
    programme_id: 'floorbook-default',
    title: 'Course 2: My First Floorbook & Talking Tub',
    description: 'Put your new understanding into action by creating your first documentation tools. You\'ll learn the practical skills of capturing authentic conversations and making children\'s thinking visible.',
    order_index: 2,
    status: 'published',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'floorbook-course-3',
    programme_id: 'floorbook-default',
    title: 'Course 3: Next Level Floorbooks & Talking Tubs',
    description: 'Elevate your skills with advanced techniques that transform good documentation into extraordinary learning experiences. Master the art of creating deliberate provocations and facilitating sustained inquiries.',
    order_index: 3,
    status: 'published',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'floorbook-course-4',
    programme_id: 'floorbook-default',
    title: 'Course 4: Mastering the Floorbook Approach',
    description: 'Step into expertise and leadership, learning to create transformative environments, orchestrate complex conversations, and use documentation as living curriculum.',
    order_index: 4,
    status: 'published',
    created_at: '2024-01-01T00:00:00Z'
  }
]

export const FLOORBOOK_MODULES: Module[] = [
  // Course 1 Modules
  {
    id: 'floorbook-module-1-1',
    course_id: 'floorbook-course-1',
    title: 'Module 1: Know Your Teaching Style',
    content: `
      <h2>Module Overview</h2>
      <p><strong>Core Focus:</strong> Cultivating the Learning Environment & Mindset</p>
      <p><strong>Learning Goal:</strong> Identify your current teaching approach and understand the difference between traditional and inquiry-based methods</p>
      
      <h3>Module Content Structure</h3>
      <ul>
        <li><strong>Introduction:</strong> Explore what makes inquiry-based learning different from traditional teaching methods</li>
        <li><strong>Theory:</strong> 12-minute video overview of teaching styles and their impact on children's learning</li>
        <li><strong>Interactive Exercise:</strong> Complete a teaching style self-assessment and reflect on your current practices</li>
        <li><strong>Practical:</strong> Observe a classroom interaction and identify traditional vs. inquiry-based moments</li>
        <li><strong>Child Voice:</strong> Audio scenarios of children's responses in different teaching environments</li>
        <li><strong>Practitioner Voice:</strong> Audio conversations with teachers discussing their journey from traditional to inquiry-based approaches</li>
      </ul>
      
      <h3>Key Concepts</h3>
      <ul>
        <li>Traditional vs. IBL teaching</li>
        <li>Power dynamics</li>
        <li>Child agency</li>
        <li>Active listening</li>
        <li>Environmental impact</li>
      </ul>
    `,
    order_index: 1,
    language: 'en',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'floorbook-module-1-2',
    course_id: 'floorbook-course-1',
    title: 'Module 2: Understanding Children as Researchers',
    content: `
      <h2>Module Overview</h2>
      <p><strong>Core Focus:</strong> Facilitating Inquiry & Dialogue</p>
      <p><strong>Learning Goal:</strong> Recognize children's natural curiosity and research abilities</p>
      
      <h3>Module Content Structure</h3>
      <ul>
        <li><strong>Introduction:</strong> Discover how children naturally explore and make sense of their world</li>
        <li><strong>Theory:</strong> 15-minute video exploration of children's natural learning processes with real classroom examples</li>
        <li><strong>Interactive Exercise:</strong> Practice identifying research behaviors in video clips of children at play</li>
        <li><strong>Practical:</strong> Spend time observing children and documenting their natural research moments</li>
        <li><strong>Child Voice:</strong> Audio scenarios of children explaining their thinking and discoveries during exploration</li>
        <li><strong>Practitioner Voice:</strong> Audio conversations with early childhood educators sharing "aha moments"</li>
      </ul>
      
      <h3>Key Concepts</h3>
      <ul>
        <li>Natural curiosity</li>
        <li>Child-led exploration</li>
        <li>Research behaviors</li>
        <li>Question formation</li>
        <li>Hypothesis testing</li>
        <li>Wonder</li>
      </ul>
    `,
    order_index: 2,
    language: 'en',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'floorbook-module-1-3',
    course_id: 'floorbook-course-1',
    title: 'Module 3: The Art of Listening and Questioning',
    content: `
      <h2>Module Overview</h2>
      <p><strong>Core Focus:</strong> Facilitating Inquiry & Dialogue</p>
      <p><strong>Learning Goal:</strong> Develop skills in active listening and open-ended questioning</p>
      
      <h3>Module Content Structure</h3>
      <ul>
        <li><strong>Introduction:</strong> Learn how listening more and talking less can transform learning experiences</li>
        <li><strong>Theory:</strong> 14-minute guide to active listening techniques and question types that promote thinking</li>
        <li><strong>Interactive Exercise:</strong> Practice different questioning techniques using scenario-based activities</li>
        <li><strong>Practical:</strong> Record yourself in conversation with children and analyze your listening vs. talking ratio</li>
        <li><strong>Child Voice:</strong> Audio scenarios of how children respond differently to closed vs. open questions</li>
        <li><strong>Practitioner Voice:</strong> Audio conversations with teachers sharing their experiences learning to "bite their tongue"</li>
      </ul>
      
      <h3>Key Concepts</h3>
      <ul>
        <li>Active listening</li>
        <li>Open-ended questions</li>
        <li>Wait time</li>
        <li>Follow-up questions</li>
        <li>Reflective responses</li>
      </ul>
    `,
    order_index: 3,
    language: 'en',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'floorbook-module-1-4',
    course_id: 'floorbook-course-1',
    title: 'Module 4: Creating Environments for Wonder',
    content: `
      <h2>Module Overview</h2>
      <p><strong>Core Focus:</strong> Cultivating the Learning Environment & Mindset</p>
      <p><strong>Learning Goal:</strong> Design physical and emotional environments that invite exploration and wonder</p>
      
      <h3>Module Content Structure</h3>
      <ul>
        <li><strong>Introduction:</strong> Understand how environment acts as the "third teacher" in inquiry-based learning</li>
        <li><strong>Theory:</strong> 13-minute tour of inquiry-rich environments with practical setup tips</li>
        <li><strong>Interactive Exercise:</strong> Design a learning provocation using everyday materials</li>
        <li><strong>Practical:</strong> Transform one area of your space to be more inquiry-friendly and document the changes</li>
        <li><strong>Child Voice:</strong> Audio scenarios of children describing what makes them want to explore and investigate</li>
        <li><strong>Practitioner Voice:</strong> Audio conversations with educators discussing simple changes that made big differences</li>
      </ul>
      
      <h3>Key Concepts</h3>
      <ul>
        <li>Third teacher</li>
        <li>Provocations</li>
        <li>Accessible materials</li>
        <li>Flexible spaces</li>
        <li>Natural elements</li>
        <li>Documentation displays</li>
      </ul>
    `,
    order_index: 4,
    language: 'en',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Course 2 Modules (simplified for brevity)
  {
    id: 'floorbook-module-2-1',
    course_id: 'floorbook-course-2',
    title: 'Module 1: Introduction to Floorbooks',
    content: `
      <h2>Getting Started with Floorbooks</h2>
      <p>Learn the fundamentals of creating and maintaining Floorbooks as documentation tools that capture children's thinking and learning processes.</p>
      
      <h3>What You'll Learn</h3>
      <ul>
        <li>What is a Floorbook and why it matters</li>
        <li>Setting up your first Floorbook</li>
        <li>Capturing authentic conversations</li>
        <li>Making children's thinking visible</li>
      </ul>
    `,
    order_index: 1,
    language: 'en',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'floorbook-module-2-2',
    course_id: 'floorbook-course-2',
    title: 'Module 2: Creating Your First Talking Tub',
    content: `
      <h2>Building Your Talking Tub</h2>
      <p>Discover how to create engaging Talking Tubs that spark curiosity and facilitate meaningful discussions with children.</p>
      
      <h3>Key Elements</h3>
      <ul>
        <li>Selecting appropriate materials</li>
        <li>Creating visual interest</li>
        <li>Facilitating group discussions</li>
        <li>Documenting conversations</li>
      </ul>
    `,
    order_index: 2,
    language: 'en',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Helper function to get all modules for a specific course
export const getModulesForCourse = (courseId: string): Module[] => {
  return FLOORBOOK_MODULES.filter(module => module.course_id === courseId)
}

// Helper function to get all courses for the Floorbook program
export const getFloorbookCourses = (): Course[] => {
  return FLOORBOOK_COURSES
}

// Helper function to get the complete Floorbook program with courses and modules
export const getCompleteFloorbookProgram = () => {
  return {
    programme: FLOORBOOK_PROGRAM,
    courses: FLOORBOOK_COURSES.map(course => ({
      ...course,
      modules: getModulesForCourse(course.id)
    }))
  }
}
