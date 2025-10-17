"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CourseDTO, ModuleDTO } from "@/types"
import { courseApi, enrollmentApi, pointsApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useCertificate } from "@/hooks/use-certificate"
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Calendar,
  Award,
  Globe,
  ArrowRight,
  CheckCircle,
  Coins,
  Download,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ContentViewer } from "./ContentViewer"
import { CourseThumbnail } from "./CourseThumbnail"

interface CourseViewProps {
  courseId: number
  userRole: 'STUDENT' | 'INSTRUCTOR'
}

export function CourseView({ courseId, userRole }: CourseViewProps) {
  const [course, setCourse] = useState<CourseDTO | null>(null)
  const [modules, setModules] = useState<ModuleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [selectedModule, setSelectedModule] = useState<ModuleDTO | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("about")
  const [totalCoinsRequired, setTotalCoinsRequired] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [pointsError, setPointsError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { isCourseCompleted, generateCertificateData } = useCertificate()

  // Fetch course data
  useEffect(() => {
    console.log("CourseView: Starting to fetch data for courseId:", courseId)
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        console.log("CourseView: Calling API for courseId:", courseId)
        
        const courseData = await courseApi.getCourseById(courseId, true, userRole)
        console.log("CourseView: API returned course data:", courseData)
        
        setCourse(courseData)
        
        if (courseData.modules && courseData.modules.length > 0) {
          console.log("CourseView: Found modules:", courseData.modules.length)
          setModules(courseData.modules)
          
          // Calculate total coins required
          const totalCoins = courseData.modules.reduce(
            (sum, module) => sum + module.coinsRequired, 0
          )
          setTotalCoinsRequired(totalCoins)
        } else {
          console.log("CourseView: No modules found in course data")
        }
        
        // Also check enrollment status
        if (userRole === 'STUDENT') {
          console.log("CourseView: Checking enrollment status")
          const enrolled = await enrollmentApi.checkEnrollment(courseId)
          console.log("CourseView: Enrollment status:", enrolled)
          setIsEnrolled(enrolled)
        } else {
          // Instructors have access to all courses
          setIsEnrolled(false)
        }
      } catch (error: any) {
        console.error("CourseView: Error fetching course data:", error)
        toast({
          title: "Error",
          description: `Failed to load course data: ${error.message || "Unknown error"}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourseData()
  }, [courseId, toast, userRole])

  // Track when enrollment status changes from false to true
  const [justEnrolled, setJustEnrolled] = useState(false);
  
  // Only redirect after a new enrollment, not on initial load
  useEffect(() => {
    if (justEnrolled && isEnrolled && !loading) {
      console.log('CourseView: User just enrolled, redirecting to course view')
      router.push(`/${userRole.toLowerCase()}/courses/${courseId}/view`)
      // Reset the flag after redirecting
      setJustEnrolled(false)
    }
  }, [justEnrolled, isEnrolled, loading, router, userRole, courseId])

  // Check course completion status
  useEffect(() => {
    if (isEnrolled && course && userRole === 'STUDENT') {
      const checkCompletion = async () => {
        try {
          const completed = course.completionPercentage === 100 || await isCourseCompleted(courseId)
          setIsCompleted(completed)
        } catch (error) {
          console.error('Error checking course completion:', error)
        }
      }
      checkCompletion()
    }
  }, [isEnrolled, course, courseId, userRole, isCourseCompleted])

  // Load user's wallet balance when the confirmation dialog opens
  useEffect(() => {
    if (!isConfirmDialogOpen || !user) {
      return
    }

    let isMounted = true
    const loadWalletBalance = async () => {
      try {
        setWalletLoading(true)
        setPointsError(null)
        const wallet = await pointsApi.getUserWallet()
        if (!isMounted) return
        setWalletBalance(wallet.totalPoints)
      } catch (error: any) {
        console.error('CourseView: Failed to load wallet balance', error)
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Failed to load wallet balance. Please try again.'
        setPointsError(message)
      } finally {
        if (isMounted) {
          setWalletLoading(false)
        }
      }
    }

    loadWalletBalance()

    return () => {
      isMounted = false
    }
  }, [isConfirmDialogOpen, user])

  const handleDownloadCertificate = async () => {
    if (!course) return
    
    try {
      setIsDownloadingCertificate(true)
      
      const certificateData = await generateCertificateData(course)
      if (certificateData) {
        const { CertificateGenerator } = await import('@/lib/utils/certificate-generator')
        await CertificateGenerator.downloadCertificate(certificateData)
        
        toast({
          title: "Success",
          description: "Certificate downloaded successfully!",
        })
      }
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloadingCertificate(false)
    }
  }

  const handleConfirmEnrollment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to enroll in this course.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!course) {
      toast({
        title: "Error",
        description: "Course information is unavailable.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("CourseView: Confirming enrollment with points deduction", { courseId, userId: user.id })
      setEnrolling(true)
      setPointsError(null)

      if (totalCoinsRequired > 0) {
        const validationResult = await pointsApi.validateUserPoints(user.id, totalCoinsRequired)

        if (!validationResult.hasEnoughPoints) {
          setPointsError(`You need ${validationResult.requiredPoints} coins but only have ${validationResult.currentPoints}.`)
          setWalletBalance(validationResult.currentPoints)
          return
        }

        await pointsApi.deductPoints({
          userId: user.id,
          points: totalCoinsRequired,
          resourceType: 'COURSE_ENROLLMENT',
          resourceId: 'ade869ba-3743-4e55-8d78-2ea505931a35',
          description: `Enrollment for course ${course.title}`
        })

        const updatedBalance = validationResult.currentPoints - totalCoinsRequired
        setWalletBalance(Math.max(updatedBalance, 0))
      }

      await enrollmentApi.enrollInCourse(courseId)

      setIsEnrolled(true)
      setJustEnrolled(true)

      toast({
        title: "Success",
        description: totalCoinsRequired > 0
          ? `You have successfully enrolled and spent ${totalCoinsRequired} coins.`
          : "You have successfully enrolled in this course.",
      })

      setIsConfirmDialogOpen(false)

      const updatedCourse = await courseApi.getCourseById(courseId, true)
      setCourse(updatedCourse)
    } catch (error: any) {
      console.error("CourseView: Enrollment error:", error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in the course. Please try again.'
      setPointsError(errorMessage)

      if (!errorMessage.toLowerCase().includes('insufficient')) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setEnrolling(false)
    }
  }

  const handleEnrollClick = () => {
    console.log("CourseView: Enroll button clicked", { courseId })

    if (!user) {
      console.log("CourseView: User not logged in")
      toast({
        title: "Authentication Required",
        description: "Please login to enroll in this course.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    setPointsError(null)
    setIsConfirmDialogOpen(true)
  }

  const handleViewModule = (module: ModuleDTO) => {
    setSelectedModule(module)
    setIsViewerOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800">Course not found</h2>
        <p className="text-gray-600 mt-2">The course you're looking for doesn't exist or has been removed.</p>
        <Button
          className="mt-4"
          onClick={() => router.push(`/${userRole.toLowerCase()}/courses`)}
        >
          Back to Courses
        </Button>
      </div>
    )
  }

  // If student tries to access a DRAFT course, redirect to courses page
  if (userRole === 'STUDENT' && course.status !== 'PUBLISHED') {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800">Course not available</h2>
        <p className="text-gray-600 mt-2">This course is not published yet and cannot be viewed.</p>
        <Button
          className="mt-4"
          onClick={() => router.push(`/student/courses`)}
        >
          Back to Courses
        </Button>
      </div>
    )
  }

  const isInstructor = userRole === 'INSTRUCTOR'
  // isEnrolled is now handled via state
  const projectedBalance = walletBalance !== null
    ? walletBalance - (isConfirmDialogOpen ? totalCoinsRequired : 0)
    : null

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Course Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-2/3">
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
            <span>{course.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
          
          <p className="text-gray-600 mb-4">{course.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-700">Instructor:</span>
              <span className="text-sm font-medium">{course.instructorName}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{course.enrollmentCount} students</span>
            </div>
            
            {course.modules && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{course.modules.length} modules</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">{totalCoinsRequired} coins required</span>
            </div>
          </div>
          
          {!isInstructor && !isEnrolled && (
            <Button 
              size="lg"
              onClick={handleEnrollClick}
              disabled={enrolling}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {enrolling ? "Enrolling..." : "Enroll in Course"}
            </Button>
          )}
          
          {isEnrolled && (
            <Button 
              size="lg"
              onClick={() => router.push(`/${userRole.toLowerCase()}/courses/${courseId}/view`)}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          {isInstructor && (
            <div className="flex gap-3">
              <Button 
                size="lg"
                onClick={() => router.push(`/instructor/courses/${courseId}/edit`)}
                variant="outline"
              >
                Edit Course
              </Button>
              <Button 
                size="lg"
                onClick={() => router.push(`/instructor/courses/${courseId}/analytics`)}
              >
                View Analytics
              </Button>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/3">
          <Card className="overflow-hidden border border-blue-100/50 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="relative w-full" style={{ height: '200px' }}>
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100/50 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-blue-300" />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-lg">{totalCoinsRequired} coins required</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Estimated completion: {modules.length * 2} hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span className="text-sm">{modules.length} modules</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">Lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-orange-600" />
                    <span className="text-sm">Certificate of completion</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              {!isInstructor && <TabsTrigger value="instructor">Instructor</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="about">
              <Card className="bg-white/80 backdrop-blur-sm border border-blue-100/50">
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{course.description}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="modules">
              <Card className="bg-white/80 backdrop-blur-sm border border-blue-100/50">
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No modules available for this course yet.</p>
                    ) : (
                      modules.map((module, index) => (
                        <div key={module.id} className="border border-blue-100/50 rounded-lg overflow-hidden bg-white">
                          <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-medium">{module.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Badge variant="outline" className={
                                    module.type === 'VIDEO' ? 'text-blue-700 bg-blue-50' :
                                    module.type === 'PDF' ? 'text-red-700 bg-red-50' :
                                    'text-green-700 bg-green-50'
                                  }>
                                    {module.type}
                                  </Badge>
                                  <span className="ml-2">{module.coinsRequired} coins required</span>
                                </div>
                              </div>
                            </div>
                            
                            {(isEnrolled || isInstructor) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewModule(module)}
                              >
                                Preview
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="instructor">
              <Card className="bg-white/80 backdrop-blur-sm border border-blue-100/50">
                <CardHeader>
                  <CardTitle>About the Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-semibold">
                      {course.instructorName ? course.instructorName[0] : "I"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{course.instructorName || "Instructor"}</h3>
                      <p className="text-gray-600">Course Instructor</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">
                    {course.instructorName || "The instructor"} is an expert educator with years of experience in teaching and practical application.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border border-blue-100/50 sticky top-24">
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${(course.completionPercentage || 0).toFixed(2)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isCompleted ? 'text-green-600 font-semibold' : ''}>
                      {isCompleted ? '100% Complete! 🎉' : `${(course.completionPercentage || 0).toFixed(2)}% complete`}
                    </span>
                    <span>{modules.filter(m => m.completed).length}/{modules.length} modules</span>
                  </div>
                  
                  {isCompleted ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Course Completed!</span>
                      </div>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleDownloadCertificate}
                        disabled={isDownloadingCertificate}
                      >
                        {isDownloadingCertificate ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Award className="w-4 h-4 mr-2" />
                        )}
                        {isDownloadingCertificate ? 'Generating...' : 'Download Certificate'}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => router.push(`/${userRole.toLowerCase()}/courses/${courseId}/view`)}
                    >
                      Continue Learning
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    Enroll in this course to track your progress and access all course content.
                  </p>
                  {!isInstructor && (
                    <Button 
                      className="w-full"
                      onClick={handleEnrollClick}
                      disabled={enrolling}
                    >
                      {enrolling ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog
        open={isConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (enrolling) return
            setIsConfirmDialogOpen(false)
            setPointsError(null)
          } else {
            setIsConfirmDialogOpen(true)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              {totalCoinsRequired > 0
                ? `Enrolling in this course will deduct ${totalCoinsRequired} coins from your wallet.`
                : 'This course is free to enroll. Would you like to continue?'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Coins className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800">Course Cost</p>
                  <p className="text-lg font-semibold text-blue-900">{totalCoinsRequired} coins</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Current Balance</span>
                <span className="flex items-center gap-2 font-medium text-gray-900">
                  {walletLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      Loading...
                    </>
                  ) : walletBalance !== null ? (
                    <>{walletBalance} coins</>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <Separator />
              <div
                className={`flex items-center justify-between text-sm ${
                  projectedBalance !== null && projectedBalance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                <span>Balance After Enrollment</span>
                <span className="font-medium">
                  {projectedBalance !== null ? `${Math.max(projectedBalance, 0)} coins` : '—'}
                </span>
              </div>
            </div>

            {pointsError && (
              <Alert variant="destructive">
                <AlertTitle>Action required</AlertTitle>
                <AlertDescription>{pointsError}</AlertDescription>
              </Alert>
            )}

            {!pointsError && projectedBalance !== null && projectedBalance < 0 && (
              <Alert variant="destructive">
                <AlertTitle>Not enough points</AlertTitle>
                <AlertDescription>
                  You need an additional {Math.abs(projectedBalance)} coins to enroll in this course.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (enrolling) return
                setIsConfirmDialogOpen(false)
                setPointsError(null)
              }}
              disabled={enrolling}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmEnrollment}
              disabled={enrolling || walletLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {enrolling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : totalCoinsRequired > 0 ? (
                'Confirm & Deduct'
              ) : (
                'Confirm Enrollment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content viewer modal */}
      <ContentViewer
        module={selectedModule}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  )
}