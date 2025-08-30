import { apiClient } from './config'

// Points types
export interface UserPointsWallet {
  id: string
  userId: string
  totalPoints: number
  lifetimeEarned: number
  lifetimeSpent: number
  updatedAt?: string
}

export interface PointsTransaction {
  id: string
  userId: string
  transactionType: 'EARN' | 'REDEEM' | 'EXPIRED'
  points: number
  description: string
  referenceType?: string
  referenceId?: string
  createdAt: string
}

export interface RedeemPointsRequest {
  points: number
  description: string
  referenceType?: string
  referenceId?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export const pointsApi = {
  /**
   * Get user's points wallet information
   */
  getUserWallet: async (): Promise<UserPointsWallet> => {
    try {
      const response = await apiClient.get<ApiResponse<UserPointsWallet>>('/v1/points/wallet')
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user wallet')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch user wallet:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch user wallet'
      throw new Error(message)
    }
  },

  /**
   * Get user's transaction history with pagination
   * @param page - Page number (0-based)
   * @param size - Page size
   */
  getTransactionHistory: async (page: number = 0, size: number = 20): Promise<PaginatedResponse<PointsTransaction>> => {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<PointsTransaction>>>(
        `/v1/points/transactions?page=${page}&size=${size}`
      )
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch transaction history')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to fetch transaction history:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch transaction history'
      throw new Error(message)
    }
  },

  /**
   * Redeem points for rewards
   * @param redeemData - Redemption details
   */
  redeemPoints: async (redeemData: RedeemPointsRequest): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>('/v1/points/redeem', redeemData)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to redeem points')
      }
      
      return response.data.data
    } catch (error: any) {
      console.error('Failed to redeem points:', error)
      const message = error.response?.data?.message || error.message || 'Failed to redeem points'
      throw new Error(message)
    }
  }
}
