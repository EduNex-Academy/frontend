import { subscriptionClient } from './config'

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

export const paymentApi = {
  /**
   * Create a payment intent for subscription payment
   * @param paymentData - Payment intent creation data
   */
  createPaymentIntent: async (paymentData: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
    try {
      const response = await subscriptionClient.post<ApiResponse<PaymentIntentResponse>>(
        '/api/v1/payments/create-intent',
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
}
