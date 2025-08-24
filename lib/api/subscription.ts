import { subscriptionClient } from './config'

// Generic API response wrapper
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

// Types for subscription API
export interface SubscriptionPlan {
  id: string
  name: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  price: number
  currency: string
  pointsAwarded: number
  features: string[]
  isActive: boolean
  createdAt: string
}

export interface SubscriptionPlansResponse {
  success: boolean
  message: string
  data: SubscriptionPlan[]
  timestamp: string
}

export interface SubscriptionPlanResponse {
  success: boolean
  message: string
  data: SubscriptionPlan
  timestamp: string
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  plan: SubscriptionPlan
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
  startDate: string
  endDate?: string
  autoRenew: boolean
  createdAt: string
  updatedAt: string
}

export interface UserSubscriptionResponse {
  success: boolean
  message: string
  data: UserSubscription
  timestamp: string
}

export interface UserSubscriptionsResponse {
  success: boolean
  message: string
  data: UserSubscription[]
  timestamp: string
}

export interface CreateSubscriptionRequest {
  planId: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  email: string
  paymentMethodId?: string
}

export interface CreateSubscriptionResponse {
  clientSecret: string
  paymentIntentId: string
  status: string
  subscriptionId?: string
}

export const subscriptionApi = {
  /**
   * Get all available subscription plans
   */
  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const response = await subscriptionClient.get<SubscriptionPlansResponse>('/api/v1/subscription-plans')
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch subscription plans')
      }
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch subscription plans:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch subscription plans'
      throw new Error(message)
    }
  },

  /**
   * Get subscription plan by ID
   * @param planId - UUID of the plan
   */
  getPlanById: async (planId: string): Promise<SubscriptionPlan> => {
    try {
      const response = await subscriptionClient.get<SubscriptionPlanResponse>(`/api/v1/subscription-plans/${planId}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch subscription plan')
      }
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch subscription plan:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch subscription plan'
      throw new Error(message)
    }
  },

  /**
   * Get subscription plans by name
   * @param planName - Name of the plan
   */
  getPlansByName: async (planName: string): Promise<SubscriptionPlan[]> => {
    try {
      const response = await subscriptionClient.get<SubscriptionPlansResponse>(`/api/v1/subscription-plans/by-name/${planName}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch subscription plans')
      }
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch subscription plans by name:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch subscription plans by name'
      throw new Error(message)
    }
  },

  /**
   * Get user's current subscription
   */
  getUserSubscriptions: async (): Promise<UserSubscription[]> => {
    try {
      const response = await subscriptionClient.get<UserSubscriptionsResponse>('/api/v1/subscriptions/user')
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user subscriptions')
      }
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch user subscriptions:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch user subscriptions'
      throw new Error(message)
    }
  },

  /**
   * Get user's active subscription
   */
  getActiveSubscription: async (): Promise<UserSubscription | null> => {
    try {
      const response = await subscriptionClient.get<UserSubscriptionResponse>('/api/v1/subscriptions/user/active')
      if (!response.data.success) {
        // If no active subscription found, return null instead of throwing error
        if (response.status === 404) {
          return null
        }
        throw new Error(response.data.message || 'Failed to fetch active subscription')
      }
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch active subscription:', error)
      // If 404, user has no active subscription
      if (error.response?.status === 404) {
        return null
      }
      const message = error.response?.data?.message || error.message || 'Failed to fetch active subscription'
      throw new Error(message)
    }
  },

  /**
   * Cancel an active subscription and handle refund processing if applicable
   * @param subscriptionId - UUID of subscription to cancel
   */
  cancelSubscription: async (subscriptionId: string): Promise<void> => {
    try {
      const response = await subscriptionClient.post(`/api/v1/subscriptions/${subscriptionId}/cancel`)
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to cancel subscription')
      }
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error)
      const message = error.response?.data?.message || error.message || 'Failed to cancel subscription'
      throw new Error(message)
    }
  },

  /**
   * Activate a subscription after successful payment confirmation
   * @param subscriptionId - UUID of subscription to activate
   */
  activateSubscription: async (subscriptionId: string): Promise<void> => {
    try {
      const response = await subscriptionClient.post(`/api/v1/subscriptions/${subscriptionId}/activate`)
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to activate subscription')
      }
    } catch (error: any) {
      console.error('Failed to activate subscription:', error)
      const message = error.response?.data?.message || error.message || 'Failed to activate subscription'
      throw new Error(message)
    }
  },

  /**
   * Create a new subscription for the user
   * @param subscriptionData - Subscription creation data
   */
  createSubscription: async (subscriptionData: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> => {
    try {
      const response = await subscriptionClient.post<ApiResponse<CreateSubscriptionResponse>>(
        '/api/v1/subscriptions/create',
        subscriptionData
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create subscription')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to create subscription:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create subscription'
      throw new Error(message)
    }
  }
}
