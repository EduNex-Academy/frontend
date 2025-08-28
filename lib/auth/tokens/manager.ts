import type { AuthResponse } from '@/types'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://auth-api.edunex.app/api'

/**
 * Token manager utility for handling token refresh
 * Note: This is now mainly used for backward compatibility
 * The auth system uses HttpOnly cookies for refresh tokens
 */
export class TokenManager {
  private static refreshPromise: Promise<AuthResponse> | null = null

  /**
   * Refresh the access token using HttpOnly cookie
   */
  static async refreshTokenWithCookie(): Promise<AuthResponse> {
    // Prevent multiple refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefreshWithCookie()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh API call using HttpOnly cookie
   */
  private static async performTokenRefreshWithCookie(): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {}, {
        withCredentials: true, // Include HttpOnly cookies
        headers: { 'Content-Type': 'application/json' }
      })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Token refresh failed'
      throw new Error(message)
    }
  }

  /**
   * Legacy method for refreshing token with refresh token (for backward compatibility)
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Token refresh failed'
      throw new Error(message)
    }
  }
}
