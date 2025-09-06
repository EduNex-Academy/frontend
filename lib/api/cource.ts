import { CourseDTO } from "@/types"
import { apiClient } from './config'
import { ApiResponse } from "./points"



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
}