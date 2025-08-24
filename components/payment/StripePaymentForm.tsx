"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { paymentApi } from '@/lib/api/payment'
import { useSubscription } from '@/hooks/use-subscription'
import { useToast } from '@/hooks/use-toast'
import type { SubscriptionPlan } from '@/lib/api/subscription'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  plan: SubscriptionPlan
  billingCycle: 'MONTHLY' | 'YEARLY'
  userEmail: string
  onSuccess: (subscriptionId?: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  plan,
  billingCycle,
  userEmail,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const { createSubscription, isCreatingSubscription } = useSubscription()
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [paymentIntentId, setPaymentIntentId] = useState<string>('')

  // Create payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      try {
        const paymentIntent = await paymentApi.createPaymentIntent({
          planId: plan.id,
          amount: plan.price,
          currency: plan.currency,
          email: userEmail
        })
        
        setClientSecret(paymentIntent.clientSecret)
        setPaymentIntentId(paymentIntent.paymentIntentId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment'
        onError(errorMessage)
      }
    }

    initializePayment()
  }, [plan, userEmail, onError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: userEmail,
        },
      })

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message)
      }

      // Confirm payment intent
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create the subscription after successful payment
        try {
          const subscriptionResponse = await createSubscription({
            planId: plan.id,
            billingCycle: billingCycle,
            email: userEmail
          })
          
          toast({
            title: 'Payment Successful!',
            description: `Successfully subscribed to ${plan.name}`,
          })
          onSuccess(subscriptionResponse.subscriptionId)
        } catch (subscriptionError) {
          const subscriptionErrorMessage = subscriptionError instanceof Error 
            ? subscriptionError.message 
            : 'Failed to create subscription'
          onError(`Payment succeeded but subscription creation failed: ${subscriptionErrorMessage}`)
        }
      } else {
        throw new Error('Payment not completed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full">
      {/* Security Notice */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Secured by Stripe</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Compact Summary */}
        <div className="bg-gray-50 p-3 rounded-lg border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="font-bold text-lg text-gray-900">${plan.price}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isCreatingSubscription ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Subscription...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${plan.price}
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="text-xs text-gray-500 text-center mt-4">
        Secure payment powered by Stripe
      </div>
    </div>
  )
}

interface StripePaymentWrapperProps extends PaymentFormProps {}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}

export default StripePaymentWrapper
