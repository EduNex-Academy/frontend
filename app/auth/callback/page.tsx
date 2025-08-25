"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { OAuthUtils, SessionTokenManager } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState('')
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const hasProcessed = useRef(false)
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Prevent double execution using ref and session storage
    if (hasProcessed.current) return

    const handleCallback = async () => {
      try {
        // Extract OAuth parameters first
        const { code, state, error, error_description } = OAuthUtils.extractOAuthParams()

        if (error) {
          throw new Error(`OAuth error: ${error}${error_description ? ` - ${error_description}` : ''}`)
        }

        if (!code) {
          throw new Error('No authorization code received from OAuth provider')
        }

        // Retrieve stored user type from sessionStorage
        const storedUserType = OAuthUtils.retrieveAndClearUserType()
        if (!storedUserType) {
          throw new Error('User type not found. Please try logging in again.')
        }

        // Create a unique session key for this specific code
        const sessionKey = `oauth_processing_${code.substring(0, 10)}`

        // Check if this specific code is already being processed
        if (sessionStorage.getItem(sessionKey)) {
          console.log('Code already being processed, skipping...')
          return
        }

        // Mark this code as being processed
        sessionStorage.setItem(sessionKey, 'true')
        hasProcessed.current = true

        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        // Send the authorization code to the backend with the stored user type
        const response = await api.auth.handleOAuthCallback(code, storedUserType, state)
        clearTimeout(timeoutId)

        // Validate response data
        if (!response.accessToken || !response.user) {
          throw new Error('Invalid response from authentication server')
        }

        // Check if user role matches the expected userType
        if (response.user.role !== storedUserType) {
          toast({
            title: "Error",
            description: "User type mismatch. Please select the correct user type.",
            variant: "destructive",
          })
          return
        }

        // Login the user with the received tokens
        login({
          accessToken: response.accessToken,
          tokenType: response.tokenType,
          expiresIn: response.expiresIn,
          user: response.user
        })

        // Store access token in session storage
        SessionTokenManager.setAccessToken(
          response.accessToken,
          response.tokenType,
          response.expiresIn
        )

        setStatus('success')
        toast({
          title: "Success",
          description: "Logged in successfully with Google",
        })

        // Clean up session storage
        sessionStorage.removeItem(sessionKey)

        // Redirect to appropriate dashboard based on user role
        const userRole = response.user?.role?.toLowerCase()
        let dashboardPath = '/student/dashboard' // default fallback

        if (userRole === 'instructor') {
          dashboardPath = '/instructor/dashboard'
        } else if (userRole === 'student') {
          dashboardPath = '/student/dashboard'
        }

        // Small delay to show success state
        setTimeout(() => {
          router.replace(dashboardPath)
        }, 1000)

      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')

        let errorMsg = 'Authentication failed'
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMsg = 'Authentication timed out. Please try again.'
          } else if (error.message.includes('Code not valid') || error.message.includes('invalid_grant')) {
            errorMsg = 'Authorization code has expired. Please try logging in again.'
          } else if (error.message.includes('OAuth error:')) {
            errorMsg = error.message
          } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
            errorMsg = 'Network error. Please check your connection and try again.'
          } else if (error.message.includes('Invalid response')) {
            errorMsg = 'Server returned invalid data. Please try again.'
          } else {
            errorMsg = error.message
          }
        }

        setErrorMessage(errorMsg)

        toast({
          title: "Authentication Error",
          description: errorMsg,
          variant: "destructive",
        })

        // Start countdown timer for redirect
        let countdown = 3
        const countdownInterval = setInterval(() => {
          countdown -= 1
          setRedirectCountdown(countdown)

          if (countdown <= 0) {
            clearInterval(countdownInterval)
            router.replace("/auth/login")
          }
        }, 1000)

        // Cleanup interval on component unmount
        return () => clearInterval(countdownInterval)
      }
    }

    handleCallback()
  }, [login, router, toast])

  // Auto-redirect countdown effect for error state
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        router.replace("/auth/login")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === 'processing' && 'Processing Authentication...'}
            {status === 'success' && 'Authentication Successful!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'processing' && 'Please wait while we complete your Google sign-in...'}
            {status === 'success' && 'Taking you to your dashboard...'}
            {status === 'error' && 'Something went wrong during authentication'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'processing' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Authenticating with Google...</p>
              <div className="text-xs text-gray-500">This may take a few seconds</div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Authentication completed successfully!</p>
              <div className="text-xs text-gray-500">Redirecting to your dashboard...</div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
              <div className="text-xs text-gray-500 text-center">
                Redirecting to login in {redirectCountdown} seconds...
              </div>
              <button
                onClick={() => router.replace("/auth/login")}
                className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Go to Login Now
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
