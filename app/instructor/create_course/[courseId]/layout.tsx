"use client"

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Settings } from 'lucide-react'

export default function CourseEditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/instructor/courses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/instructor/create_course/${courseId}/settings`)}
          >
            <Settings className="h-4 w-4 mr-2" /> Course Settings
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" /> Publish Course
          </Button>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}
