"use client"

import React from 'react'
import { ModuleCreation } from '@/components/courses/ModuleCreation'
import { useParams } from 'next/navigation'

export default function CourseModulesPage() {
  const params = useParams()
  const courseId = Number(params.courseId)

  if (isNaN(courseId)) {
    return <div className="container py-10">Invalid course ID</div>
  }

  return (
    <div className="container py-10">
      <ModuleCreation courseId={courseId} />
    </div>
  )
}
