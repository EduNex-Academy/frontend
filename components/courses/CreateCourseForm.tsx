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
import { COURSE_CATEGORIES, CourseStatus } from '@/types'
import { ImageUpload } from '@/components/ui/image-upload'
import { Separator } from '@/components/ui/separator'

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
  const [thumbnailState, setThumbnailState] = useState<{
    file: File | null
    preview: string | null
    progress: number
  }>({
    file: null,
    preview: null,
    progress: 0
  })
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  
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
  
  const handleThumbnailChange = (file: File | null) => {
    setThumbnailError(null)
    
    if (file && !file.type.startsWith('image/')) {
      setThumbnailError('Please upload a valid image file.')
      return
    }
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
        instructorId: user.id,
        status: 'DRAFT' as CourseStatus // Set course status to DRAFT by default
      }
      
      const createdCourse = await courseApi.createCourse(courseData)
      
      // If a thumbnail was uploaded, upload it to the course
      if (thumbnailState.file) {
        setThumbnailState(prev => ({ ...prev, progress: 10 }))
        
        try {
          // Upload the thumbnail
          const courseWithThumbnail = await courseApi.uploadCourseThumbnail(createdCourse.id, thumbnailState.file)
          setThumbnailState(prev => ({ ...prev, progress: 100 }))
          
          // Update the created course with the thumbnail URL
          createdCourse.thumbnailUrl = courseWithThumbnail.thumbnailUrl
        } catch (thumbnailError: any) {
          console.error('Thumbnail upload failed:', thumbnailError)
          toast({
            title: 'Thumbnail upload failed',
            description: 'Course was created but thumbnail upload failed. You can upload the thumbnail later.',
            variant: 'destructive',
          })
        }
      }
      
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
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <ImageUpload
              id="thumbnail"
              label="Course Thumbnail (Optional)"
              accept="image/*"
              maxSize={10} // 10MB max for thumbnails
              onChange={handleThumbnailChange}
              error={thumbnailError || undefined}
              imageState={thumbnailState}
              setImageState={setThumbnailState}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 16:9 ratio, minimum 1280x720px for best display (max 10MB)
            </p>
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
