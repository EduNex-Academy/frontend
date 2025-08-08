import { apiClient } from './config'
import { TokenManager } from '../auth/tokens'
import { authConfig } from '../auth/config'
import { OAuthUtils } from '../auth/oauth'
import type { RegisterRequest, AuthResponse, AuthCallbackRequest, LoginUrls } from '@/types'

export const authApi = {
    /**
     * Login with email and password
     */
    login: async (username: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post<AuthResponse>(authConfig.endpoints.login, {
                username, // email === username
                password,
            })
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed'
            throw new Error(message)
        }
    },

    /**
     * Register a new user
     */
    register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post<AuthResponse>(authConfig.endpoints.register, registerData)
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed'
            throw new Error(message)
        }
    },

    /**
     * Get authentication URLs from backend
     */
    getLoginUrls: async (userRole: string): Promise<LoginUrls> => {
        try {
            const response = await apiClient.get<LoginUrls>(authConfig.endpoints.loginUrls, {
                params: { userRole }
            })
            // If backend returns an error key, throw an error
            if ((response.data as any).error) {
                throw new Error((response.data as any).error)
            }
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to get login URLs'
            throw new Error(message)
        }
    },

    /**
     * Handle OAuth callback with authorization code
     */
    handleOAuthCallback: async (code: string, userRole: string, state?: string | null): Promise<AuthResponse> => {
        try {
            const requestData: AuthCallbackRequest = {
                code,
                userRole,
                state: state || undefined
            }
            const response = await apiClient.post<AuthResponse>(authConfig.endpoints.oauthCallback, requestData)
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.message || 'OAuth authentication failed'
            throw new Error(message)
        }
    },

    /**
     * Initiate Google OAuth login
     */
    loginWithGoogle: async (userRole: string): Promise<void> => {
        try {
            // Store user type before redirect to persist it across OAuth flow
            OAuthUtils.storeUserType(userRole)
            
            const urls = await authApi.getLoginUrls(userRole)
            // Redirect to Google OAuth URL
            window.location.href = urls.googleLogin
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to initiate Google login'
            throw new Error(message)
        }
    },

    /**
     * Refresh access token using HttpOnly cookie
     */
    refreshTokenWithCookie: async (): Promise<AuthResponse> => {
        return TokenManager.refreshTokenWithCookie()
    },

    /**
     * Refresh access token (legacy method for backward compatibility)
     */
    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        return TokenManager.refreshToken(refreshToken)
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        try {
            // Call logout endpoint to clear HttpOnly cookies
            await apiClient.post(authConfig.endpoints.logout)
        } catch (error: any) {
            // Log error but don't throw - we still want to clear local state
            console.error('Logout API error:', error)
        }
    },

    /**
     * Verify email
     */
    verifyEmail: async (token: string): Promise<void> => {
        try {
            await apiClient.post('/auth/verify-email', { token })
        } catch (error: any) {
            const message = error.response?.data?.message || 'Email verification failed'
            throw new Error(message)
        }
    },

    /**
     * Send password reset email (works with Keycloak)
     * 
     * This triggers Keycloak to send a password reset email.
     * After the user resets their password via Keycloak's interface,
     * they will be redirected to: /auth/forgot-password/{userId}
     */
    sendPasswordReset: async (email: string, userRole: string): Promise<void> => {
        try {
            await apiClient.post(authConfig.endpoints.sendPasswordReset, { 
                email, 
                userRole 
            })
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Invalid email format')
            } else if (error.response?.status === 404) {
                throw new Error('User not found')
            } else if (error.response?.status === 500) {
                throw new Error('Email service error')
            }
            const message = error.response?.data?.message || 'Password reset request failed'
            throw new Error(message)
        }
    },

    /**
     * Verify password reset completion (for Keycloak integration)
     */
    verifyPasswordReset: async (userId: string): Promise<void> => {
        try {
            await apiClient.post(authConfig.endpoints.verifyPasswordReset, { userId })
        } catch (error: any) {
            const message = error.response?.data?.message || 'Password reset verification failed'
            throw new Error(message)
        }
    },

    /**
     * Change user's password
     */
    changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
        try {
            await apiClient.post(authConfig.endpoints.changePassword, {
                oldPassword,
                newPassword,
                confirmPassword
            })
        } catch (error: any) {
            if (error.response?.status === 400) {
                throw new Error('Invalid password or validation failed')
            } else if (error.response?.status === 401) {
                throw new Error('Unauthorized - invalid or missing token')
            } else if (error.response?.status === 403) {
                throw new Error('Current password incorrect')
            }
            const message = error.response?.data?.message || 'Password change failed'
            throw new Error(message)
        }
    },
}
