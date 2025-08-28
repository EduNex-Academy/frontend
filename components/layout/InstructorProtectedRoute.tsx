"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface InstructorProtectedRouteProps {
  children: ReactNode
}

export function InstructorProtectedRoute({ children }: InstructorProtectedRouteProps) {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const router = useRouter()

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

    // If authenticated but not an instructor, redirect to appropriate dashboard
    if (user?.role !== "INSTRUCTOR") {
      if (user?.role === "STUDENT") {
        router.push("/student/dashboard")
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (!isAuthenticated || user?.role !== "INSTRUCTOR") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Render children if authenticated and is an instructor
  return <>{children}</>
}
