"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CourseDTO, ModuleDTO } from "@/types"
import { courseApi, enrollmentApi, moduleApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useModuleProgress } from "@/hooks/use-module-progress"
import {
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Coins,
  ArrowLeft,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ContentViewer } from "./ContentViewer"
import { QuizTaker } from "./QuizTaker"

interface CourseContentProps {
  courseId: number
  userRole: 'STUDENT' | 'INSTRUCTOR'
}

export function CourseContent({ courseId, userRole }: CourseContentProps) {
  const [course, setCourse] = useState<CourseDTO | null>(null)
  const [modules, setModules] = useState<ModuleDTO[]>([])
  const [currentModule, setCurrentModule] = useState<ModuleDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  // Check enrollment and fetch course data
  useEffect(() => {
    const checkEnrollmentAndFetchData = async () => {
      try {
        setLoading(true)
        
        // For instructors, we don't need to check enrollment
        if (userRole === 'INSTRUCTOR') {
          setIsEnrolled(true)
        } else {
          // Check if the user is enrolled
          const enrolled = await enrollmentApi.checkEnrollment(courseId)
          setIsEnrolled(enrolled)
          
          if (!enrolled) {
            toast({
              title: "Not Enrolled",
              description: "You are not enrolled in this course. Please enroll to access content.",
              variant: "destructive",
            })
            router.push(`/${userRole.toLowerCase()}/courses/${courseId}`)
            return
          }
        }
        
        // Fetch course data with modules
        const courseData = await courseApi.getCourseById(courseId, true)
        setCourse(courseData)
        
        if (courseData.modules && courseData.modules.length > 0) {
          const sortedModules = [...courseData.modules].sort((a, b) => a.moduleOrder - b.moduleOrder)
          setModules(sortedModules)
          
          // Find the first incomplete module or the first module if all are completed
          const firstIncompleteModule = sortedModules.find(module => !module.completed)
          setCurrentModule(firstIncompleteModule || sortedModules[0])
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course content. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    checkEnrollmentAndFetchData()
  }, [courseId, userRole, router, toast])

  // Check if user can access a module
  const canAccessModule = (module: ModuleDTO) => {
    // Instructors can access all modules
    if (userRole === 'INSTRUCTOR') return true
    
    // Find the module index
    const moduleIndex = modules.findIndex(m => m.id === module.id)
    if (moduleIndex === 0) return true // First module is always accessible
    
    // Check if all previous modules are completed
    for (let i = 0; i < moduleIndex; i++) {
      if (!modules[i].completed) return false
    }
    
    return true
  }
  
  // Calculate the overall course progress
  const calculateProgress = () => {
    if (!modules.length) return 0
    const completedModules = modules.filter(module => module.completed).length
    return Math.round((completedModules / modules.length) * 100)
  }
  
  // Handle module selection
  const selectModule = (module: ModuleDTO) => {
    if (!canAccessModule(module)) {
      toast({
        title: "Module Locked",
        description: "You need to complete previous modules first.",
        variant: "destructive",
      })
      return
    }
    
    setCurrentModule(module)
  }
  
  // Use the module progress hook
  const { markModuleCompleted, isModuleCompleted, getCourseProgress } = useModuleProgress()
  
  // Log content URLs for debugging
  useEffect(() => {
    if (currentModule) {
      console.log('CourseContent: Current module content URLs:', {
        moduleId: currentModule.id,
        moduleType: currentModule.type,
        contentUrl: currentModule.contentUrl,
        contentCloudFrontUrl: currentModule.contentCloudFrontUrl
      });
      
      // Test fetch the content to check for CORS issues
      const testContentUrl = async (url: string) => {
        if (!url) return;
        
        console.log(`CourseContent: Testing content URL: ${url}`);
        try {
          // Make a HEAD request to check if the URL is accessible
          const response = await fetch(url, { 
            method: 'HEAD',
            mode: 'cors'
          });
          console.log(`CourseContent: URL test result: ${response.status} ${response.statusText}`, {
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
          });
        } catch (error) {
          console.error(`CourseContent: URL test failed: ${url}`, error);
        }
      };
      
      // Test both URLs if available
      if (currentModule.contentCloudFrontUrl) {
        testContentUrl(currentModule.contentCloudFrontUrl);
      }
      if (currentModule.contentUrl) {
        testContentUrl(currentModule.contentUrl);
      }
      
      // If the module has content but doesn't have a CloudFront URL, try to get it
      if ((currentModule.type === 'VIDEO' || currentModule.type === 'PDF') && 
          !currentModule.contentCloudFrontUrl && 
          currentModule.contentUrl) {
        console.log('CourseContent: Module has contentUrl but no CloudFront URL, fetching updated module data');
        
        // Fetch the latest module data to ensure we have the CloudFront URL
        moduleApi.getModuleById(currentModule.id)
          .then(updatedModule => {
            console.log('CourseContent: Got updated module data:', updatedModule);
            
            // Update the module in the modules list
            setModules(prevModules => 
              prevModules.map(m => 
                m.id === updatedModule.id ? updatedModule : m
              )
            );
            
            // Update current module if it's the one we're viewing
            if (currentModule.id === updatedModule.id) {
              setCurrentModule(updatedModule);
            }
          })
          .catch(error => {
            console.error('CourseContent: Failed to fetch updated module data:', error);
          });
      }
    }
  }, [currentModule]);
  
  // Handle module completion
  const markModuleAsCompleted = async (moduleId: number) => {
    try {
      // Call the hook to mark module as completed
      const success = await markModuleCompleted(moduleId)
      
      if (success) {
        // Update the module in the local state
        setModules(prevModules => 
          prevModules.map(m => 
            m.id === moduleId ? { ...m, completed: true } : m
          )
        )
      }
      
      // Find the next module
      const currentIndex = modules.findIndex(m => m.id === moduleId)
      if (currentIndex < modules.length - 1) {
        setCurrentModule(modules[currentIndex + 1])
      }
      
      toast({
        title: "Module Completed",
        description: "Great job! You've completed this module.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark module as completed. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Navigate to the next module if available
  const goToNextModule = () => {
    if (!currentModule) return
    
    const currentIndex = modules.findIndex(m => m.id === currentModule.id)
    if (currentIndex < modules.length - 1) {
      const nextModule = modules[currentIndex + 1]
      if (canAccessModule(nextModule)) {
        setCurrentModule(nextModule)
      } else {
        toast({
          title: "Module Locked",
          description: "You need to complete the current module first.",
          variant: "destructive",
        })
      }
    }
  }
  
  // Navigate to the previous module if available
  const goToPrevModule = () => {
    if (!currentModule) return
    
    const currentIndex = modules.findIndex(m => m.id === currentModule.id)
    if (currentIndex > 0) {
      setCurrentModule(modules[currentIndex - 1])
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!course || !isEnrolled) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800">Course not accessible</h2>
        <p className="text-gray-600 mt-2">
          You don't have access to this course content. Please enroll first.
        </p>
        <Button
          className="mt-4"
          onClick={() => router.push(`/${userRole.toLowerCase()}/courses/${courseId}`)}
        >
          Go to Course Page
        </Button>
      </div>
    )
  }
  
  const progress = calculateProgress()

  return (
    <div className="container min-h-screen flex flex-col">
      {/* Course header */}
      <div className="py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/${userRole.toLowerCase()}/courses/${courseId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{course.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Progress: {progress}%</div>
            <Progress value={progress} className="w-32 h-2" />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Module sidebar */}
        <div className="w-full md:w-72 border-r bg-gray-50">
          <div className="p-4 border-b">
            <h2 className="font-medium text-gray-800">Course Modules</h2>
          </div>
          
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-2">
              {modules.map((module, index) => {
                const isActive = currentModule?.id === module.id
                const isLocked = !canAccessModule(module)
                
                return (
                  <div key={module.id} className="mb-1">
                    <button
                      onClick={() => selectModule(module)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : isLocked
                          ? "text-gray-400 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      }`}
                      disabled={isLocked}
                    >
                      <div className="flex-shrink-0">
                        {isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : module.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 truncate">{module.title}</div>
                      
                      {module.type === 'VIDEO' && <Video className="w-4 h-4" />}
                      {module.type === 'PDF' && <FileText className="w-4 h-4" />}
                      {module.type === 'QUIZ' && <ListChecks className="w-4 h-4" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Content display area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentModule ? (
            <>
              {/* Module header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{currentModule.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {currentModule.type === 'VIDEO' && <Video className="w-4 h-4" />}
                    {currentModule.type === 'PDF' && <FileText className="w-4 h-4" />}
                    {currentModule.type === 'QUIZ' && <ListChecks className="w-4 h-4" />}
                    <span>{currentModule.type}</span>
                    {currentModule.coinsRequired > 0 && (
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span>{currentModule.coinsRequired} coins required</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {currentModule.completed && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                )}
              </div>
              
              {/* Module content */}
              <div className="flex-1 p-4 overflow-auto">
                {currentModule.type === 'QUIZ' ? (
                  <QuizTaker
                    moduleId={currentModule.id}
                    quizId={currentModule.quizId}
                    onComplete={() => markModuleAsCompleted(currentModule.id)}
                  />
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      {currentModule.type === 'VIDEO' && (
                        <div className="aspect-video w-full max-h-[70vh]">
                          {(currentModule.contentCloudFrontUrl || currentModule.contentUrl) ? (
                            <video 
                              key={currentModule.id} // Add key to force re-render when URL changes
                              src={currentModule.contentCloudFrontUrl || currentModule.contentUrl} 
                              controls 
                              className="w-full h-full"
                              autoPlay 
                              controlsList="nodownload"
                              onError={(e) => {
                                console.error("Video error:", e);
                                // If CloudFront URL fails, try the direct URL as fallback
                                if (currentModule.contentCloudFrontUrl && currentModule.contentUrl) {
                                  const video = e.target as HTMLVideoElement;
                                  video.src = currentModule.contentUrl;
                                }
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                              <p className="text-gray-500">Video content not available</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {currentModule.type === 'PDF' && (
                        <div className="w-full h-[70vh]">
                          {(currentModule.contentCloudFrontUrl || currentModule.contentUrl) ? (
                            <iframe
                              key={currentModule.id} // Add key to force re-render when URL changes
                              src={`${currentModule.contentCloudFrontUrl || currentModule.contentUrl}#toolbar=0`}
                              className="w-full h-full border-0"
                              title={currentModule.title}
                              onError={() => {
                                console.error("PDF iframe error");
                                // Fallback handled by iframe's default error behavior
                              }}
                            >
                              <p>
                                It appears you don't have a PDF plugin for this browser.
                                You can <a 
                                  href={currentModule.contentCloudFrontUrl || currentModule.contentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  click here to download the PDF file
                                </a>.
                              </p>
                            </iframe>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                              <p className="text-gray-500">PDF content not available</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {currentModule.type !== 'VIDEO' && currentModule.type !== 'PDF' && currentModule.type !== 'QUIZ' && (
                        <div className="p-4 text-center">
                          <p>This content type is not supported for direct preview.</p>
                          {(currentModule.contentCloudFrontUrl || currentModule.contentUrl) ? (
                            <a 
                              href={currentModule.contentCloudFrontUrl || currentModule.contentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline mt-2 inline-block"
                            >
                              Open content in a new tab
                            </a>
                          ) : (
                            <div className="flex flex-col items-center justify-center mt-4">
                              <AlertCircle className="text-amber-500 w-8 h-8 mb-2" />
                              <p className="text-gray-600">Content URL not available</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Fallback loader */}
                      {(currentModule.type === 'VIDEO' || currentModule.type === 'PDF') && 
                       !(currentModule.contentCloudFrontUrl || currentModule.contentUrl) && (
                        <div className="flex flex-col items-center justify-center p-8">
                          <AlertCircle className="text-amber-500 w-10 h-10 mb-4" />
                          <h3 className="text-lg font-medium mb-2">Content Unavailable</h3>
                          <p className="text-gray-600 text-center mb-4">
                            The content for this module could not be loaded. This might be due to:
                          </p>
                          <ul className="text-gray-600 list-disc pl-5 mb-4 text-left">
                            <li>Content is still being processed</li>
                            <li>Temporary network issue</li>
                            <li>Authentication issue with the content server</li>
                          </ul>
                          <Button 
                            onClick={() => {
                              // Refresh the module data to try again
                              moduleApi.getModuleById(currentModule.id)
                                .then(updatedModule => {
                                  setModules(prevModules => 
                                    prevModules.map(m => 
                                      m.id === updatedModule.id ? updatedModule : m
                                    )
                                  );
                                  setCurrentModule(updatedModule);
                                })
                                .catch(error => {
                                  console.error('Error refreshing module:', error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to refresh module content. Please try again.",
                                    variant: "destructive",
                                  });
                                });
                            }}
                          >
                            Retry Loading Content
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      {!currentModule.completed && (
                        <Button
                          onClick={() => markModuleAsCompleted(currentModule.id)}
                          className="w-full md:w-auto"
                        >
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation footer */}
              <div className="p-4 border-t bg-white flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPrevModule}
                  disabled={modules.findIndex(m => m.id === currentModule.id) === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  onClick={goToNextModule}
                  disabled={modules.findIndex(m => m.id === currentModule.id) === modules.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No modules available</h2>
                <p className="text-gray-600 mb-4">
                  This course doesn't have any modules yet. Please check back later.
                </p>
                <Button onClick={() => router.push(`/${userRole.toLowerCase()}/courses/${courseId}`)}>
                  Back to Course
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}