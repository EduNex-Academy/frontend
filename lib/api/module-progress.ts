import { apiClient } from './config';

export const moduleProgressApi = {
  /**
   * Mark a module as completed
   */
  markModuleCompleted: async (moduleId: number): Promise<any> => {
    try {
      // This matches the Spring Boot controller endpoint: /api/progress/module/{moduleId}/complete
      const response = await apiClient.post(`/progress/module/${moduleId}/complete`);
      
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to mark module as completed');
      }
      
      console.log('Module marked as completed successfully:', response.data);
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
      // This matches the Spring Boot controller endpoint: /api/progress/user/module/{moduleId}
      const response = await apiClient.get(`/progress/user/module/${moduleId}`);
      
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
      // This matches the Spring Boot controller endpoint: /api/progress/user
      const response = await apiClient.get(`/progress/user`);
      
      if (response.status !== 200) {
        throw new Error('Failed to get completed modules');
      }
      
      // Return an array of module IDs, mapping from the ProgressDTO
      return response.data
        .filter((item: any) => item.completed)
        .map((item: any) => item.moduleId);
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
      // This matches the Spring Boot controller endpoint: /api/progress/course/{courseId}/stats
      const response = await apiClient.get(`/progress/course/${courseId}/stats`);
      
      if (response.status !== 200) {
        throw new Error('Failed to get course progress');
      }
      
      return response.data.completionPercentage;
    } catch (error: any) {
      console.error(`Failed to get progress for course ${courseId}:`, error);
      const message = error.response?.data?.message || error.message || 'Failed to get course progress';
      throw new Error(message);
    }
  }
};