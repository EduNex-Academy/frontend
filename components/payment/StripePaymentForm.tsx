"use client"

import React, { useState, useEffect, useRef } from 'react'
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
import { useSubscription } from '@/hooks/use-subscription'
import { subscriptionApi } from '@/lib/api/subscription'
import { useToast } from '@/hooks/use-toast'
import type { SubscriptionPlan } from '@/lib/api/subscription'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Add debug logging for Stripe key
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
} else {
  console.log('Stripe key present:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 10) + '...')
}

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
  const { completeSubscription, isCompletingSubscription } = useSubscription()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [customerId, setCustomerId] = useState<string>('')
  const [setupComplete, setSetupComplete] = useState(false)
  const [setupInitialized, setSetupInitialized] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  
  // Track the current initialization key to prevent unnecessary re-initializations
  const initKeyRef = useRef<string>('')
  const initializationStartedRef = useRef<boolean>(false)

  // Setup subscription when component mounts
  useEffect(() => {
    const currentInitKey = `${plan.id}-${billingCycle}-${userEmail}`
    
    // If we've already started initialization, don't do it again
    if (initializationStartedRef.current) {
      console.log('Initialization already started, skipping')
      return
    }
    
    // If we already initialized with the same parameters, don't do it again
    if (setupInitialized && initKeyRef.current === currentInitKey) {
      console.log('Setup already initialized for key:', currentInitKey)
      return
    }
    
    // If already in progress, don't start another
    if (isSettingUp) {
      console.log('Setup already in progress, skipping')
      return
    }
    
    // Only initialize once per unique combination
    if (initKeyRef.current === currentInitKey) {
      console.log('Already processed this key:', currentInitKey)
      return
    }
    
    const initializeSetup = async () => {
      try {
        console.log('Starting setup initialization for key:', currentInitKey)
        initializationStartedRef.current = true
        setIsSettingUp(true)
        initKeyRef.current = currentInitKey
        
        const requestData = {
          planId: plan.id,
          billingCycle: billingCycle,
          email: userEmail
        }
        
        console.log('Initializing setup with data:', requestData)
        console.log('Plan object:', plan)
        
        const setupResponse = await subscriptionApi.setupSubscription(requestData)
        
        // Extract fields using the actual backend response structure
        const clientSecret = setupResponse.setup_intent_client_secret || setupResponse.clientSecret
        const customerId = setupResponse.customer_id || setupResponse.customerId
        
        setClientSecret(clientSecret || '')
        setCustomerId(customerId || '')
        setSetupInitialized(true) // Only set after successful API call
        
        if (!clientSecret || !customerId) {
          throw new Error('Setup response missing required fields: clientSecret or customerId')
        }
        
        console.log('Setup initialization completed successfully')
      } catch (error) {
        console.error('Setup initialization failed:', error)
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          response: (error as any)?.response?.data || 'No response data'
        })
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment setup'
        onError(errorMessage)
        setSetupInitialized(false) // Reset on error so it can be retried
        initKeyRef.current = '' // Reset the key on error
        initializationStartedRef.current = false // Reset the flag on error
      } finally {
        setIsSettingUp(false)
      }
    }

    initializeSetup()
  }, [plan.id, billingCycle, userEmail])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements || !clientSecret || !customerId) {
      return
    }

    setIsProcessing(true)

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Confirm setup intent
      const { error: setupError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: userEmail,
          },
        },
      })

      if (setupError) {
        throw new Error(setupError.message)
      }

      if (setupIntent?.status === 'succeeded') {
        setSetupComplete(true)
        
        // Complete the subscription after successful payment method setup
        try {
          const subscription = await completeSubscription(customerId, plan.id)
          
          // Check the actual subscription status
          if (subscription.status === 'ACTIVE') {
            toast({
              title: 'Subscription Activated!',
              description: `Welcome to ${plan.name}! Your subscription is now active.`,
            })
            onSuccess(subscription.id)
          } else if (subscription.status === 'PENDING') {
            toast({
              title: 'Subscription Created',
              description: `Your ${plan.name} subscription is being processed. You'll be notified once it's active.`,
            })
            onSuccess(subscription.id)
          } else {
            toast({
              title: 'Subscription Status: ' + subscription.status,
              description: `Your subscription has been created with status: ${subscription.status}`,
            })
            onSuccess(subscription.id)
          }
        } catch (subscriptionError) {
          const subscriptionErrorMessage = subscriptionError instanceof Error 
            ? subscriptionError.message 
            : 'Failed to complete subscription'
          onError(`Payment method setup succeeded but subscription creation failed: ${subscriptionErrorMessage}`)
        }
      } else {
        throw new Error('Payment method setup not completed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment setup failed'
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const isLoading = isSettingUp || isProcessing || isCompletingSubscription
  const isButtonDisabled = !stripe || isLoading || !clientSecret || !cardComplete

  return (
    <div className="w-full">
      {/* Security Notice */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Secured by Stripe</span>
        </div>
      </div>

      {/* Setup Complete Status */}
      {setupComplete && (
        <div className="bg-green-50 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Payment method setup complete</span>
          </div>
        </div>
      )}

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-xs">
          <div className="font-medium text-yellow-800 mb-2">Debug Info:</div>
          <div className="space-y-1 text-yellow-700">
            <div>Stripe: {stripe ? '✅ Loaded' : '❌ Loading...'}</div>
            <div>Client Secret: {clientSecret ? '✅ Present' : '❌ Missing'}</div>
            <div>Customer ID: {customerId ? '✅ Present' : '❌ Missing'}</div>
            <div>Card Complete: {cardComplete ? '✅ Yes' : '❌ No'}</div>
            <div>Setup Loading: {isSettingUp ? '🔄 Yes' : '✅ No'}</div>
            <div>Button Disabled: {isButtonDisabled ? '❌ Yes' : '✅ No'}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <CardElement
              onChange={(event) => {
                setCardComplete(event.complete)
              }}
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
            <span className="text-sm text-gray-600">Subscription Amount:</span>
            <span className="font-bold text-lg text-gray-900">${plan.price}/{plan.billingCycle.toLowerCase()}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Points Awarded:</span>
            <span className="text-xs font-medium text-gray-700">{plan.pointsAwarded} points</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isButtonDisabled}
            className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingUp ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isCompletingSubscription ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe Now
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="text-xs text-gray-500 text-center mt-4">
        Secure payment powered by Stripe • No setup fees
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
