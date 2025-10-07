import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CourseDTO, ModuleDTO } from '@/types'
import { courseApi, moduleApi } from '@/lib/api'
import { VideoModuleForm } from './VideoModuleForm'
import { PDFModuleForm } from './PDFModuleForm'
import { QuizModuleForm } from './QuizModuleForm'
import { ModulesList } from './ModulesList'
import { ContentViewer } from './ContentViewer'
import { CloudIcon, AlertTriangle, ImageIcon } from 'lucide-react'
import { CourseThumbnail } from './CourseThumbnail'

interface ModuleCreationProps {
  courseId: number
}

export const ModuleCreation: React.FC<ModuleCreationProps> = ({ courseId }) => {
  const [course, setCourse] = useState<CourseDTO | null>(null)
  const [modules, setModules] = useState<ModuleDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<ModuleDTO | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCourseAndModules = async () => {
      setIsLoading(true)
      try {
        const courseData = await courseApi.getCourseById(courseId, true)
        setCourse(courseData)
        
        // If modules are included in course response, use them
        if (courseData.modules && courseData.modules.length > 0) {
          setModules(courseData.modules)
        } else {
          // Otherwise, fetch modules separately
          const modulesData = await moduleApi.getModulesByCourseId(courseId)
          setModules(modulesData)
        }
      } catch (error: any) {
        toast({
          title: 'Error loading course data',
          description: error.message || 'Failed to load course data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCourseAndModules()
  }, [courseId, toast])

  const refreshModules = async () => {
    try {
      const modulesData = await moduleApi.getModulesByCourseId(courseId)
      setModules(modulesData)
    } catch (error: any) {
      toast({
        title: 'Error refreshing modules',
        description: error.message || 'Failed to refresh modules.',
        variant: 'destructive',
      })
    }
  }

  const handleModuleAdded = (newModule: ModuleDTO) => {
    // Add the new module to the list and refresh modules to get CloudFront URLs if available
    setModules(prev => [...prev, newModule])
    refreshModules()
  }
  
  const handleViewModule = (module: ModuleDTO) => {
    setSelectedModule(module)
    setIsViewerOpen(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-12">Loading course data...</div>
  }

  if (!course) {
    return <div className="text-center p-12">Course not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        {course.thumbnailUrl && (
          <div className="flex-shrink-0">
            <CourseThumbnail course={course} size="medium" />
          </div>
        )}
        <div className="flex-grow space-y-2">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.description}</p>
          {course.thumbnailUrl && (
            <div className="flex items-center text-xs text-green-600">
              <CloudIcon className="h-3 w-3 mr-1" />
              <span>Thumbnail hosted on CloudFront</span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Modules</CardTitle>
          <CardDescription>
            Add modules to your course. You can create video, PDF, or quiz modules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModulesList modules={modules} refreshModules={refreshModules} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>
            Learn how to add different types of content to your course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Video Modules</h3>
                <ul className="text-sm space-y-2">
                  <li>• Upload MP4, WebM, or MOV files (max 100MB)</li>
                  <li>• Videos are securely stored and delivered via CloudFront</li>
                  <li>• You can also provide a URL to external videos</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">PDF Modules</h3>
                <ul className="text-sm space-y-2">
                  <li>• Upload PDF documents (max 50MB)</li>
                  <li>• Files are securely stored and delivered via CloudFront</li>
                  <li>• You can also provide a URL to external PDFs</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Quiz Modules</h3>
                <ul className="text-sm space-y-2">
                  <li>• Create interactive quizzes with multiple-choice questions</li>
                  <li>• Set correct answers and feedback</li>
                  <li>• Track student progress and scores</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Module</CardTitle>
          <CardDescription>
            Create a new module for your course. Select the type of module you want to create.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="video">
            <TabsList className="mb-4">
              <TabsTrigger value="video">Video Module</TabsTrigger>
              <TabsTrigger value="pdf">PDF Module</TabsTrigger>
              <TabsTrigger value="quiz">Quiz Module</TabsTrigger>
            </TabsList>
            <TabsContent value="video">
              <VideoModuleForm courseId={courseId} onModuleAdded={handleModuleAdded} moduleOrder={modules.length + 1} />
            </TabsContent>
            <TabsContent value="pdf">
              <PDFModuleForm courseId={courseId} onModuleAdded={handleModuleAdded} moduleOrder={modules.length + 1} />
            </TabsContent>
            <TabsContent value="quiz">
              <QuizModuleForm courseId={courseId} onModuleAdded={handleModuleAdded} moduleOrder={modules.length + 1} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
