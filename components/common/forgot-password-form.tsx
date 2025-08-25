"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserType } from "@/components/layout/UserTypeContext"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const { toast } = useToast()
  const { userType } = useUserType()
  const router = useRouter()

  // Countdown effect for redirect
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showSuccess && countdown === 0) {
      router.push("/auth/login")
    }
  }, [showSuccess, countdown, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.auth.sendPasswordReset(email, userType)
      setIsEmailSent(true)
      
      // Show initial success message
      toast({
        title: "Success",
        description: "Password reset email sent successfully",
      })
      
      // After a short delay, show success state and start countdown
      setTimeout(() => {
        setShowSuccess(true)
        toast({
          title: "Email Sent Successfully",
          description: "Check your email for password reset instructions. Redirecting to login...",
        })
      }, 1500)
      
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send password reset email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="h-full flex flex-col justify-center">
        <CardHeader className="px-0 pb-6">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-900 text-center">Reset Email Sent!</CardTitle>
          <p className="text-gray-600 text-center">
            Password reset instructions have been sent to your email address.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700 text-center">
              Please check your email and follow the instructions to reset your password.
            </p>
          </div>
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              Redirecting to login in <span className="font-semibold text-blue-600">{countdown}</span> seconds...
            </p>
          </div>
          <Button 
            className="w-full h-10 bg-blue-600 hover:bg-blue-700" 
            onClick={() => router.push("/auth/login")}
          >
            Go to Login Now
          </Button>
        </CardContent>
      </div>
    )
  }

  if (isEmailSent && !showSuccess) {
    return (
      <div className="h-full flex flex-col justify-center">
        <CardHeader className="px-0 pb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900 text-center">Sending Reset Email</CardTitle>
          <p className="text-gray-600 text-center">
            Please wait while we send the password reset email to <strong>{email}</strong>
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <p className="text-sm text-gray-600 text-center">
            This will only take a moment...
          </p>
        </CardContent>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col justify-center">
      <CardHeader className="px-0 pb-6">
        <CardTitle className="text-2xl font-bold text-blue-900 text-center">Forgot Password</CardTitle>
        <p className="text-gray-600 text-center">
          Enter your email address and we'll send you a password reset link
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full border rounded px-3"
              required
            />
          </div>
          <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </div>
  )
}
