// Course related types
export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar?: string
  thumbnail?: string
  level: string
  category: string
  learningPath?: string
  duration: string
  studentsEnrolled: number
  rating: number
  lessons: number
  price: number
  originalPrice?: number
  isEnrolled?: boolean
  progress?: number
  tags: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CourseFilters {
  searchQuery: string
  category: string
  level: string
  learningPath: string
  priceFilter: 'all' | 'free' | 'paid'
  sortBy: 'popular' | 'rating' | 'newest' | 'price-low' | 'price-high'
}

export interface CoursesApiResponse {
  courses: Course[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export const COURSE_CATEGORIES = [
  "All Categories",
  "Web Development",
  "Data Science",
  "Programming",
  "Mobile Development",
  "Design",
  "Business",
  "Marketing",
  "DevOps",
  "Machine Learning",
  "Artificial Intelligence",
  "Cybersecurity"
] as const

export const LEARNING_PATHS = [
  "All Paths",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Data Analytics",
  "Machine Learning",
  "DevOps",
  "UI/UX Design",
  "Mobile Development",
  "Game Development"
] as const

export const COURSE_LEVELS = [
  "All Levels",
  "beginner",
  "intermediate",
  "advanced"
] as const

export type ModuleType = 'VIDEO' | 'PDF' | 'QUIZ'

export interface CourseDTO {
  id: number
  title: string
  description: string
  instructorId: string
  instructorName?: string // Optional - for display purposes
  category: string
  createdAt: string // ISO date string
  moduleCount?: number
  enrollmentCount?: number
  completionPercentage?: number // For the current user if specified
  modules?: ModuleDTO[]
  userEnrolled?: boolean
}


export interface ModuleDTO {
  id: number
  title: string
  type: ModuleType
  coinsRequired: number
  contentUrl: string
  moduleOrder: number
  courseId: number
  courseName: string
  quizId: number
  completed: boolean
  progressPercentage: number
}

export interface QuizAnswerDTO {
  id: number
  answerText: string
  isCorrect: boolean
  questionId: number
}

export interface QuizDTO {
  id: number
  title: string
  moduleId: number
  moduleTitle: string
  questions: QuizQuestionDTO[]
}

export interface QuizQuestionDTO {
  id: number
  questionText: string
  quizId: number
  answers: QuizAnswerDTO[]
}

export interface QuizResultDTO {
  id: number
  userId: string
  quizId: number
  quizTitle: string
  score: number
  submittedAt: string

  moduleTitle: string
  courseId: number
  courseTitle: string
}

export type CourseCategory = typeof COURSE_CATEGORIES[number]
export type LearningPath = typeof LEARNING_PATHS[number]
export type CourseLevel = typeof COURSE_LEVELS[number]
