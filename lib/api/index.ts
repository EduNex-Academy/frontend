// Export API configuration
export { apiClient } from './config'

// Export all API modules
export { authApi } from './auth'

// Import APIs to create unified object
import { authApi } from './auth'

// Create a unified API object for backward compatibility
export const api = {
  auth: authApi,
}
