// Export API configuration
export { apiClient, subscriptionClient, createMicroserviceClient, MICROSERVICES } from './config'

// Export all API modules
export { authApi } from './auth'
export { subscriptionApi } from './subscription'
export { paymentApi } from './payment'
export { pointsApi } from './points'

// Import APIs to create unified object
import { authApi } from './auth'
import { subscriptionApi } from './subscription'
import { paymentApi } from './payment'
import { pointsApi } from './points'

// Create a unified API object for backward compatibility
export const api = {
  auth: authApi,
  subscription: subscriptionApi,
  payment: paymentApi,
  points: pointsApi,
}
