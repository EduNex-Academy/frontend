import { useState, useEffect, useCallback } from 'react'
import { subscriptionApi, type SubscriptionPlan, type UserSubscription, type CreateSubscriptionRequest, type CreateSubscriptionResponse } from '@/lib/api/subscription'
import { useToast } from './use-toast'

interface UseSubscriptionReturn {
  // Data
  plans: SubscriptionPlan[]
  userSubscriptions: UserSubscription[]
  activeSubscription: UserSubscription | null
  currentPlan: SubscriptionPlan | null
  
  // Loading states
  isLoadingPlans: boolean
  isLoadingSubscriptions: boolean
  isCancellingSubscription: boolean
  isCreatingSubscription: boolean
  
  // Error states
  plansError: string | null
  subscriptionsError: string | null
  
  // Actions
  fetchPlans: () => Promise<void>
  fetchUserSubscriptions: () => Promise<void>
  cancelSubscription: (subscriptionId: string) => Promise<void>
  activateSubscription: (subscriptionId: string) => Promise<void>
  createSubscription: (subscriptionData: CreateSubscriptionRequest) => Promise<CreateSubscriptionResponse>
  getPlansByBillingCycle: (planName: string, billingCycle: 'MONTHLY' | 'YEARLY') => SubscriptionPlan[]
  getGroupedPlans: () => Record<string, SubscriptionPlan[]>
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { toast } = useToast()
  
  // Data states
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  
  // Loading states
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false)
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false)
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false)
  
  // Error states
  const [plansError, setPlansError] = useState<string | null>(null)
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null)

  // Fetch all subscription plans
  const fetchPlans = useCallback(async () => {
    try {
      setIsLoadingPlans(true)
      setPlansError(null)
      const fetchedPlans = await subscriptionApi.getAllPlans()
      setPlans(fetchedPlans)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subscription plans'
      setPlansError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoadingPlans(false)
    }
  }, [toast])

  // Fetch user's subscriptions
  const fetchUserSubscriptions = useCallback(async () => {
    try {
      setIsLoadingSubscriptions(true)
      setSubscriptionsError(null)
      
      const [subscriptions, activeSub] = await Promise.all([
        subscriptionApi.getUserSubscriptions(),
        subscriptionApi.getActiveSubscription()
      ])
      
      setUserSubscriptions(subscriptions)
      setActiveSubscription(activeSub)
      
      // If user has an active subscription, find the current plan details
      if (activeSub && plans.length > 0) {
        const plan = plans.find(p => p.id === activeSub.plan.id)
        setCurrentPlan(plan || activeSub.plan)
      } else {
        setCurrentPlan(null)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user subscriptions'
      setSubscriptionsError(errorMessage)
      console.error('Failed to fetch user subscriptions:', errorMessage)
    } finally {
      setIsLoadingSubscriptions(false)
    }
  }, [plans])

  // Cancel subscription
  const cancelSubscription = useCallback(async (subscriptionId: string) => {
    try {
      setIsCancellingSubscription(true)
      await subscriptionApi.cancelSubscription(subscriptionId)
      
      // Refresh subscription data
      await fetchUserSubscriptions()
      
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully.',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsCancellingSubscription(false)
    }
  }, [fetchUserSubscriptions, toast])

  // Activate subscription
  const activateSubscription = useCallback(async (subscriptionId: string) => {
    try {
      await subscriptionApi.activateSubscription(subscriptionId)
      
      // Refresh subscription data
      await fetchUserSubscriptions()
      
      toast({
        title: 'Success',
        description: 'Subscription activated successfully.',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate subscription'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    }
  }, [fetchUserSubscriptions, toast])

  // Create subscription
  const createSubscription = useCallback(async (subscriptionData: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> => {
    try {
      setIsCreatingSubscription(true)
      const response = await subscriptionApi.createSubscription(subscriptionData)
      
      toast({
        title: 'Success',
        description: 'Subscription created successfully. Please complete the payment.',
      })
      
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsCreatingSubscription(false)
    }
  }, [toast])

  // Helper function to get plans by billing cycle
  const getPlansByBillingCycle = useCallback((planName: string, billingCycle: 'MONTHLY' | 'YEARLY') => {
    return plans.filter(plan => 
      plan.name.toLowerCase() === planName.toLowerCase() && 
      plan.billingCycle === billingCycle &&
      plan.isActive
    )
  }, [plans])

  // Helper function to get grouped plans (by name)
  const getGroupedPlans = useCallback(() => {
    const grouped: Record<string, SubscriptionPlan[]> = {}
    
    plans
      .filter(plan => plan.isActive)
      .forEach(plan => {
        if (!grouped[plan.name]) {
          grouped[plan.name] = []
        }
        grouped[plan.name].push(plan)
      })
    
    // Sort each group by billing cycle (MONTHLY first, then YEARLY)
    Object.keys(grouped).forEach(planName => {
      grouped[planName].sort((a, b) => {
        if (a.billingCycle === 'MONTHLY' && b.billingCycle === 'YEARLY') return -1
        if (a.billingCycle === 'YEARLY' && b.billingCycle === 'MONTHLY') return 1
        return 0
      })
    })
    
    return grouped
  }, [plans])

  // Update current plan when active subscription or plans change
  useEffect(() => {
    if (activeSubscription && plans.length > 0) {
      const plan = plans.find(p => p.id === activeSubscription.plan.id)
      setCurrentPlan(plan || activeSubscription.plan)
    } else {
      setCurrentPlan(null)
    }
  }, [activeSubscription, plans])

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  // Fetch user subscriptions when plans are loaded
  useEffect(() => {
    if (plans.length > 0) {
      fetchUserSubscriptions()
    }
  }, [plans.length, fetchUserSubscriptions])

  return {
    // Data
    plans,
    userSubscriptions,
    activeSubscription,
    currentPlan,
    
    // Loading states
    isLoadingPlans,
    isLoadingSubscriptions,
    isCancellingSubscription,
    isCreatingSubscription,
    
    // Error states
    plansError,
    subscriptionsError,
    
    // Actions
    fetchPlans,
    fetchUserSubscriptions,
    cancelSubscription,
    activateSubscription,
    createSubscription,
    getPlansByBillingCycle,
    getGroupedPlans,
  }
}
