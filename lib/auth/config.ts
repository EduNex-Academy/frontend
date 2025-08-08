/**
 * Authentication configuration
 */

export const authConfig = {
  // These URLs will be fetched from the backend dynamically
  // but can be used as fallbacks if needed
  oauth: {
    redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/callback',
    // You can add more OAuth-related config here if needed
  },
  
  // API endpoints
  endpoints: {
    loginUrls: '/auth/login-urls',
    oauthCallback: '/auth/callback',
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    sendPasswordReset: '/auth/send-password-reset',
    verifyPasswordReset: '/auth/verify-password-reset',
    changePassword: '/auth/change-password',
  }
} as const
