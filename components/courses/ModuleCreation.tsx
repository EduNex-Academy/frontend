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

interface ModuleCreationProps {
  courseId: number
}

export const ModuleCreation: React.FC<ModuleCreationProps> = ({ courseId }) => {
  const [course, setCourse] = useState<CourseDTO | null>(null)
  const [modules, setModules] = useState<ModuleDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    setModules(prev => [...prev, newModule])
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-12">Loading course data...</div>
  }

  if (!course) {
    return <div className="text-center p-12">Course not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground">{course.description}</p>
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
