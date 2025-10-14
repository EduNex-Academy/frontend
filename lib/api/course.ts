import { CourseDTO, ModuleDTO, QuizDTO, QuizQuestionDTO, QuizAnswerDTO } from "@/types"
import { apiClient } from './config'

// Helper function to ensure course has default instructor name
const ensureDefaultInstructorName = (course: CourseDTO): CourseDTO => {
  return {
    ...course,
    instructorName: course.instructorName || 'Andrew Ng'
  }
}

// Helper function to process course arrays
const processCoursesArray = (courses: CourseDTO[]): CourseDTO[] => {
  return courses.map(ensureDefaultInstructorName)
}

export const courseApi = {
  /**
   * Get all courses
   */
  getAllCourses: async (query: string, status?: 'PUBLISHED' | 'DRAFT'): Promise<CourseDTO[]> => {
    try {
      // Log the exact request parameters for debugging
      console.log('Requesting courses with parameters:', { query, status });
      
      const response = await apiClient.get<CourseDTO[]>('/courses/search', {
        params: { query, status }
      })

      console.log('Fetched courses:', response)
      console.log('Response data:', response.status, response.data)

      if (response.status !== 200) {
        throw new Error('Failed to fetch courses')
      }
      
      return processCoursesArray(response.data)
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
      
      return ensureDefaultInstructorName(response.data)
    } catch (error: any) {
      console.error('Failed to create course:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create course'
      throw new Error(message)
    }
  },

  /**
   * Get course by ID
   */
  getCourseById: async (id: number, includeModules: boolean = false, userRole?: 'STUDENT' | 'INSTRUCTOR'): Promise<CourseDTO> => {
    try {
      // If user is a student, only fetch published courses
      const status = userRole === 'STUDENT' ? 'PUBLISHED' : undefined
      
      const response = await apiClient.get<CourseDTO>(`/courses/${id}`, {
        params: { includeModules, status }
      })
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch course')
      }
      
      return ensureDefaultInstructorName(response.data)
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
      
      return ensureDefaultInstructorName(response.data)
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
   * Upload thumbnail image for a course
   */
  uploadCourseThumbnail: async (id: number, file: File): Promise<CourseDTO> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post<CourseDTO>(
        `/courses/${id}/thumbnail`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      
      if (response.status !== 200) {
        throw new Error('Failed to upload course thumbnail')
      }
      
      return ensureDefaultInstructorName(response.data)
    } catch (error: any) {
      console.error(`Failed to upload thumbnail for course with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to upload course thumbnail'
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
      
      return processCoursesArray(response.data)
    } catch (error: any) {
      console.error('Failed to fetch instructor courses:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch instructor courses'
      throw new Error(message)
    }
  },

  /**
   * Publish a course (change status from DRAFT to PUBLISHED)
   */
  publishCourse: async (id: number): Promise<CourseDTO> => {
    try {
      const response = await apiClient.post<CourseDTO>(`/courses/${id}/publish`)
      
      if (response.status !== 200) {
        throw new Error('Failed to publish course')
      }
      
      return ensureDefaultInstructorName(response.data)
    } catch (error: any) {
      console.error(`Failed to publish course with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to publish course'
      throw new Error(message)
    }
  },

  /**
   * Get enrolled courses for current user
   */
  getEnrolledCourses: async (status?: 'PUBLISHED' | 'DRAFT'): Promise<CourseDTO[]> => {
    try {
      const response = await apiClient.get<CourseDTO[]>('/courses/enrolled', {
        params: { status }
      })
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch enrolled courses')
      }
      
      return processCoursesArray(response.data)
    } catch (error: any) {
      console.error('Failed to fetch enrolled courses:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch enrolled courses'
      throw new Error(message)
    }
  },

  /**
   * Get courses by category
   */
  getCoursesByCategory: async (category: string, status?: 'PUBLISHED' | 'DRAFT'): Promise<CourseDTO[]> => {
    try {
      const response = await apiClient.get<CourseDTO[]>(`/courses/category/${category}`, {
        params: { status }
      })
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch courses by category')
      }
      
      return processCoursesArray(response.data)
    } catch (error: any) {
      console.error(`Failed to fetch courses by category ${category}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch courses by category'
      throw new Error(message)
    }
  }
}