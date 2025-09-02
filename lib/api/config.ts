import axios from 'axios'

// Microservice configurations
const MICROSERVICES = {
  AUTH: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://auth-api.edunex.app/api',
  SUBSCRIPTION: process.env.NEXT_PUBLIC_SUBSCRIPTION_API_URL || 'http://localhost:8083',
  // Add more microservices here as needed
  COURSE: process.env.NEXT_PUBLIC_COURSE_API_URL || 'http://localhost:8084',
  // NOTIFICATION: process.env.NEXT_PUBLIC_NOTIFICATION_API_URL || 'http://localhost:8085',
}

const API_BASE_URL = MICROSERVICES.AUTH

// Type for auth state
interface AuthState {
  accessToken: string | null
  tokenType: string | null
  updateTokens: (data: {
    accessToken: string
    tokenType: string
    expiresIn: number
    user: any
  }) => void
  logout: () => void
}

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Include cookies in requests
})

// Function to create API client for specific microservice
export const createMicroserviceClient = (serviceUrl: string, options: {
  withAuth?: boolean
  timeout?: number
} = {}) => {
  const { withAuth = true, timeout = 10000 } = options
  
  const client = axios.create({
    baseURL: serviceUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout,
    withCredentials: withAuth, // Include cookies only if auth is needed
  })

  // Add auth interceptors only if withAuth is true
  if (withAuth) {
    // Request interceptor to add auth token
    client.interceptors.request.use(
      (config) => {
        if (getAuthState) {
          const authState = getAuthState()
          if (authState.accessToken) {
            config.headers.Authorization = `${authState.tokenType || 'Bearer'} ${authState.accessToken}`
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling (same as main client)
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return client(originalRequest)
            }).catch(err => {
              return Promise.reject(err)
            })
          }

          originalRequest._retry = true
          isRefreshing = true
          
          if (getAuthState) {
            const authState = getAuthState()
            
            try {
              const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
              })
              
              if (!response.ok) {
                throw new Error('Token refresh failed')
              }
              
              const newAuthData = await response.json()
              
              authState.updateTokens({
                accessToken: newAuthData.accessToken,
                tokenType: newAuthData.tokenType,
                expiresIn: newAuthData.expiresIn,
                user: newAuthData.user
              })

              processQueue(null, newAuthData.accessToken)
              originalRequest.headers.Authorization = `${newAuthData.tokenType || 'Bearer'} ${newAuthData.accessToken}`
              
              return client(originalRequest)
              
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError)
              processQueue(refreshError, null)
              authState.logout()
              window.location.href = '/auth/login'
            } finally {
              isRefreshing = false
            }
          } else {
            isRefreshing = false
            window.location.href = '/auth/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  return client
}

// Create subscription service client
export const subscriptionClient = createMicroserviceClient(MICROSERVICES.SUBSCRIPTION)

// Store for auth state access (will be set by AuthProvider)
let getAuthState: (() => AuthState) | null = null

// Track ongoing refresh attempts to prevent concurrent refreshes
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (reason: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

export const setAuthStateGetter = (getter: () => AuthState) => {
  getAuthState = getter
}

// Endpoints that don't require Authorization header (permitAll endpoints)
const publicEndpoints = [
  '/auth/register',
  '/auth/login',
  '/auth/refresh',
  '/auth/send-password-reset',
  '/auth/callback',
  '/auth/login-urls',
  '/auth/diagnose',
  '/auth/health'
]

// Request interceptor to add auth token (for main auth client)
apiClient.interceptors.request.use(
  (config) => {
    // Check if this is a public endpoint that doesn't need Authorization header
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    )
    
    // Only add Authorization header for non-public endpoints
    if (!isPublicEndpoint && getAuthState) {
      const authState = getAuthState()
      if (authState.accessToken) {
        config.headers.Authorization = `${authState.tokenType || 'Bearer'} ${authState.accessToken}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true
      
      if (getAuthState) {
        const authState = getAuthState()
        
        try {
          // Try to refresh token using HttpOnly cookie
          // Use fetch directly to avoid circular dependency with apiClient
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          })
          
          if (!response.ok) {
            throw new Error('Token refresh failed')
          }
          
          const newAuthData = await response.json()
          
          // Update auth state with new tokens
          authState.updateTokens({
            accessToken: newAuthData.accessToken,
            tokenType: newAuthData.tokenType,
            expiresIn: newAuthData.expiresIn,
            user: newAuthData.user
          })

          // Process queued requests with new token
          processQueue(null, newAuthData.accessToken)

          // Update the failed request with new token
          originalRequest.headers.Authorization = `${newAuthData.tokenType || 'Bearer'} ${newAuthData.accessToken}`
          
          // Retry the original request
          return apiClient(originalRequest)
          
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Process queued requests with error
          processQueue(refreshError, null)
          // Clear auth state and redirect to login
          authState.logout()
          window.location.href = '/auth/login'
        } finally {
          isRefreshing = false
        }
      } else {
        // No auth state available, redirect to login
        isRefreshing = false
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

// Export microservices configuration
export { MICROSERVICES }
