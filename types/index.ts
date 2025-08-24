// Re-export course types
export * from './course'

// Re-export subscription types  
export * from '../lib/api/subscription'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  profilePictureUrl?: string
  role: string
  bio?: string
  location?: string
  dateOfBirth?: string
  isActive: boolean
  emailVerified: boolean
  subscriptionStatus: string
  subscriptionExpiresAt: string
  createdAt: string
  lastLoginAt?: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: string
}

export interface AuthCallbackRequest {
  code: string
  userRole: string
  state?: string
}

export interface LoginUrls {
  regularLogin: string
  googleLogin: string
  logoutUrl: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface ProfileUpdateRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string
  location?: string
  dateOfBirth?: string
}

// Re-export course types
export * from './course'

export interface Subscription {
  id: string
  userId: string
  plan: "basic" | "premium" | "pro"
  status: "active" | "cancelled" | "expired"
  startDate: string
  endDate: string
  amount: number
  paymentMethod: string
}

export interface Progress {
  id: string
  userId: string
  courseId: string
  completedLessons: number
  totalLessons: number
  percentage: number
  lastAccessed: string
  timeSpent: number // in minutes
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  issuedAt: string
  certificateUrl: string
  status: "issued" | "revoked"
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  questions: number
  passingScore: number
  attempts: number
  timeLimit: number // in minutes
  status: "active" | "inactive"
}

export interface EmailNotification {
  id: string
  type: "welcome" | "renewal" | "completion" | "announcement"
  recipient: string
  subject: string
  status: "sent" | "pending" | "failed"
  sentAt?: string
  scheduledAt?: string
}
