import { apiClient } from './config'

export interface EnrollmentDTO {
  id: number
  userId: string
  userName?: string // Optional - for display purposes
  courseId: number
  courseTitle?: string
  enrolledAt: string
  completionPercentage: number
}

export const enrollmentApi = {
  /**
   * Get all enrollments
   */
  getAllEnrollments: async (): Promise<EnrollmentDTO[]> => {
    try {
      const response = await apiClient.get<EnrollmentDTO[]>('/enrollments')
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch enrollments')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch enrollments:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch enrollments'
      throw new Error(message)
    }
  },
  
  /**
   * Get enrollment by ID
   */
  getEnrollmentById: async (id: number): Promise<EnrollmentDTO> => {
    try {
      const response = await apiClient.get<EnrollmentDTO>(`/enrollments/${id}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch enrollment')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch enrollment with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch enrollment'
      throw new Error(message)
    }
  },
  
  /**
   * Get enrollments for the current user
   */
  getUserEnrollments: async (): Promise<EnrollmentDTO[]> => {
    try {
      const response = await apiClient.get<EnrollmentDTO[]>('/enrollments/user')
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch user enrollments')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch user enrollments:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch user enrollments'
      throw new Error(message)
    }
  },
  
  /**
   * Get enrollments for a specific course
   */
  getCourseEnrollments: async (courseId: number): Promise<EnrollmentDTO[]> => {
    try {
      const response = await apiClient.get<EnrollmentDTO[]>(`/enrollments/course/${courseId}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch course enrollments')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch enrollments for course with ID ${courseId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch course enrollments'
      throw new Error(message)
    }
  },
  
  /**
   * Check if the current user is enrolled in a course
   */
  checkEnrollment: async (courseId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>('/enrollments/check', {
        params: { courseId }
      })
      
      if (response.status !== 200) {
        throw new Error('Failed to check enrollment')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to check enrollment for course with ID ${courseId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to check enrollment'
      throw new Error(message)
    }
  },
  
  /**
   * Create a new enrollment (enroll user in a course)
   * Uses the new API endpoint that extracts the userId from the JWT token
   */
  enrollInCourse: async (courseId: number): Promise<EnrollmentDTO> => {
    try {
      // Use the new endpoint that extracts userId from JWT token
      const response = await apiClient.post<EnrollmentDTO>(`/enrollments/course/${courseId}`)
      
      if (response.status !== 201) {
        throw new Error('Failed to enroll in course')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to enroll in course with ID ${courseId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to enroll in course'
      throw new Error(message)
    }
  },
  
  /**
   * Delete an enrollment (unenroll user from a course)
   */
  unenrollFromCourse: async (courseId: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/enrollments/course/${courseId}`)
      
      if (response.status !== 204) {
        throw new Error('Failed to unenroll from course')
      }
    } catch (error: any) {
      console.error(`Failed to unenroll from course with ID ${courseId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to unenroll from course'
      throw new Error(message)
    }
  }
}