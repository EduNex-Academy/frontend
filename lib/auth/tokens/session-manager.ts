/**
 * Utility for managing access tokens in sessionStorage
 * This provides persistence across page refreshes but not browser sessions
 */

interface TokenData {
  accessToken: string
  tokenType: string
  expiresIn: number
  expiresAt: number
}

export class SessionTokenManager {
  private static readonly TOKEN_KEY = 'auth_access_token'

  /**
   * Store access token in sessionStorage
   */
  static setAccessToken(accessToken: string, tokenType: string, expiresIn: number): void {
    try {
      const expiresAt = Date.now() + (expiresIn * 1000)
      const tokenData: TokenData = {
        accessToken,
        tokenType,
        expiresIn,
        expiresAt
      }
      sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData))
    } catch (error) {
      console.error('Failed to store access token in sessionStorage:', error)
    }
  }

  /**
   * Get access token from sessionStorage
   */
  static getAccessToken(): { accessToken: string; tokenType: string } | null {
    try {
      const tokenDataStr = sessionStorage.getItem(this.TOKEN_KEY)
      if (!tokenDataStr) return null

      const tokenData: TokenData = JSON.parse(tokenDataStr)
      
      // Check if token is expired
      if (Date.now() >= tokenData.expiresAt) {
        this.clearAccessToken()
        return null
      }

      return {
        accessToken: tokenData.accessToken,
        tokenType: tokenData.tokenType
      }
    } catch (error) {
      console.error('Failed to get access token from sessionStorage:', error)
      return null
    }
  }

  /**
   * Clear access token from sessionStorage
   */
  static clearAccessToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY)
    } catch (error) {
      console.error('Failed to clear access token from sessionStorage:', error)
    }
  }

  /**
   * Check if access token exists and is not expired
   */
  static hasValidAccessToken(): boolean {
    return this.getAccessToken() !== null
  }
}
