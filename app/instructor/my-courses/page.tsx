"use client"

import React, { useState, useEffect } from 'react'
import { courseApi } from '@/lib/api/course'
import { useAuth } from '@/hooks/use-auth'
import { CourseDTO } from '@/types'
import { Loader2, Plus, BookOpen, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseDTO[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseDTO[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setError(null)
        const fetchedCourses = await courseApi.getCoursesByInstructorId(user.id)
        setCourses(fetchedCourses)
        setFilteredCourses(fetchedCourses)
      } catch (err: any) {
        console.error('Failed to fetch instructor courses:', err)
        setError(err.message || 'Failed to fetch your courses')
      } finally {
        setLoading(false)
      }
    }

    fetchInstructorCourses()
  }, [user?.id])
  
  // Filter courses based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredCourses(courses)
    } else if (statusFilter === 'draft') {
      setFilteredCourses(courses.filter(course => course.status !== 'PUBLISHED'))
    } else {
      setFilteredCourses(courses.filter(course => course.status === 'PUBLISHED'))
    }
  }, [statusFilter, courses])

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-2">Manage and edit your courses</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/instructor/create_course">
            <Plus className="h-4 w-4 mr-2" /> Create New Course
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <p className="text-sm font-medium">Filter by status:</p>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            Drafts
          </Button>
          <Button
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('published')}
          >
            Published
          </Button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">Create your first course to get started</p>
          <Button asChild>
            <Link href="/instructor/create_course">
              <Plus className="h-4 w-4 mr-2" /> Create Course
            </Link>
          </Button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-6">
            No courses match the selected filter. Try changing your filter or create a new course.
          </p>
          <Button variant="outline" onClick={() => setStatusFilter('all')}>
            Clear Filter
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="border rounded-lg overflow-hidden bg-card transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row">
                <div className="relative sm:w-48 h-40 sm:h-auto">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 m-2 bg-primary/90 text-white text-xs px-2 py-1 rounded">
                    {course.modules?.length || 0} {course.modules?.length === 1 ? 'Module' : 'Modules'}
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                      <div className={`px-2 py-1 rounded text-xs ${
                        course.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {course.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{course.description || 'No description provided'}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {course.category || 'Uncategorized'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      {course.enrollmentCount !== undefined && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {course.enrollmentCount} {course.enrollmentCount === 1 ? 'student' : 'students'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-auto">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        <BookOpen className="h-3 w-3 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/create_course/${course.id}/modules`}>
                        <Pencil className="h-3 w-3 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}