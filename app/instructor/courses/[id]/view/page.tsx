"use client"

import { useParams } from "next/navigation"
import { CourseContent } from "@/components/courses/CourseContent"

export default function InstructorCourseViewPage() {
  const params = useParams()
  const courseId = parseInt(params.id as string, 10)

  // If courseId is not a valid number, show error
  if (isNaN(courseId)) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Course ID</h2>
        <p className="text-gray-600">The course you're looking for doesn't exist.</p>
      </div>
    )
  }

  return <CourseContent courseId={courseId} userRole="INSTRUCTOR" />
}