"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Settings, CheckCircle, Loader2 } from 'lucide-react'
import { courseApi } from '@/lib/api/course'
import { useToast } from '@/hooks/use-toast'
import { CourseDTO } from '@/types'

export default function CourseEditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const courseId = parseInt(params.courseId as string)
  const { toast } = useToast()
  
  const [course, setCourse] = useState<CourseDTO | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch the course data to get the current status
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true)
        const courseData = await courseApi.getCourseById(courseId)
        setCourse(courseData)
      } catch (error: any) {
        toast({
          title: 'Error loading course',
          description: error.message || 'Could not load course data',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (courseId) {
      fetchCourse()
    }
  }, [courseId, toast])

  const handlePublishCourse = async () => {
    if (!course) return
    
    try {
      setIsPublishing(true)
      await courseApi.publishCourse(courseId)
      
      toast({
        title: 'Course published',
        description: 'Your course is now available to students',
      })
      
      // Update the local course state
      setCourse({...course, status: 'PUBLISHED'})
    } catch (error: any) {
      toast({
        title: 'Failed to publish course',
        description: error.message || 'Please try again later',
        variant: 'destructive'
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/instructor/my-courses')}
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
          {course?.status === 'PUBLISHED' ? (
            <Button size="sm" variant="default" disabled className="bg-green-600">
              <CheckCircle className="h-4 w-4 mr-2" /> Published
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={handlePublishCourse} 
              disabled={isPublishing || isLoading}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Publish Course
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
