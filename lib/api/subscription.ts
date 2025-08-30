import { apiClient } from './config'

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

export interface SubscriptionSetupRequest {
  planId: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  email: string
}

export interface SubscriptionSetupResponse {
  setup_intent_client_secret: string
  customer_id: string
  plan_price: number
  plan_id: string
  plan_name: string
  status: string
  // Legacy fields for backwards compatibility
  clientSecret?: string
  customerId?: string
  setupIntentId?: string
}

export interface CompleteSubscriptionRequest {
  customerId: string
  planId: string
}

export interface CompleteSubscriptionResponse {
  subscription: UserSubscription
  message: string
}

// Track ongoing setup requests to prevent duplicates
const ongoingSetupRequests = new Map<string, Promise<SubscriptionSetupResponse>>()

export const subscriptionApi = {
  /**
   * Get all available subscription plans
   */
  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const response = await apiClient.get<SubscriptionPlansResponse>('/v1/subscription-plans')
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
      const response = await apiClient.get<SubscriptionPlanResponse>(`/v1/subscription-plans/${planId}`)
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
      const response = await apiClient.get<SubscriptionPlansResponse>(`/v1/subscription-plans/by-name/${planName}`)
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
      const response = await apiClient.get<UserSubscriptionsResponse>('/v1/subscriptions/user')
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
      const response = await apiClient.get<UserSubscriptionResponse>('/v1/subscriptions/user/active')
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
      const response = await apiClient.post(`/v1/subscriptions/${subscriptionId}/cancel`)
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
      const response = await apiClient.post(`/v1/subscriptions/${subscriptionId}/activate`)
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
   * Setup subscription payment method
   * @param setupData - Subscription setup data
   */
  setupSubscription: async (setupData: SubscriptionSetupRequest): Promise<SubscriptionSetupResponse> => {
    // Create a unique key for this request to deduplicate calls
    const requestKey = `${setupData.planId}-${setupData.billingCycle}-${setupData.email}`
    
    // If there's already an ongoing request for this exact setup, return that promise
    if (ongoingSetupRequests.has(requestKey)) {
      console.log('Reusing existing setup request for:', requestKey)
      return ongoingSetupRequests.get(requestKey)!
    }

    // Create the promise for this request
    const setupPromise = (async (): Promise<SubscriptionSetupResponse> => {
      try {
        console.log('Making setup request with data:', setupData)
        
        const response = await apiClient.post<ApiResponse<SubscriptionSetupResponse>>(
          '/v1/subscriptions/setup',
          setupData
        )
        
        console.log('Setup response received:', response.data)
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to setup subscription')
        }
        
        return response.data.data
      } catch (error: any) {
        console.error('Failed to setup subscription:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        const message = error.response?.data?.message || error.message || 'Failed to setup subscription'
        throw new Error(message)
      } finally {
        // Clean up the ongoing request when done
        ongoingSetupRequests.delete(requestKey)
      }
    })()

    // Store the promise to handle duplicate requests
    ongoingSetupRequests.set(requestKey, setupPromise)
    
    return setupPromise
  },

  /**
   * Complete subscription after payment setup
   * @param customerId - Stripe customer ID
   * @param planId - Subscription plan ID
   */
  completeSubscription: async (customerId: string, planId: string): Promise<UserSubscription> => {
    try {
      const response = await apiClient.post<ApiResponse<UserSubscription>>(
        `/v1/subscriptions/complete?customerId=${encodeURIComponent(customerId)}&planId=${encodeURIComponent(planId)}`
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to complete subscription')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to complete subscription:', error)
      const message = error.response?.data?.message || error.message || 'Failed to complete subscription'
      throw new Error(message)
    }
  },

  /**
   * Create a new subscription for the user (legacy method)
   * @param subscriptionData - Subscription creation data
   */
  createSubscription: async (subscriptionData: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<CreateSubscriptionResponse>>(
        '/v1/subscriptions/create',
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
