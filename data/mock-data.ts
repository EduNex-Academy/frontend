import type { User, Subscription, Progress, Certificate, EmailNotification } from "@/types"
import type { Course } from "@/types/course"

export const mockUsers: User[] = [
  {
    id: "1",
    username: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    profilePictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    role: "student",
    isActive: true,
    createdAt: "2024-01-15",
    lastLoginAt: "2024-01-25",
    subscriptionStatus: "active",
    subscriptionExpiresAt: "2024-12-31",
  },
  {
    id: "2",
    username: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phoneNumber: "+1987654321",
    profilePictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    role: "instructor",
    isActive: true,
    createdAt: "2024-01-10",
    lastLoginAt: "2024-01-24",
    subscriptionStatus: "inactive",
    subscriptionExpiresAt: "2023-12-31",
  },
  {
    id: "3",
    username: "Mike Johnson",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike@example.com",
    phoneNumber: "+1122334455",
    profilePictureUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    role: "student",
    isActive: false,
    createdAt: "2024-01-20",
    lastLoginAt: "2024-01-25",
    subscriptionStatus: "active",
    subscriptionExpiresAt: "2024-07-15",
  },
]

export const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    userId: "1",
    plan: "premium",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    amount: 299,
    paymentMethod: "Credit Card",
  },
  {
    id: "2",
    userId: "3",
    plan: "basic",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    amount: 99,
    paymentMethod: "PayPal",
  },
]

export const mockProgress: Progress[] = [
  {
    id: "1",
    userId: "1",
    courseId: "1",
    completedLessons: 18,
    totalLessons: 24,
    percentage: 75,
    lastAccessed: "2024-01-25",
    timeSpent: 360,
  },
  {
    id: "2",
    userId: "3",
    courseId: "1",
    completedLessons: 12,
    totalLessons: 24,
    percentage: 50,
    lastAccessed: "2024-01-24",
    timeSpent: 240,
  },
]

export const mockCertificates: Certificate[] = [
  {
    id: "1",
    userId: "1",
    courseId: "2",
    issuedAt: "2024-01-20",
    certificateUrl: "/certificates/cert-1.pdf",
    status: "issued",
  },
]

export const mockEmailNotifications: EmailNotification[] = [
  {
    id: "1",
    type: "welcome",
    recipient: "john@example.com",
    subject: "Welcome to CourseHub!",
    status: "sent",
    sentAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    type: "renewal",
    recipient: "mike@example.com",
    subject: "Subscription Renewal Reminder",
    status: "pending",
    scheduledAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "3",
    type: "completion",
    recipient: "john@example.com",
    subject: "Congratulations! Course Completed",
    status: "sent",
    sentAt: "2024-01-20T15:30:00Z",
  },
]

export interface Quiz {
  id: string
  title: string
  courseId: string
  questions: number
  duration: number
  attempts: number
  maxScore: number
  userScore?: number
  status: "not-started" | "in-progress" | "completed"
  dueDate: string
  availableFrom: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  timeLimit: number // in minutes
}

export interface Assignment {
  id: string
  title: string
  courseId: string
  dueDate: string
  status: "pending" | "submitted" | "graded"
  score?: number
  maxScore: number
  availableFrom: string
  description: string
  submissionFormat: string
  estimatedHours: number
  difficulty: "Easy" | "Medium" | "Hard"
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Complete React Development Bootcamp",
    description: "Master React from basics to advanced concepts including hooks, context, and modern patterns.",
    instructor: "Sarah Johnson",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "40 hours",
    level: "Intermediate",
    category: "Web Development",
    learningPath: "Frontend Development",
    price: 99,
    rating: 4.8,
    studentsEnrolled: 1250,
    lessons: 45,
    tags: ["React", "JavaScript", "Frontend"],
  },
  {
    id: "2",
    title: "Python for Data Science",
    description: "Learn Python programming with focus on data analysis, visualization, and machine learning.",
    instructor: "Dr. Michael Chen",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "35 hours",
    level: "Beginner",
    category: "Data Science",
    learningPath: "Data Analytics",
    price: 79,
    rating: 4.9,
    studentsEnrolled: 2100,
    lessons: 38,
    tags: ["Python", "Data Science", "Machine Learning"],
  },
  {
    id: "3",
    title: "Advanced Kubernetes Administration",
    description: "Deep dive into Kubernetes cluster management, security, and best practices.",
    instructor: "Alex Rodriguez",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "50 hours",
    level: "Advanced",
    category: "DevOps",
    learningPath: "Cloud Infrastructure",
    price: 149,
    rating: 4.7,
    studentsEnrolled: 850,
    lessons: 52,
    tags: ["Kubernetes", "DevOps", "Cloud"],
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and user experience design.",
    instructor: "Emma Wilson",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "25 hours",
    level: "Beginner",
    category: "Design",
    learningPath: "Product Design",
    price: 69,
    rating: 4.6,
    studentsEnrolled: 1800,
    lessons: 28,
    tags: ["UI/UX", "Design", "Figma"],
  },
  {
    id: "5",
    title: "AWS Cloud Architect Certification",
    description: "Comprehensive preparation for AWS Solutions Architect certification.",
    instructor: "David Kumar",
    instructorAvatar: "/placeholder.svg?height=40&width=40",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "60 hours",
    level: "Advanced",
    category: "Cloud Computing",
    learningPath: "Cloud Infrastructure",
    price: 199,
    rating: 4.9,
    studentsEnrolled: 950,
    lessons: 65,
    tags: ["AWS", "Cloud", "Architecture"],
  },
]

