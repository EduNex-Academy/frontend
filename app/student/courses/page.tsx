"use client"

import { CoursesPageLayout } from "@/components/layout/CoursesPageLayout"
import { useAuth } from "@/hooks/use-auth"
import { useSearchParams } from "next/navigation"

export default function StudentCoursesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  return (
    <CoursesPageLayout 
      userRole={user?.role === 'STUDENT' ? 'STUDENT' : 'INSTRUCTOR'} 
      initialQuery={initialQuery}
    />
  )
}
