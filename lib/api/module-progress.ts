import { apiClient } from './config';

export const moduleProgressApi = {
  /**
   * Mark a module as completed
   */
  markModuleCompleted: async (moduleId: number, userId?: number): Promise<any> => {
    try {
      const response = await apiClient.post(`/module-progress/complete`, { 
        moduleId,
        userId 
      });
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to mark module as completed');
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Failed to mark module ${moduleId} as completed:`, error);
      const message = error.response?.data?.message || error.message || 'Failed to mark module as completed';
      throw new Error(message);
    }
  },

  /**
   * Get completion status of a module for the current user
   */
  getModuleCompletionStatus: async (moduleId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/module-progress/${moduleId}/status`);
      
      if (response.status !== 200) {
        throw new Error('Failed to get module completion status');
      }
      
      return response.data.completed;
    } catch (error: any) {
      console.error(`Failed to get completion status for module ${moduleId}:`, error);
      const message = error.response?.data?.message || error.message || 'Failed to get module completion status';
      throw new Error(message);
    }
  },

  /**
   * Get all completed modules for the current user
   */
  getUserCompletedModules: async (): Promise<number[]> => {
    try {
      const response = await apiClient.get(`/module-progress/completed`);
      
      if (response.status !== 200) {
        throw new Error('Failed to get completed modules');
      }
      
      // Return an array of module IDs
      return response.data.map((item: any) => item.moduleId);
    } catch (error: any) {
      console.error('Failed to get completed modules:', error);
      const message = error.response?.data?.message || error.message || 'Failed to get completed modules';
      throw new Error(message);
    }
  },
  
  /**
   * Get course progress percentage
   */
  getCourseProgress: async (courseId: number): Promise<number> => {
    try {
      const response = await apiClient.get(`/module-progress/course/${courseId}/progress`);
      
      if (response.status !== 200) {
        throw new Error('Failed to get course progress');
      }
      
      return response.data.progressPercentage;
    } catch (error: any) {
      console.error(`Failed to get progress for course ${courseId}:`, error);
      const message = error.response?.data?.message || error.message || 'Failed to get course progress';
      throw new Error(message);
    }
  }
};