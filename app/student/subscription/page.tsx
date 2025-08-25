"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, CheckCircle, XCircle, Star, Crown, Zap, Calendar, DollarSign, Receipt, Users, Loader2, ArrowLeft, X } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import StripePaymentForm from "@/components/payment/StripePaymentForm"
import StripeProvider from "@/components/payment/StripeProvider"
import PointsWallet from "@/components/points/PointsWallet"
import type { SubscriptionPlan } from "@/lib/api/subscription"

// Extended plan type for display
interface DisplayPlan extends SubscriptionPlan {
  icon: any
  color: string
  bgColor: string
  accent: string
  popular?: boolean
}

// Plan configuration with icons and styling
const planConfig: Record<string, {
  icon: any
  color: string
  bgColor: string
  accent: string
  features: string[]
  popular?: boolean
}> = {
  Basic: {
    icon: Star,
    color: "gray",
    bgColor: "bg-gray-50",
    accent: "from-gray-400 to-gray-600",
    features: [
      "Access to 50+ courses",
      "Basic progress tracking", 
      "Community access",
      "Mobile app access"
    ]
  },
  Plus: {
    icon: Crown,
    color: "blue",
    bgColor: "bg-blue-50",
    accent: "from-blue-500 to-blue-600",
    popular: true,
    features: [
      "Access to 200+ courses",
      "Advanced progress tracking",
      "Priority support", 
      "Downloadable resources",
      "Certificates of completion",
      "Live Q&A sessions"
    ]
  },
  Pro: {
    icon: Zap,
    color: "purple", 
    bgColor: "bg-purple-50",
    accent: "from-purple-500 to-purple-600",
    features: [
      "Unlimited course access",
      "Custom learning paths",
      "Team management",
      "Advanced analytics", 
      "1-on-1 mentoring",
      "API access"
    ]
  }
}

const paymentMethods = [
  {
    id: "1",
    type: "card",
    last4: "4242",
    brand: "Visa",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: "2",
    type: "card",
    last4: "5555",
    brand: "Mastercard",
    expiryMonth: 8,
    expiryYear: 2024,
    isDefault: false,
  },
]

