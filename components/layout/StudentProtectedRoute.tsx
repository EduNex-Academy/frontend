"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface StudentProtectedRouteProps {
  children: ReactNode
}

export function StudentProtectedRoute({ children }: StudentProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const router = useRouter()

  const PulseRingLoader = () => (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-16 h-16 border-4 border-blue-200 rounded-full animate-ping" />
      <div className="absolute w-12 h-12 border-4 border-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
      <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse" />
    </div>
  );

  useEffect(() => {
    // Wait for auth to be initialized before making routing decisions
    if (!isInitialized) {
      return
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    // If authenticated but not a student, redirect to appropriate dashboard
    if (user?.role !== "STUDENT") {
      if (user?.role === "INSTRUCTOR") {
        router.push("/instructor/dashboard")
      } else {
        // If role is unknown, redirect to login
        router.push("/auth/login")
      }
      return
    }
  }, [isAuthenticated, isInitialized, user, router])

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <PulseRingLoader />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isAuthenticated || user?.role !== "STUDENT") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Render children if authenticated and is a student
  return <>{children}</>
}
