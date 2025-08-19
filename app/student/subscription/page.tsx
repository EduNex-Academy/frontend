"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCards } from "@/components/common/StatsCards"
import { CreditCard, CheckCircle, XCircle, Star, Crown, Zap, Calendar, DollarSign, Receipt, Users } from "lucide-react"

const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    interval: "month",
    features: ["Access to 50+ courses", "Basic progress tracking", "Community access", "Mobile app access"],
    icon: Star,
    color: "gray",
    bgColor: "bg-gray-50",
    accent: "from-gray-400 to-gray-600",
  },
  {
    id: "pro",
    name: "Pro",
    price: 59,
    interval: "month",
    features: [
      "Access to 200+ courses",
      "Advanced progress tracking",
      "Priority support",
      "Downloadable resources",
      "Certificates of completion",
      "Live Q&A sessions",
    ],
    icon: Crown,
    color: "blue",
    bgColor: "bg-blue-50",
    accent: "from-blue-500 to-blue-600",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    interval: "month",
    features: [
      "Unlimited course access",
      "Custom learning paths",
      "Team management",
      "Advanced analytics",
      "1-on-1 mentoring",
      "API access",
    ],
    icon: Zap,
    color: "purple",
    bgColor: "bg-purple-50",
    accent: "from-purple-500 to-purple-600",
  },
]

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
  const [currentPlan] = useState("pro")
  
  // Get current plan data
  const currentPlanData = subscriptionPlans.find(plan => plan.id === currentPlan) || subscriptionPlans[1]
  
  const [billingHistory] = useState([
    {
      id: "1",
      date: "2024-01-15",
      amount: 59,
      status: "paid",
      plan: "Pro Monthly",
    },
    {
      id: "2",
      date: "2023-12-15",
      amount: 59,
      status: "paid",
      plan: "Pro Monthly",
    },
    {
      id: "3",
      date: "2023-11-15",
      amount: 59,
      status: "paid",
      plan: "Pro Monthly",
    },
  ])

  const handleUpgrade = (planId: string) => {
    // TODO: Implement Stripe/PayPal payment processing
    console.log("Upgrading to plan:", planId)
  }

  const handleAddPaymentMethod = () => {
    // TODO: Implement payment method addition
    console.log("Adding payment method")
  }

  return (
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
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Current Plan */}
            <div className="relative group cursor-pointer transition-all duration-700 hover:bg-white/90 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/40 p-6 h-32">
              {/* Animated Background Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentPlanData.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>

              {/* Main Content */}
              <div className="relative z-10 flex items-center justify-between h-full">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-gradient-to-br ${currentPlanData.accent} rounded-full shadow-lg`}>
                    <currentPlanData.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className={`text-2xl font-black text-slate-800 mb-1 leading-none group-hover:text-${currentPlanData.color}-600 transition-colors duration-300`}>
                      Current Plan
                    </div>
                    <div className={`text-sm font-bold text-slate-700 uppercase tracking-wider group-hover:text-${currentPlanData.color}-700 transition-colors duration-300`}>
                      {currentPlanData.name} • ${currentPlanData.price}/month
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Next billing: Feb 15, 2024
                    </div>
                  </div>
                </div>
                <Badge className={`bg-gradient-to-r ${currentPlanData.accent} text-white px-4 py-2 text-sm shadow-lg`}>Active</Badge>
              </div>

              {/* Bottom Progress Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl">
                <div className={`h-full bg-gradient-to-r ${currentPlanData.accent} transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-700 ease-out rounded-b-xl`}></div>
              </div>

              {/* Side Accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${currentPlanData.accent} transform scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-500 delay-200 rounded-l-xl`}></div>

              {/* Floating Particles Effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-1 h-1 bg-${currentPlanData.color}-400 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-1000 group-hover:animate-ping`}
                    style={{
                      top: `${20 + i * 25}%`,
                      left: `${15 + i * 30}%`,
                      animationDelay: `${i * 300}ms`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Available Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon
                const isCurrentPlan = plan.id === currentPlan

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
                        <span className="text-gray-600">/{plan.interval}</span>
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
                            : plan.popular
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                              : "bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                          }`}
                        disabled={isCurrentPlan}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {isCurrentPlan ? "Current Plan" : plan.popular ? "Upgrade Now" : "Choose Plan"}
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
        </Tabs>
      </div>
    </div>
  )
}