export default function SubscriptionPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const {
    plans,
    userSubscriptions,
    activeSubscription,
    currentPlan,
    isLoadingPlans,
    isLoadingSubscriptions,
    isCancellingSubscription,
    plansError,
    cancelSubscription,
    activateSubscription,
    getGroupedPlans
  } = useSubscription()

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  
  // Group plans by name and get the ones for current billing cycle
  const groupedPlans = useMemo(() => getGroupedPlans(), [getGroupedPlans])
  const displayPlans = useMemo(() => {
    return Object.entries(groupedPlans).map(([planName, planVariants]) => {
      const selectedPlan = planVariants.find(p => p.billingCycle === billingCycle) || planVariants[0]
      const config = planConfig[planName as keyof typeof planConfig]
      
      return {
        ...selectedPlan,
        ...config,
        features: config?.features || selectedPlan.features || [],
        popular: config?.popular || false
      } as DisplayPlan
    }).filter(plan => plan.isActive)
  }, [groupedPlans, billingCycle])
  
  const [billingHistory] = useState([
    {
      id: "1",
      date: "2024-01-15",
      amount: currentPlan?.price || 0,
      status: "paid",
      plan: currentPlan ? `${currentPlan.name} ${currentPlan.billingCycle.toLowerCase()}` : "Unknown",
    },
    {
      id: "2", 
      date: "2023-12-15",
      amount: currentPlan?.price || 0,
      status: "paid",
      plan: currentPlan ? `${currentPlan.name} ${currentPlan.billingCycle.toLowerCase()}` : "Unknown",
    },
    {
      id: "3",
      date: "2023-11-15", 
      amount: currentPlan?.price || 0,
      status: "paid",
      plan: currentPlan ? `${currentPlan.name} ${currentPlan.billingCycle.toLowerCase()}` : "Unknown",
    },
  ])

  const handleUpgrade = async (plan: DisplayPlan) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive"
      })
      return
    }

    // Check if user has an active subscription
    if (activeSubscription && activeSubscription.status === 'ACTIVE') {
      toast({
        title: "Cancel Current Plan First",
        description: "Please cancel your current subscription before switching to a new plan.",
        variant: "destructive"
      })
      return
    }
    
    setSelectedPlan(plan)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = async (subscriptionId?: string) => {
    if (!selectedPlan) return

    try {
      // Activate the subscription after it was created in the payment form
      if (subscriptionId) {
        await activateSubscription(subscriptionId)
      }
      
      setShowPaymentForm(false)
      setSelectedPlan(null)
      toast({
        title: "Payment Successful",
        description: `Successfully subscribed to ${selectedPlan.name} plan!`,
      })
    } catch (error) {
      console.error('Error after payment success:', error)
      toast({
        title: "Activation Error",
        description: "Payment was processed but subscription activation failed. Please contact support.",
        variant: "destructive"
      })
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    })
  }

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return
    
    try {
      await cancelSubscription(activeSubscription.id)
      setShowCancelDialog(false)
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been successfully cancelled. You can now subscribe to a different plan.",
        variant: "default"
      })
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error('Failed to cancel subscription:', error)
    }
  }

  const handleAddPaymentMethod = () => {
    // TODO: Implement payment method addition
    toast({
      title: "Coming Soon",
      description: "Payment method management will be available soon.",
    })
  }

  // Loading state
  if (isLoadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading subscription plans...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (plansError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Plans</h2>
          <p className="text-gray-600">{plansError}</p>
        </div>
      </div>
    )
  }

  return (
    <StripeProvider>
      <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-blue-200/30 p-1 rounded-full">
            <TabsTrigger value="plans" className="rounded-full">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="billing" className="rounded-full">Billing History</TabsTrigger>
            <TabsTrigger value="payment" className="rounded-full">Payment Methods</TabsTrigger>
            <TabsTrigger value="points" className="rounded-full">Points Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Current Plan */}
            {activeSubscription && currentPlan && (
              <div className="relative group cursor-pointer transition-all duration-700 hover:bg-white/90 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/40 p-6 h-32">
                {/* Animated Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${planConfig[currentPlan.name as keyof typeof planConfig]?.accent || 'from-blue-400 to-blue-600'} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>

                {/* Main Content */}
                <div className="relative z-10 flex items-center justify-between h-full">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 bg-gradient-to-br ${planConfig[currentPlan.name as keyof typeof planConfig]?.accent || 'from-blue-400 to-blue-600'} rounded-full shadow-lg`}>
                      {(() => {
                        const config = planConfig[currentPlan.name as keyof typeof planConfig]
                        const Icon = config?.icon || Star
                        return <Icon className="h-8 w-8 text-white" />
                      })()}
                    </div>
                    <div>
                      <div className={`text-2xl font-black text-slate-800 mb-1 leading-none group-hover:text-${planConfig[currentPlan.name as keyof typeof planConfig]?.color || 'blue'}-600 transition-colors duration-300`}>
                        Current Plan
                      </div>
                      <div className={`text-sm font-bold text-slate-700 uppercase tracking-wider group-hover:text-${planConfig[currentPlan.name as keyof typeof planConfig]?.color || 'blue'}-700 transition-colors duration-300`}>
                        {currentPlan.name} • ${currentPlan.price}/{currentPlan.billingCycle.toLowerCase()}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {currentPlan.pointsAwarded} points awarded
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {activeSubscription.status === 'ACTIVE' && (
                      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isCancellingSubscription}
                            className="rounded-md px-6 py-2 bg-white/80 backdrop-blur-sm border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                          >
                            Cancel Plan
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <X className="h-5 w-5 text-red-500" />
                              Cancel Subscription
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to cancel your <strong>{currentPlan.name}</strong> subscription? 
                              This action cannot be undone and you'll lose access to premium features.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowCancelDialog(false)}
                              className="rounded-full"
                            >
                              Keep Subscription
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleCancelSubscription}
                              disabled={isCancellingSubscription}
                              className="rounded-full"
                            >
                              {isCancellingSubscription ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                'Yes, Cancel Plan'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Bottom Progress Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl">
                  <div className={`h-full bg-gradient-to-r ${planConfig[currentPlan.name as keyof typeof planConfig]?.accent || 'from-blue-400 to-blue-600'} transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-out rounded-b-xl`}></div>
                </div>

                {/* Side Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${planConfig[currentPlan.name as keyof typeof planConfig]?.accent || 'from-blue-400 to-blue-600'} transform scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-500 delay-200 rounded-l-xl`}></div>

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 bg-${planConfig[currentPlan.name as keyof typeof planConfig]?.color || 'blue'}-400 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-1000 group-hover:animate-ping`}
                      style={{
                        top: `${20 + i * 25}%`,
                        left: `${15 + i * 30}%`,
                        animationDelay: `${i * 300}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* No Subscription Message */}
            {!isLoadingSubscriptions && !activeSubscription && (
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                    <p className="text-gray-600 mb-4">Choose a plan below to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-blue-200/30">
                <Button
                  variant={billingCycle === 'MONTHLY' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingCycle('MONTHLY')}
                  className="rounded-full"
                >
                  Monthly
                </Button>
                <Button
                  variant={billingCycle === 'YEARLY' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBillingCycle('YEARLY')}
                  className="rounded-full"
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                    Save 20%
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Available Plans */}
            {activeSubscription && activeSubscription.status === 'ACTIVE' && (
              <Card className="bg-amber-50/80 border-amber-200/50">
                <CardContent className="flex items-center justify-center py-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">Plan Change Notice</span>
                    </div>
                    <p className="text-amber-600 text-sm">
                      To switch to a different plan, please cancel your current <strong>{currentPlan?.name}</strong> subscription first.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayPlans.map((plan) => {
                const Icon = plan.icon
                const isCurrentPlan = currentPlan?.id === plan.id

                return (
                  <Card
                    key={plan.id}
                    className={`relative bg-white/70 backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular
                        ? "ring-2 ring-blue-500 border-blue-200/50 shadow-lg"
                        : "border-blue-200/30 hover:border-blue-300/50"
                      }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 shadow-lg">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className={`${plan.bgColor} rounded-t-lg transition-all duration-300 hover:${plan.bgColor.replace('50', '100')}`}>
                      <div className="flex items-center justify-center mb-4">
                        <div className={`p-3 rounded-full ${plan.bgColor.replace('50', '200')}`}>
                          <Icon className={`h-8 w-8 text-${plan.color}-600`} />
                        </div>
                      </div>
                      <CardTitle className="text-center text-xl">{plan.name}</CardTitle>
                      <div className="text-center">
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600">/{plan.billingCycle.toLowerCase()}</span>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        {plan.pointsAwarded} points awarded
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <div className="p-1 bg-green-100 rounded-full">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${isCurrentPlan
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : activeSubscription && activeSubscription.status === 'ACTIVE'
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                              : plan.popular
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                                : "bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                          }`}
                        disabled={!!isCurrentPlan || !!(activeSubscription && activeSubscription.status === 'ACTIVE')}
                        onClick={() => handleUpgrade(plan)}
                      >
                        {isCurrentPlan ? (
                          "Current Plan"
                        ) : activeSubscription && activeSubscription.status === 'ACTIVE' ? (
                          "Cancel Current Plan First"
                        ) : plan.popular ? (
                          "Get Started"
                        ) : (
                          "Choose Plan"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Billing History
                </CardTitle>
                <CardDescription>View your past payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-6 border border-blue-200/30 rounded-xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:border-blue-300/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${bill.status === "paid" ? "bg-green-100" : "bg-red-100"
                          }`}>
                          {bill.status === "paid" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{bill.plan}</p>
                          <p className="text-sm text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">${bill.amount}</p>
                        <Badge
                          variant={bill.status === "paid" ? "default" : "destructive"}
                          className={`${bill.status === "paid" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}`}
                        >
                          {bill.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
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
                    onClick={handleAddPaymentMethod}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-6 border border-blue-200/30 rounded-xl bg-white/60 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:border-blue-300/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {method.brand} ending in {method.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {method.isDefault && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border border-blue-200">
                            Default
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <PointsWallet />
          </TabsContent>
        </Tabs>

        {/* Stripe Payment Form Modal */}
        {showPaymentForm && selectedPlan && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Complete Your Subscription</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePaymentCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-6 py-4">
                {/* Plan Summary */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <selectedPlan.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{selectedPlan.name} Plan</span>
                      <div className="text-sm text-gray-600">
                        {selectedPlan.pointsAwarded} points awarded
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-bold text-gray-900">${selectedPlan.price}</span>
                    <span className="text-sm text-gray-600">
                      /{selectedPlan.billingCycle.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Payment Form */}
                <StripePaymentForm
                  plan={selectedPlan}
                  billingCycle={selectedPlan.billingCycle}
                  userEmail={user?.email || ''}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    toast({
                      title: "Payment Error",
                      description: error,
                      variant: "destructive"
                    })
                  }}
                  onCancel={handlePaymentCancel}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </StripeProvider>
  )
}
