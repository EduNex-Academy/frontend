import axios from 'axios'

// API Gateway configuration
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8090/api'

// Ensure the URL ends with a trailing slash to prevent triple slash issues when paths are concatenated
const ensureTrailingSlash = (url: string) => url.endsWith('/') ? url : `${url}/`
const API_BASE_URL = ensureTrailingSlash(API_GATEWAY_URL)

// Helper to normalize URL paths to prevent double/triple slashes
export const normalizeUrlPath = (path: string): string => {
  // Remove leading slash if exists (as baseURL already has trailing slash)
  return path.startsWith('/') ? path.substring(1) : path
}

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
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Include cookies in requests
})

// Add request debugging logger
const requestLogger = (config: any) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    data: config.data,
    params: config.params
  });
  return config;
};

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
    // Normalize URL path to prevent double/triple slashes
    if (config.url) {
      config.url = normalizeUrlPath(config.url)
    }
    
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
    
    // Log request for debugging
    requestLogger(config);
    
    return config
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response [${response.status}]: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data ? (typeof response.data === 'object' ? 'Data object received' : response.data) : 'No data'
    });
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
