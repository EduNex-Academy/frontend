import { CourseDTO, ModuleDTO, QuizDTO, QuizQuestionDTO, QuizAnswerDTO } from "@/types"
import { apiClient } from './config'

export const courseApi = {
  /**
   * Get all courses
   */
  getAllCourses: async (query: string): Promise<CourseDTO[]> => {
    try {
      const response = await apiClient.get<CourseDTO[]>('/courses/search', {
        params: { query }
      })

      console.log('Fetched courses:', response)
      console.log('Response data:', response.status, response.data)

      if (response.status !== 200) {
        throw new Error('Failed to fetch courses')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch courses:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch courses'
      throw new Error(message)
    }
  },

  /**
   * Create a new course
   */
  createCourse: async (courseData: Partial<CourseDTO>): Promise<CourseDTO> => {
    try {
      const response = await apiClient.post<CourseDTO>('/courses', courseData)

      if (response.status !== 201) {
        throw new Error('Failed to create course')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to create course:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create course'
      throw new Error(message)
    }
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: number, includeModules: boolean = false): Promise<CourseDTO> => {
    try {
      const response = await apiClient.get<CourseDTO>(`/courses/${id}`, {
        params: { includeModules }
      })
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch course')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch course with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch course'
      throw new Error(message)
    }
  },

  /**
   * Update a course
   */
  updateCourse: async (id: number, courseData: Partial<CourseDTO>): Promise<CourseDTO> => {
    try {
      const response = await apiClient.put<CourseDTO>(`/courses/${id}`, courseData)
      
      if (response.status !== 200) {
        throw new Error('Failed to update course')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to update course with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to update course'
      throw new Error(message)
    }
  },

  /**
   * Delete a course
   */
  deleteCourse: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/courses/${id}`)
      
      if (response.status !== 204) {
        throw new Error('Failed to delete course')
      }
    } catch (error: any) {
      console.error(`Failed to delete course with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to delete course'
      throw new Error(message)
    }
  },

  /**
   * Get courses by instructor ID
   */
  getCoursesByInstructorId: async (instructorId: string): Promise<CourseDTO[]> => {
    try {
      const response = await apiClient.get<CourseDTO[]>(`/courses/instructor/${instructorId}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch instructor courses')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch instructor courses:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch instructor courses'
      throw new Error(message)
    }
  }
}