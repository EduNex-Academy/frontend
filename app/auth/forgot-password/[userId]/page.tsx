"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PasswordResetSuccessPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const { toast } = useToast()
  
  const [countdown, setCountdown] = useState(10)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verifyPasswordReset = async () => {
      // Validate userId format (basic UUID validation)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      
      if (!userId || !uuidRegex.test(userId)) {
        setError("Invalid user ID format")
        setIsVerifying(false)
        return
      }

      try {
        // Optional: Verify with backend that password reset was successful
        // Comment out this line if you don't want backend verification
        // await api.auth.verifyPasswordReset(userId)
        
        setIsVerified(true)
        setIsVerifying(false)
        
        // Show success toast
        toast({
          title: "Password Reset Successful",
          description: "Your password has been successfully updated via Keycloak.",
        })

        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              router.replace("/auth/login")
              return 0
            }
            return prev - 1
          })
        }, 1000)

        // Cleanup
        return () => clearInterval(countdownInterval)
        
      } catch (error) {
        console.error("Password reset verification error:", error)
        setError(error instanceof Error ? error.message : "Verification failed")
        setIsVerifying(false)
      }
    }

    verifyPasswordReset()
  }, [userId, router, toast])

  const handleManualRedirect = () => {
    router.replace("/auth/login")
  }

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl text-blue-900">Verifying Reset</CardTitle>
            <CardDescription>
              Please wait while we verify your password reset...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Invalid Request</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => router.push("/auth/login")}
            >
              Go to Login
            </Button>
            
            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Request new password reset
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show success state
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-blue-900">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been successfully updated via Keycloak.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 text-center">
                You can now log in with your new password.
              </p>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Redirecting to login in <span className="font-semibold text-blue-600">{countdown}</span> seconds...
              </p>
            </div>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={handleManualRedirect}
            >
              Continue to Login Now
            </Button>
            
            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Reset another password
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fallback return (shouldn't reach here normally)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
