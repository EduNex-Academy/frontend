"use client"

import { CreateCourseForm } from '@/components/courses/CreateCourseForm'

export default function CreateCoursePage() {
  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Create a New Course</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to create a new course. After creating the course, you'll be able to add modules.
        </p>
      </div>
      
      <CreateCourseForm />
    </div>
  )
}