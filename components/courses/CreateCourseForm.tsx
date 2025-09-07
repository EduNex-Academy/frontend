import React, { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { courseApi } from '@/lib/api'
import { COURSE_CATEGORIES } from '@/types'

interface CourseFormData {
  title: string
  description: string
  category: string
}

export const CreateCourseForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
  })
  
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create a course.',
        variant: 'destructive',
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const courseData = {
        ...formData,
        instructorId: user.id
      }
      
      const createdCourse = await courseApi.createCourse(courseData)
      
      toast({
        title: 'Course created!',
        description: 'Your course has been created successfully.',
      })
      
      // Redirect to the module creation page with the new course ID
      router.push(`/instructor/create_course/${createdCourse.id}/modules`)
    } catch (error: any) {
      toast({
        title: 'Error creating course',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <CardDescription>Fill in the details to create your new course.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title*</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter course title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Course Description*</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter course description"
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category*</Label>
            <Select 
              onValueChange={(value) => handleSelectChange(value, 'category')}
              value={formData.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_CATEGORIES.filter(cat => cat !== 'All Categories').map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
