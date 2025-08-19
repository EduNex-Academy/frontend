"use client"

import {
  BookOpen,
  Home,
  GraduationCap,
  FileText,
  User,
  Clock,
  CreditCard,
  BarChart3,
  Users,
  Plus,
  Settings,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { authApi } from "@/lib/api/auth"
import Link from "next/link"
import { usePathname } from "next/navigation"

const studentNavigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: Home },
  { name: "Browse Courses", href: "/student/courses", icon: BookOpen },
  { name: "My Courses", href: "/student/my-courses", icon: GraduationCap },
  { name: "Assignments", href: "/student/assignments", icon: FileText },
  { name: "Progress", href: "/student/progress", icon: BarChart3 },
  { name: "Subscription", href: "/student/subscription", icon: CreditCard },
  { name: "Profile", href: "/student/profile", icon: User },
]

const instructorNavigation = [
  { name: "Dashboard", href: "/instructor/dashboard", icon: Home },
  { name: "All Courses", href: "/instructor/courses", icon: BookOpen },
  { name: "Create Course", href: "/instructor/courses/create", icon: Plus },
  { name: "Students", href: "/instructor/students", icon: Users },
  { name: "Assignments", href: "/instructor/assignments", icon: FileText },
  { name: "Quizzes", href: "/instructor/quizzes", icon: GraduationCap },
  { name: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  { name: "Settings", href: "/instructor/settings", icon: Settings },
  { name: "Profile", href: "/instructor/profile", icon: User },
]

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const navigation = user?.role === "STUDENT" ? studentNavigation : instructorNavigation

  const handleSignOut = async () => {
    try {
      // Call API logout to clear server-side cookies
      await authApi.logout()

      // Clear client-side auth state
      logout()

      // Redirect to login page
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Sign out error:", error)
      // Even if API call fails, still clear local state and redirect
      logout()
      window.location.href = "/auth/login"
    }
  }

  return (
    <div className="fixed left-0 top-0 flex h-screen w-12 flex-col border-r bg-background z-40">
      <div className="flex flex-1 flex-col items-center justify-center space-y-1 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 hover:bg-accent hover:text-blue-500 hover:scale-125 ${isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
                }`}
              title={item.name}
            >
              <item.icon className="h-4 w-4" />
            </Link>
          )
        })}
      </div>

      {/* Logout button at the bottom */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleSignOut}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-red-100 text-red-600 hover:text-red-700"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

