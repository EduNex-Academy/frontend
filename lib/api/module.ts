import { ModuleDTO, FileDTO } from "@/types"
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
  },

  /**
   * Upload content file for a module (video or PDF)
   */
  uploadModuleContent: async (id: number, file: File): Promise<FileDTO> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await apiClient.post<FileDTO>(
        `/modules/${id}/content`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      )
      
      if (response.status !== 201) {
        throw new Error('Failed to upload module content')
      }
      
      return response.data
    } catch (error: any) {
      console.error(`Failed to upload content for module with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to upload module content'
      throw new Error(message)
    }
  },

  /**
   * Delete content file from a module
   */
  deleteModuleContent: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/modules/${id}/content`)
      
      if (response.status !== 204) {
        throw new Error('Failed to delete module content')
      }
    } catch (error: any) {
      console.error(`Failed to delete content for module with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to delete module content'
      throw new Error(message)
    }
  },
  
  /**
   * Get download URL for module content (using CloudFront URL)
   */
  getDownloadUrl: async (id: number): Promise<string> => {
    try {
      const module = await moduleApi.getModuleById(id)
      
      if (module.contentCloudFrontUrl) {
        return module.contentCloudFrontUrl
      } else if (module.contentUrl) {
        return module.contentUrl
      } else {
        throw new Error('No content available for this module')
      }
    } catch (error: any) {
      console.error(`Failed to get download URL for module with ID ${id}:`, error)
      const message = error.response?.data?.message || error.message || 'Failed to get module download URL'
      throw new Error(message)
    }
  }
}
