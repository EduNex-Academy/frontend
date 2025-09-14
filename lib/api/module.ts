import { ModuleDTO } from "@/types"
import { apiClient } from './config'

export const moduleApi = {
  /**
   * Get all modules
   */
  getAllModules: async (): Promise<ModuleDTO[]> => {
    try {
      const response = await apiClient.get<ModuleDTO[]>('/modules')
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch modules')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch modules:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch modules'
      throw new Error(message)
    }
  },

  /**
   * Create a new module
   */
  createModule: async (moduleData: Partial<ModuleDTO>): Promise<ModuleDTO> => {
    try {
      const response = await apiClient.post<ModuleDTO>('/modules', moduleData)
      
      if (response.status !== 201) {
        throw new Error('Failed to create module')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Failed to create module:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create module'
      throw new Error(message)
    }
  },

  /**
   * Get module by ID
   */
  getModuleById: async (id: number): Promise<ModuleDTO> => {
    try {
      const response = await apiClient.get<ModuleDTO>(`/modules/${id}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch module')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch module with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch module'
      throw new Error(message)
    }
  },

  /**
   * Get modules by course ID
   */
  getModulesByCourseId: async (courseId: number): Promise<ModuleDTO[]> => {
    try {
      const response = await apiClient.get<ModuleDTO[]>(`/modules/course/${courseId}`)
      
      if (response.status !== 200) {
        throw new Error('Failed to fetch course modules')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch modules for course with ID ${courseId}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch course modules'
      throw new Error(message)
    }
  },

  /**
   * Update a module
   */
  updateModule: async (id: number, moduleData: Partial<ModuleDTO>): Promise<ModuleDTO> => {
    try {
      const response = await apiClient.put<ModuleDTO>(`/modules/${id}`, moduleData)
      
      if (response.status !== 200) {
        throw new Error('Failed to update module')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to update module with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to update module'
      throw new Error(message)
    }
  },

  /**
   * Delete a module
   */
  deleteModule: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/modules/${id}`)
      
      if (response.status !== 204) {
        throw new Error('Failed to delete module')
      }
    } catch (error: any) {
      console.error(`Failed to delete module with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to delete module'
      throw new Error(message)
    }
  },

  /**
   * Reorder a module
   */
  reorderModule: async (id: number, newOrder: number): Promise<void> => {
    try {
      const response = await apiClient.post(`/modules/${id}/reorder`, null, {
        params: { newOrder }
      })
      
      if (response.status !== 200) {
        throw new Error('Failed to reorder module')
      }
    } catch (error: any) {
      console.error(`Failed to reorder module with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to reorder module'
      throw new Error(message)
    }
  }
}
