"use client"

import { useEffect, ReactNode, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { authApi } from "@/lib/api/auth"
import { setAuthStateGetter } from "@/lib/api/config"
import { SessionTokenManager } from "@/lib/auth/tokens/session-manager"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuth()
  const { setInitialized, updateTokens, logout, login } = authState
  const isInitializingRef = useRef(false)

  // Set up auth state getter for API client
  useEffect(() => {
    setAuthStateGetter(() => authState)
  }, [authState])

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (isInitializingRef.current || authState.isInitialized) {
      return
    }

    const initializeAuth = async () => {
      isInitializingRef.current = true
      
      try {
        // Try to refresh with HttpOnly cookie to get latest user info and token
        const authResponse = await authApi.refreshTokenWithCookie()
        
        // If successful, update auth state with new tokens
        updateTokens({
          accessToken: authResponse.accessToken,
          tokenType: authResponse.tokenType,
          expiresIn: authResponse.expiresIn,
          user: authResponse.user
        })

        // Store access token in session storage for page refreshes
        SessionTokenManager.setAccessToken(
          authResponse.accessToken,
          authResponse.tokenType,
          authResponse.expiresIn
        )
      } catch (error) {
        // If refresh fails, user is not authenticated
        console.log("No valid refresh token found or refresh failed")
        SessionTokenManager.clearAccessToken()
        logout()
      } finally {
        // Mark auth as initialized regardless of success/failure
        setInitialized(true)
        isInitializingRef.current = false
      }
    }

    initializeAuth()
  }, [setInitialized, updateTokens, logout, login, authState.isInitialized])

  // Listen for auth state changes to update session storage
  useEffect(() => {
    if (authState.isAuthenticated && authState.accessToken && authState.tokenType && authState.expiresIn) {
      SessionTokenManager.setAccessToken(
        authState.accessToken,
        authState.tokenType,
        authState.expiresIn
      )
    } else {
      SessionTokenManager.clearAccessToken()
    }
  }, [authState.isAuthenticated, authState.accessToken, authState.tokenType, authState.expiresIn])

  return <>{children}</>
}
