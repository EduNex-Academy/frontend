"use client"

import { useParams } from "next/navigation"
import { CourseView } from "@/components/courses/CourseView"

export default function StudentCourseDetailsPage() {
  const params = useParams()
  const courseId = parseInt(params.id as string, 10)

  // If courseId is not a valid number, redirect to courses page or show error
  if (isNaN(courseId)) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Course ID</h2>
        <p className="text-gray-600">The course you're looking for doesn't exist.</p>
      </div>
    )
  }

  return <CourseView courseId={courseId} userRole="STUDENT" />
}
