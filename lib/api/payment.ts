import { apiClient } from './config'

// Payment types
export interface CreatePaymentIntentRequest {
  planId: string
  amount: number
  currency: string
  email: string
  paymentMethodId?: string
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  status: string
}

export interface ConfirmPaymentResponse {
  subscriptionId?: string
  message: string
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string
  paymentMethodId: string
  savePaymentMethod?: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

// Payment Method types
export interface PaymentMethod {
  id: string
  type: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
  billingName: string
  country: string
}

export interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[]
  defaultPaymentMethodId: string | null
}

export interface SetupIntentResponse {
  clientSecret: string
  setupIntentId: string
  customerId: string
}

export interface AttachPaymentMethodRequest {
  paymentMethodId: string
  setAsDefault?: boolean
}

// Billing History types
export interface BillingHistoryItem {
  id: string
  description: string
  date: string
  amount: number
  currency: string
  status: string
  invoiceUrl?: string
  paymentMethod: string
  subscriptionName: string
}

export interface BillingHistoryResponse {
  history: BillingHistoryItem[]
  totalCount: number
  hasMore: boolean
}

export const paymentApi = {
  /**
   * Create a payment intent for subscription payment
   * @param paymentData - Payment intent creation data
   */
  createPaymentIntent: async (paymentData: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<PaymentIntentResponse>>(
        '/v1/payments/create-intent',
        paymentData
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment intent')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to create payment intent:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create payment intent'
      throw new Error(message)
    }
  },

  /**
   * Get all payment methods for the user
   */
  getPaymentMethods: async (): Promise<PaymentMethodsResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<PaymentMethodsResponse>>('/v1/payments/payment-methods')
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch payment methods')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch payment methods:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch payment methods'
      throw new Error(message)
    }
  },

  /**
   * Remove a payment method
   * @param paymentMethodId - ID of the payment method to remove
   */
  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/v1/payments/payment-methods/${paymentMethodId}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove payment method')
      }
    } catch (error: any) {
      console.error('Failed to remove payment method:', error)
      const message = error.response?.data?.message || error.message || 'Failed to remove payment method'
      throw new Error(message)
    }
  },

  /**
   * Set a payment method as default
   * @param paymentMethodId - ID of the payment method to set as default
   */
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    try {
      const response = await apiClient.put<ApiResponse<void>>(`/v1/payments/payment-methods/${paymentMethodId}/default`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to set default payment method')
      }
    } catch (error: any) {
      console.error('Failed to set default payment method:', error)
      const message = error.response?.data?.message || error.message || 'Failed to set default payment method'
      throw new Error(message)
    }
  },

  /**
   * Create a setup intent for adding a new payment method
   */
  createSetupIntent: async (): Promise<SetupIntentResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<SetupIntentResponse>>('/v1/payments/setup-intent')
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create setup intent')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to create setup intent:', error)
      const message = error.response?.data?.message || error.message || 'Failed to create setup intent'
      throw new Error(message)
    }
  },

  /**
   * Attach a payment method to the customer
   * @param attachData - Payment method attachment data
   */
  attachPaymentMethod: async (attachData: AttachPaymentMethodRequest): Promise<void> => {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/v1/payments/payment-methods', attachData)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to attach payment method')
      }
    } catch (error: any) {
      console.error('Failed to attach payment method:', error)
      const message = error.response?.data?.message || error.message || 'Failed to attach payment method'
      throw new Error(message)
    }
  },

  /**
   * Get billing history for the user
   * @param limit - Maximum number of records to retrieve
   */
  getBillingHistory: async (limit: number = 50): Promise<BillingHistoryResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<BillingHistoryResponse>>(`/v1/payments/billing-history?limit=${limit}`)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch billing history')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch billing history:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch billing history'
      throw new Error(message)
    }
  },
}
