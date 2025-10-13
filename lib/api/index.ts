// Export API configuration
export { apiClient } from './config'

// Export all API modules
export { authApi } from './auth'
export { subscriptionApi } from './subscription'
export { paymentApi } from './payment'
export { pointsApi } from './points'
export { courseApi } from './course'
export { moduleApi } from './module'
export { quizApi } from './quiz'
export { enrollmentApi } from './enrollment'
export { moduleProgressApi } from './module-progress'
export { studentDashboardApi } from './student-dashboard'

// Import APIs to create unified object
import { authApi } from './auth'
import { subscriptionApi } from './subscription'
import { paymentApi } from './payment'
import { pointsApi } from './points'
import { courseApi } from './course'
import { moduleApi } from './module'
import { quizApi } from './quiz'
import { enrollmentApi } from './enrollment'
import { moduleProgressApi } from './module-progress'
import { studentDashboardApi } from './student-dashboard'

// Create a unified API object for backward compatibility
export const api = {
  auth: authApi,
  subscription: subscriptionApi,
  payment: paymentApi,
  points: pointsApi,
  course: courseApi,
  module: moduleApi,
  quiz: quizApi,
  enrollment: enrollmentApi,
  moduleProgress: moduleProgressApi,
  studentDashboard: studentDashboardApi
}
