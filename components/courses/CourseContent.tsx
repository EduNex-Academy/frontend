"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CourseDTO, ModuleDTO } from "@/types"
import { courseApi, enrollmentApi, moduleApi, apiClient } from "@/lib/api"
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
  const [completingModule, setCompletingModule] = useState(false)
  
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
        const courseData = await courseApi.getCourseById(courseId, true, userRole)
        setCourse(courseData)
        
        // If student tries to access a DRAFT course, redirect to courses page
        if (userRole === 'STUDENT' && courseData.status !== 'PUBLISHED') {
          toast({
            title: "Course Not Available",
            description: "This course is not published yet and cannot be viewed.",
            variant: "destructive",
          })
          router.push(`/student/courses`)
          return
        }
        
        if (courseData.modules && courseData.modules.length > 0) {
          const sortedModules = [...courseData.modules].sort((a, b) => a.moduleOrder - b.moduleOrder)
          setModules(sortedModules)
          
          // For instructor or if this is the first load, find the first incomplete module
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
    
    // If this module is marked as completed, user should be able to access it
    if (module.completed) return true
    
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
  
  // Fetch and apply course progress to unlock completed modules
  const fetchAndApplyUserProgress = useCallback(async () => {
    if (!courseId || userRole !== 'STUDENT' || !modules.length) return
    
    try {
      console.log(`Fetching course progress for course ID ${courseId}...`)
      const moduleProgressApi = (await import('@/lib/api')).moduleProgressApi
      const progressDetails = await moduleProgressApi.getCourseProgressDetails(courseId)
      
      // Extract completed module IDs
      const completedModuleIds = progressDetails
        .filter(progress => progress.completed)
        .map(progress => progress.moduleId)
      
      console.log(`Found ${completedModuleIds.length} completed modules:`, completedModuleIds)
      
      // Mark modules as completed in local state
      if (completedModuleIds.length > 0) {
        setModules(prevModules => 
          prevModules.map(module => 
            completedModuleIds.includes(module.id) ? { ...module, completed: true } : module
          )
        )
      }
    } catch (error) {
      console.error("Error fetching course progress:", error)
      toast({
        title: "Warning",
        description: "Could not retrieve your progress data. Some modules may appear locked.",
        variant: "destructive",
      })
    }
  }, [courseId, userRole, modules.length, toast])
  
  // Apply user progress when modules are loaded
  useEffect(() => {
    if (modules.length > 0 && userRole === 'STUDENT') {
      console.log('CourseContent: Applying previously completed modules')
      fetchAndApplyUserProgress()
    }
  }, [modules.length, fetchAndApplyUserProgress, userRole])
  
  // Log content URLs for debugging
  useEffect(() => {
    if (currentModule) {
      console.log('CourseContent: Current module content URLs:', {
        moduleId: currentModule.id,
        moduleType: currentModule.type,
        contentUrl: currentModule.contentUrl,
        contentCloudFrontUrl: currentModule.contentCloudFrontUrl
      });
      
      // For quiz modules, we don't need to test the content URL
      if (currentModule.type === 'QUIZ') return;
      
      // Test fetch the content to check for CORS issues
      const testContentUrl = async (url: string) => {
        if (!url) return;
        
        // Ensure URL is absolute and well-formed
        let testUrl = url;
        if (url.startsWith('/')) {
          // For relative URLs, prepend the API base URL
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8090/api';
          testUrl = `${apiBaseUrl}${url}`;
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
          testUrl = `https://${url}`;
        }
        
        console.log(`CourseContent: Testing content URL: ${testUrl}`);
        
        try {
          // Make a HEAD request to check if the URL is accessible
          const response = await fetch(testUrl, { 
            method: 'HEAD',
            mode: 'no-cors' // Use no-cors to avoid CORS errors in the console
          });
          console.log(`CourseContent: URL test result: ${response.status} ${response.statusText}`, {
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
          });
        } catch (error) {
          console.error(`CourseContent: URL test failed: ${testUrl}`, error);
        }
      };
      
      // Test only the CloudFront URL (contentUrl is just the S3 object key)
      if (currentModule.contentCloudFrontUrl) {
        testContentUrl(currentModule.contentCloudFrontUrl);
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
    setCompletingModule(true)
    try {
      console.log(`Marking module ${moduleId} as completed...`);
      // Call the hook to mark module as completed
      const success = await markModuleCompleted(moduleId)
      
      if (success) {
        console.log(`Module ${moduleId} marked as completed successfully`);
        // Update the module in the local state without changing the current module
        setModules(prevModules => 
          prevModules.map(m => 
            m.id === moduleId ? { ...m, completed: true } : m
          )
        )
        
        // Also update currentModule if it's the one being completed
        setCurrentModule(prevModule => 
          prevModule && prevModule.id === moduleId ? 
            { ...prevModule, completed: true } : 
            prevModule
        )
        
        toast({
          title: "Module Completed",
          description: "Great job! You've completed this module. Click 'Next' to continue.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to mark module as completed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error marking module as completed:", error);
      toast({
        title: "Error",
        description: "Failed to mark module as completed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCompletingModule(false)
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
                {/* Enhanced logging for quiz modules */}
                {currentModule.type === 'QUIZ' && (() => {
                  console.log('CourseContent: Quiz module details:', {
                    moduleId: currentModule.id,
                    quizId: currentModule.quizId,
                    moduleType: currentModule.type,
                    moduleTitle: currentModule.title,
                    contentUrl: currentModule.contentUrl,
                    contentCloudFrontUrl: currentModule.contentCloudFrontUrl
                  });
                  
                  // Check if quiz has a valid URL format
                  if (currentModule.quizId) {
                    console.log(`CourseContent: Quiz URL for quiz ${currentModule.quizId} would be: ${apiClient.defaults.baseURL}quizzes/${currentModule.quizId}`);
                  }
                  
                  return null; // Return null so React doesn't try to render anything
                })()}
                
                {currentModule.type === 'QUIZ' ? (
                  currentModule.quizId ? (
                    <div>
                      <QuizTaker
                        moduleId={currentModule.id}
                        quizId={currentModule.quizId}
                        onComplete={() => markModuleAsCompleted(currentModule.id)}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <h2 className="text-xl font-bold text-gray-800">Quiz Configuration Error</h2>
                      <p className="text-gray-600 mt-2">
                        This quiz module is not properly configured. Missing quiz reference.
                      </p>
                      {userRole === 'INSTRUCTOR' && (
                        <div className="mt-4">
                          <p className="text-amber-600">
                            <AlertCircle className="inline-block w-4 h-4 mr-1" />
                            Instructor Note: Please update this module to associate it with a valid quiz.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Module ID: {currentModule.id} - Quiz ID: {currentModule.quizId || 'Not set'}
                          </p>
                        </div>
                      )}
                    </div>
                  )
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
                            <>
                              <iframe
                                key={currentModule.id}
                                src={currentModule.contentCloudFrontUrl || currentModule.contentUrl}
                                className="w-full h-full border-0 rounded"
                                title={currentModule.title}
                                onLoad={() => console.log("PDF loaded successfully")}
                                onError={(e) => {
                                  console.error("PDF viewing error", e);
                                }}
                              />
                              <div className="mt-2 text-center">
                                <a 
                                  href={currentModule.contentCloudFrontUrl || currentModule.contentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline text-sm flex items-center justify-center gap-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                  </svg>
                                  Download PDF
                                </a>
                                <p className="text-xs text-gray-500">
                                  If the PDF isn't loading correctly, try opening it in a new tab
                                </p>
                              </div>
                            </>
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
                          disabled={completingModule}
                        >
                          {completingModule ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Marking as Completed...
                            </>
                          ) : (
                            'Mark as Completed'
                          )}
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