export const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "React Fundamentals Quiz",
    courseId: "1",
    questions: 20,
    duration: 30,
    attempts: 3,
    maxScore: 100,
    userScore: 85,
    status: "completed",
    dueDate: "2024-02-10T23:59:59Z",
    availableFrom: "2024-01-15T00:00:00Z",
    description: "Test your understanding of React basics including components, props, and state management.",
    difficulty: "Medium",
    timeLimit: 30
  },
  {
    id: "2",
    title: "Python Basics Assessment",
    courseId: "2",
    questions: 15,
    duration: 25,
    attempts: 2,
    maxScore: 100,
    status: "in-progress",
    dueDate: "2024-02-12T23:59:59Z",
    availableFrom: "2024-01-20T00:00:00Z",
    description: "Assess your knowledge of Python fundamentals including syntax, data types, and basic programming concepts.",
    difficulty: "Easy",
    timeLimit: 25
  },
  {
    id: "3",
    title: "Advanced JavaScript Concepts",
    courseId: "3",
    questions: 25,
    duration: 45,
    attempts: 2,
    maxScore: 100,
    status: "not-started",
    dueDate: "2024-02-15T23:59:59Z",
    availableFrom: "2024-01-25T00:00:00Z",
    description: "Deep dive into advanced JavaScript topics including closures, prototypes, and async programming.",
    difficulty: "Hard",
    timeLimit: 45
  }
]

export const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Build a Todo App with React",
    courseId: "1",
    dueDate: "2024-02-15T23:59:59Z",
    status: "submitted",
    score: 92,
    maxScore: 100,
    availableFrom: "2024-01-20T00:00:00Z",
    description: "Create a fully functional todo application using React hooks, local storage, and modern CSS. The app should support adding, editing, deleting, and marking todos as complete.",
    submissionFormat: "GitHub Repository Link",
    estimatedHours: 12,
    difficulty: "Medium"
  },
  {
    id: "2",
    title: "Data Analysis Project",
    courseId: "2",
    dueDate: "2024-02-20T23:59:59Z",
    status: "pending",
    maxScore: 100,
    availableFrom: "2024-01-25T00:00:00Z",
    description: "Analyze a dataset of your choice using Python and pandas. Create visualizations and provide insights based on your analysis. Submit a Jupyter notebook with your code and findings.",
    submissionFormat: "Jupyter Notebook + PDF Report",
    estimatedHours: 8,
    difficulty: "Easy"
  },
  {
    id: "3",
    title: "Advanced JavaScript API Integration",
    courseId: "3",
    dueDate: "2024-02-25T23:59:59Z",
    status: "graded",
    score: 88,
    maxScore: 100,
    availableFrom: "2024-02-01T00:00:00Z",
    description: "Build a web application that integrates with external APIs using modern JavaScript. Implement error handling, loading states, and responsive design.",
    submissionFormat: "ZIP Archive with Source Code",
    estimatedHours: 15,
    difficulty: "Hard"
  },
  {
    id: "4",
    title: "Machine Learning Model Development",
    courseId: "4",
    dueDate: "2024-03-01T23:59:59Z",
    status: "pending",
    maxScore: 100,
    availableFrom: "2024-02-05T00:00:00Z",
    description: "Develop and train a machine learning model to solve a real-world problem. Document your process, evaluate model performance, and present your findings.",
    submissionFormat: "Python Files + Documentation",
    estimatedHours: 20,
    difficulty: "Hard"
  }
]

export const categories = [
  "All Categories",
  "Web Development",
  "Data Science",
  "DevOps",
  "Design",
  "Cloud Computing",
  "Mobile Development",
  "Marketing",
  "Business",
]

export const learningPaths = [
  "All Paths",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Data Analytics",
  "Machine Learning",
  "Cloud Infrastructure",
  "Mobile Development",
  "Product Design",
  "Digital Marketing",
]

