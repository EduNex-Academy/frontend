"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Award
} from 'lucide-react'
import { usePoints } from '@/hooks/use-points'
import { formatDistanceToNow } from 'date-fns'

const PointsWallet: React.FC = () => {
  // Safe date parsing utility
  const parseDate = (dateString: string): Date => {
    try {
      // Handle ISO string or LocalDateTime format
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Fallback for invalid dates
        console.warn('Invalid date format:', dateString)
        return new Date()
      }
      return date
    } catch (error) {
      console.warn('Error parsing date:', dateString, error)
      return new Date()
    }
  }
  const {
    wallet,
    transactions,
    paginationInfo,
    isLoadingWallet,
    isLoadingTransactions,
    isRedeemingPoints,
    walletError,
    transactionsError,
    redeemPoints,
    loadNextPage,
    loadPreviousPage,
    refreshData
  } = usePoints()

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARN':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'REDEEM':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'EXPIRED':
        return <Calendar className="h-4 w-4 text-gray-600" />
      default:
        return <Coins className="h-4 w-4 text-blue-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'EARN':
        return 'text-green-600'
      case 'REDEEM':
        return 'text-red-600'
      case 'EXPIRED':
        return 'text-gray-600'
      default:
        return 'text-blue-600'
    }
  }

  if (isLoadingWallet && !wallet) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading wallet...</span>
        </div>
      </div>
    )
  }

  if (walletError && !wallet) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Wallet</h3>
        <p className="text-gray-600 mb-4">{walletError}</p>
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Show technical details
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({ error: walletError }, null, 2)}
          </pre>
        </details>
        <Button onClick={refreshData} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Current Balance</p>
                <p className="text-2xl font-bold text-blue-900">{wallet?.totalPoints?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Total Earned</p>
                <p className="text-2xl font-bold text-green-900">{wallet?.lifetimeEarned?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500 rounded-full">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Total Spent</p>
                <p className="text-2xl font-bold text-purple-900">{wallet?.lifetimeSpent?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            View your points earning and spending history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions && transactions.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading transactions...</span>
              </div>
            </div>
          ) : transactionsError ? (
            <div className="text-center p-8">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Transactions</h3>
              <p className="text-gray-600 mb-4">{transactionsError}</p>
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Show technical details
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify({ error: transactionsError }, null, 2)}
                </pre>
              </details>
              <Button onClick={refreshData} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
              <p className="text-gray-600">Your points activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.transactionType)}
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(parseDate(transaction.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.transactionType)}`}>
                        {transaction.transactionType === 'EARN' ? '+' : '-'}{transaction.points?.toLocaleString() || 0} points
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.transactionType}
                      </Badge>
                    </div>
                  </div>
                  {index < transactions.length - 1 && <Separator />}
                </div>
              ))}

              {/* Pagination */}
              {paginationInfo.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    Showing {paginationInfo.currentPage + 1} of {paginationInfo.totalPages} pages
                    ({paginationInfo.totalElements} total transactions)
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadPreviousPage}
                      disabled={!paginationInfo.hasPrevious || isLoadingTransactions}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadNextPage}
                      disabled={!paginationInfo.hasNext || isLoadingTransactions}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PointsWallet
