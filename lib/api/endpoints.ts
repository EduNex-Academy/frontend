// API endpoint configurations for different microservices
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://auth-api.edunex.app/api',
  
  // Subscription/Payment endpoints - assuming payments are handled by subscription service
  SUBSCRIPTION: process.env.NEXT_PUBLIC_SUBSCRIPTION_API_URL || 'http://localhost:8083',
  
  // Payment endpoints - these could be separate or part of subscription service
  PAYMENT: process.env.NEXT_PUBLIC_PAYMENT_API_URL || process.env.NEXT_PUBLIC_SUBSCRIPTION_API_URL || 'http://localhost:8083',
}

// Helper function to build full API URLs
export const buildApiUrl = (service: keyof typeof API_ENDPOINTS, path: string) => {
  const baseUrl = API_ENDPOINTS[service]
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${baseUrl}/${cleanPath}`
}

// Helper function specifically for payment endpoints
export const getPaymentApiUrl = (path: string) => {
  return buildApiUrl('PAYMENT', path)
}

// Helper function for subscription endpoints
export const getSubscriptionApiUrl = (path: string) => {
  return buildApiUrl('SUBSCRIPTION', path)
}

// Helper function for auth endpoints
export const getAuthApiUrl = (path: string) => {
  return buildApiUrl('AUTH', path)
}
