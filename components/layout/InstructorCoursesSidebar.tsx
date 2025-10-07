"use client"

import React, { useState, useEffect } from 'react'
import { courseApi } from '@/lib/api/course'
import { useAuth } from '@/hooks/use-auth'
import { CourseDTO } from '@/types'
import { Loader2, Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function InstructorCoursesSidebar() {
  const [courses, setCourses] = useState<CourseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)
        const fetchedCourses = await courseApi.getCoursesByInstructorId(user.id)
        setCourses(fetchedCourses)
      } catch (err: any) {
        console.error('Failed to fetch instructor courses:', err)
        setError(err.message || 'Failed to fetch your courses')
      } finally {
        setLoading(false)
      }
    }

    fetchInstructorCourses()
  }, [user?.id])

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">My Courses</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">My Courses</h3>
        </div>
        <p className="text-xs text-destructive px-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="px-3 py-2">
      <Link href="/instructor/create_course" className="block mb-3">
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create New Course
        </Button>
      </Link>
      
      <div 
        className="flex items-center justify-between mb-2 cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-sm font-medium">My Courses ({courses.length})</h3>
        <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {expanded && (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1 pl-2">
          {courses.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1 px-2">No courses yet</p>
          ) : (
            courses.map((course) => (
              <Link 
                key={course.id} 
                href={`/instructor/create_course/${course.id}/modules`}
                className={cn(
                  "flex items-center justify-between text-sm rounded-md px-2 py-1.5 w-full",
                  pathname.includes(`/instructor/create_course/${course.id}`)
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted/50 transition-colors"
                )}
              >
                <span className="truncate text-xs" title={course.title}>
                  {course.title}
                </span>
                <Pencil className="h-3 w-3 shrink-0 opacity-70" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}