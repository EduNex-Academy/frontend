"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Receipt, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getPaymentApiUrl } from "@/lib/api/endpoints"

interface BillingHistoryItem {
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

interface BillingHistoryResponse {
  success: boolean
  message: string
  data: {
    history: BillingHistoryItem[]
    totalCount: number
    hasMore: boolean
  }
}

export default function BillingHistory() {
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuth()
  const { toast } = useToast()

  const fetchBillingHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(getPaymentApiUrl('api/v1/payments/billing-history?limit=50'), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: BillingHistoryResponse = await response.json()
      
      if (data.success) {
        setBillingHistory(data.data.history)
      } else {
        throw new Error(data.message || 'Failed to fetch billing history')
      }
    } catch (error) {
      console.error('Failed to fetch billing history:', error)
      setError('Failed to load billing history. Please try again.')
      toast({
        title: "Error",
        description: "Failed to load billing history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchBillingHistory()
    }
  }, [accessToken])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700 hover:bg-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-700 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
      }).format(amount)
    } catch {
      return `${currency.toUpperCase()} ${amount}`
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Billing History
          </CardTitle>
          <CardDescription>View your past payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading billing history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Billing History
          </CardTitle>
          <CardDescription>View your past payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Billing History</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchBillingHistory} className="rounded-full">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          Billing History
        </CardTitle>
        <CardDescription>View your past payments and invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {billingHistory.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Billing History</h3>
              <p className="text-gray-600">No payment records found for your account.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {billingHistory.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-6 border border-blue-200/30 rounded-xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:border-blue-300/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    bill.status.toLowerCase() === "paid" 
                      ? "bg-green-100" 
                      : bill.status.toLowerCase() === "pending"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}>
                    {getStatusIcon(bill.status)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bill.description}</p>
                    <p className="text-sm text-gray-600">{bill.subscriptionName}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(bill.date)} • {bill.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatAmount(bill.amount, bill.currency)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(bill.status)}
                    >
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </Badge>
                  </div>
                  {bill.invoiceUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(bill.invoiceUrl, '_blank')}
                      className="rounded-full flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Invoice
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
