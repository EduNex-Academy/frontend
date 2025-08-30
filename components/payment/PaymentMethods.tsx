"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, Trash2, Star, AlertCircle, Loader2, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentApi, type PaymentMethod } from "@/lib/api/payment"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { accessToken } = useAuth()
  const { toast } = useToast()

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await paymentApi.getPaymentMethods()
      setPaymentMethods(data.paymentMethods)
      setDefaultPaymentMethodId(data.defaultPaymentMethodId)
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payment methods. Please try again.'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      setActionLoading(`remove-${paymentMethodId}`)
      
      await paymentApi.removePaymentMethod(paymentMethodId)
      
      toast({
        title: "Success",
        description: "Payment method removed successfully.",
      })
      fetchPaymentMethods()
    } catch (error) {
      console.error('Failed to remove payment method:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove payment method. Please try again.'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setActionLoading(`default-${paymentMethodId}`)
      
      await paymentApi.setDefaultPaymentMethod(paymentMethodId)
      
      toast({
        title: "Success",
        description: "Default payment method updated successfully.",
      })
      fetchPaymentMethods()
    } catch (error) {
      console.error('Failed to set default payment method:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to set default payment method. Please try again.'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getBrandIcon = (brand: string) => {
    // You can add specific brand icons here
    return <CreditCard className="h-5 w-5" />
  }

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
  }

  useEffect(() => {
    if (accessToken) {
      fetchPaymentMethods()
    }
  }, [accessToken])

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading payment methods...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Methods
              </CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Payment Methods</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchPaymentMethods} className="rounded-full">
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods</h3>
              <p className="text-gray-600 mb-4">Add a payment method to manage your subscriptions.</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="rounded-full"
              >
                Add Your First Payment Method
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-6 border border-blue-200/30 rounded-xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:border-blue-300/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    {getBrandIcon(method.brand)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 capitalize">
                        {method.brand} •••• {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Expires {formatExpiry(method.expMonth, method.expYear)}
                    </p>
                    {method.billingName && (
                      <p className="text-xs text-gray-500">{method.billingName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultPaymentMethod(method.id)}
                      disabled={actionLoading === `default-${method.id}`}
                      className="rounded-full"
                    >
                      {actionLoading === `default-${method.id}` ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Setting...
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Set Default
                        </>
                      )}
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        disabled={!!actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Payment Method</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove the {method.brand} card ending in {method.last4}? 
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="rounded-full">
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <Button
                          variant="destructive"
                          onClick={() => removePaymentMethod(method.id)}
                          disabled={actionLoading === `remove-${method.id}`}
                          className="rounded-full"
                        >
                          {actionLoading === `remove-${method.id}` ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            'Remove'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showAddForm && (
          <Elements stripe={stripePromise}>
            <AddPaymentMethodForm 
              onSuccess={() => {
                setShowAddForm(false)
                fetchPaymentMethods()
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </Elements>
        )}
      </CardContent>
    </Card>
  )
}

const AddPaymentMethodForm = ({ 
  onSuccess, 
  onCancel 
}: { 
  onSuccess: () => void
  onCancel: () => void 
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const { accessToken } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe has not loaded yet. Please try again.",
        variant: "destructive",
      })
      return
    }
    
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast({
        title: "Error",
        description: "Card element not found. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    setCardError(null)
    
    try {
      // Create setup intent
      const setupData = await paymentApi.createSetupIntent()
      
      // Confirm setup intent with card
      const { error, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Customer Name', // You might want to get this from user profile
            },
          }
        }
      )
      
      if (error) {
        setCardError(error.message || 'An error occurred while processing your card.')
        return
      }
      
      if (!setupIntent) {
        throw new Error('Setup intent confirmation failed')
      }
      
      // Attach payment method
      await paymentApi.attachPaymentMethod({
        paymentMethodId: setupIntent.payment_method as string,
        setAsDefault: true
      })
      
      toast({
        title: "Success",
        description: "Payment method added successfully.",
      })
      onSuccess()
      
    } catch (error) {
      console.error('Failed to add payment method:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add payment method. Please try again.'
      setCardError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <div className="mt-6 p-6 border border-blue-200/30 rounded-xl bg-white/60 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Payment Method</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
          <CardElement 
            options={cardElementOptions}
            onChange={(event) => {
              setCardError(event.error ? event.error.message : null)
            }}
          />
        </div>
        {cardError && (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {cardError}
          </div>
        )}
        <div className="flex items-center gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!stripe || loading}
            className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Payment Method'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PaymentMethods
