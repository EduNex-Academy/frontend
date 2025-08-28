import { useState, useEffect, useCallback } from 'react'
import { pointsApi, type UserPointsWallet, type PointsTransaction, type RedeemPointsRequest, type PaginatedResponse } from '@/lib/api/points'
import { useToast } from './use-toast'

interface UsePointsReturn {
  // Data
  wallet: UserPointsWallet | null
  transactions: PointsTransaction[]
  paginationInfo: {
    totalElements: number
    totalPages: number
    currentPage: number
    size: number
    hasNext: boolean
    hasPrevious: boolean
  }
  
  // Loading states
  isLoadingWallet: boolean
  isLoadingTransactions: boolean
  isRedeemingPoints: boolean
  
  // Error states
  walletError: string | null
  transactionsError: string | null
  
  // Actions
  fetchWallet: () => Promise<void>
  fetchTransactions: (page?: number, size?: number) => Promise<void>
  redeemPoints: (redeemData: RedeemPointsRequest) => Promise<void>
  loadNextPage: () => Promise<void>
  loadPreviousPage: () => Promise<void>
  refreshData: () => Promise<void>
}

export const usePoints = (): UsePointsReturn => {
  const { toast } = useToast()
  
  // Data states
  const [wallet, setWallet] = useState<UserPointsWallet | null>(null)
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [paginationInfo, setPaginationInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 20,
    hasNext: false,
    hasPrevious: false
  })
  
  // Loading states
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false)
  
  // Error states
  const [walletError, setWalletError] = useState<string | null>(null)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  // Fetch user's points wallet
  const fetchWallet = useCallback(async () => {
    try {
      setIsLoadingWallet(true)
      setWalletError(null)
      const walletData = await pointsApi.getUserWallet()
      setWallet(walletData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wallet'
      setWalletError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoadingWallet(false)
    }
  }, [toast])

  // Fetch transaction history
  const fetchTransactions = useCallback(async (page: number = 0, size: number = 20) => {
    try {
      setIsLoadingTransactions(true)
      setTransactionsError(null)
      const response: PaginatedResponse<PointsTransaction> = await pointsApi.getTransactionHistory(page, size)
      
      setTransactions(response.content)
      setPaginationInfo({
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
        size: response.size,
        hasNext: !response.last,
        hasPrevious: !response.first
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions'
      setTransactionsError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoadingTransactions(false)
    }
  }, [toast])

  // Redeem points
  const redeemPoints = useCallback(async (redeemData: RedeemPointsRequest) => {
    try {
      setIsRedeemingPoints(true)
      await pointsApi.redeemPoints(redeemData)
      
      // Refresh wallet and transactions
      await Promise.all([
        fetchWallet(),
        fetchTransactions(paginationInfo.currentPage, paginationInfo.size)
      ])
      
      toast({
        title: 'Success',
        description: `Successfully redeemed ${redeemData.points} points!`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to redeem points'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsRedeemingPoints(false)
    }
  }, [fetchWallet, fetchTransactions, paginationInfo, toast])

  // Load next page of transactions
  const loadNextPage = useCallback(async () => {
    if (paginationInfo.hasNext) {
      await fetchTransactions(paginationInfo.currentPage + 1, paginationInfo.size)
    }
  }, [fetchTransactions, paginationInfo])

  // Load previous page of transactions
  const loadPreviousPage = useCallback(async () => {
    if (paginationInfo.hasPrevious) {
      await fetchTransactions(paginationInfo.currentPage - 1, paginationInfo.size)
    }
  }, [fetchTransactions, paginationInfo])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchWallet(),
      fetchTransactions(0, paginationInfo.size)
    ])
  }, [fetchWallet, fetchTransactions, paginationInfo.size])

  // Load initial data
  useEffect(() => {
    refreshData()
  }, []) // Only run on mount

  return {
    // Data
    wallet,
    transactions,
    paginationInfo,
    
    // Loading states
    isLoadingWallet,
    isLoadingTransactions,
    isRedeemingPoints,
    
    // Error states
    walletError,
    transactionsError,
    
    // Actions
    fetchWallet,
    fetchTransactions,
    redeemPoints,
    loadNextPage,
    loadPreviousPage,
    refreshData,
  }
}
