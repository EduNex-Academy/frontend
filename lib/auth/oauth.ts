/**
 * OAuth utilities for handling authentication flows
 */

export class OAuthUtils {
  /**
   * Extract OAuth parameters from URL
   */
  static extractOAuthParams(): {
    code: string | null
    state: string | null
    error: string | null
    error_description: string | null
  } {
    if (typeof window === 'undefined') {
      return { code: null, state: null, error: null, error_description: null }
    }

    const urlParams = new URLSearchParams(window.location.search)
    return {
      code: urlParams.get('code'),
      state: urlParams.get('state'),
      error: urlParams.get('error'),
      error_description: urlParams.get('error_description')
    }
  }

  /**
   * Build OAuth redirect URL with state parameter
   */
  static buildOAuthUrl(baseUrl: string, state?: string): string {
    const url = new URL(baseUrl)
    if (state) {
      url.searchParams.set('state', state)
    }
    return url.toString()
  }

  /**
   * Generate a random state parameter for OAuth security
   */
  static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  /**
   * Store state in sessionStorage for OAuth verification
   */
  static storeState(state: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', state)
    }
  }

  /**
   * Retrieve and clear stored state from sessionStorage
   */
  static retrieveAndClearState(): string | null {
    if (typeof window === 'undefined') return null
    
    const state = sessionStorage.getItem('oauth_state')
    sessionStorage.removeItem('oauth_state')
    return state
  }

  /**
   * Store user type in sessionStorage before OAuth redirect
   */
  static storeUserType(userType: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_user_type', userType)
    }
  }

  /**
   * Retrieve and clear stored user type from sessionStorage
   */
  static retrieveAndClearUserType(): string | null {
    if (typeof window === 'undefined') return null
    
    const userType = sessionStorage.getItem('oauth_user_type')
    sessionStorage.removeItem('oauth_user_type')
    return userType
  }

  /**
   * Verify OAuth state parameter matches stored state
   */
  static verifyState(receivedState: string | null): boolean {
    const storedState = this.retrieveAndClearState()
    return storedState !== null && storedState === receivedState
  }
}
