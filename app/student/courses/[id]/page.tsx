"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CourseDetailsLayout } from "@/components/layout/CourseDetailsLayout"
import { mockCourses } from "@/data/mock-data"
import { Course } from "@/types/course"

export default function StudentCourseDetailsPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    // Find the course from mock data
    const foundCourse = mockCourses.find(c => c.id === courseId)
    setCourse(foundCourse || null)
  }, [courseId])

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <CourseDetailsLayout course={course} userRole="STUDENT" />
}
