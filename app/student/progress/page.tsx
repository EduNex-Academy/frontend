"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
    BookOpen, 
    BarChart3, 
    CheckCircle2, 
    Trophy, 
    Clock, 
    Calendar,
    PlayCircle,
    Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsCards } from "@/components/common/StatsCards"
import { courseApi } from "@/lib/api/course"
import { moduleApi } from "@/lib/api/module"
import { moduleProgressApi } from "@/lib/api/module-progress"
import type { CourseDTO, ModuleDTO } from "@/types"

interface CourseProgress {
    courseId: number
    courseName: string
    courseInstructor: string
    totalModules: number
    completedModules: number
    progressPercentage: number
    lastActivity: string
}

export default function ProgressPage() {
    const [coursesProgress, setCoursesProgress] = useState<CourseProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCourse, setSelectedCourse] = useState("all")

    useEffect(() => {
        const fetchProgressData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch enrolled courses
                const enrolledCourses = await courseApi.getEnrolledCourses()
                
                // Get all completed modules for the user
                const completedModuleIds = await moduleProgressApi.getUserCompletedModules()
                
                // Fetch progress for each course
                const progressPromises = enrolledCourses.map(async (course: CourseDTO) => {
                    try {
                        // Get all modules for this course
                        const courseModules = await moduleApi.getModulesByCourseId(course.id)
                        
                        // Calculate progress
                        const totalModules = courseModules.length
                        const completedModules = courseModules.filter(module => 
                            completedModuleIds.includes(module.id)
                        ).length
                        
                        const progressPercentage = totalModules > 0 
                            ? Math.round((completedModules / totalModules) * 100) 
                            : 0
                        
                        // Get last activity (we'll use current date as fallback)
                        let lastActivity = new Date().toISOString()
                        try {
                            const progressDetails = await moduleProgressApi.getCourseProgressDetails(course.id)
                            if (progressDetails && progressDetails.length > 0) {
                                // Find the most recent completion date
                                const completedItems = progressDetails.filter(item => item.completed)
                                if (completedItems.length > 0) {
                                    const latestCompletion = completedItems.reduce((latest, item) => {
                                        return new Date(item.completionDate || item.createdAt) > new Date(latest.completionDate || latest.createdAt) 
                                            ? item : latest
                                    })
                                    lastActivity = latestCompletion.completionDate || latestCompletion.createdAt || lastActivity
                                }
                            }
                        } catch (progressDetailError) {
                            console.warn(`Could not fetch progress details for course ${course.id}:`, progressDetailError)
                        }
                        
                        return {
                            courseId: course.id,
                            courseName: course.title,
                            courseInstructor: course.instructorName || 'Unknown Instructor',
                            totalModules,
                            completedModules,
                            progressPercentage,
                            lastActivity
                        }
                    } catch (err) {
                        console.error(`Error calculating progress for course ${course.id}:`, err)
                        // Return default progress if calculation fails
                        return {
                            courseId: course.id,
                            courseName: course.title,
                            courseInstructor: course.instructorName || 'Unknown Instructor',
                            totalModules: 0,
                            completedModules: 0,
                            progressPercentage: 0,
                            lastActivity: new Date().toISOString()
                        }
                    }
                })

                const progressData = await Promise.all(progressPromises)
                setCoursesProgress(progressData)
            } catch (err) {
                console.error('Error fetching progress data:', err)
                setError('Failed to load progress data. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchProgressData()
    }, [])

    // Filter courses based on selection
    const filteredProgress = useMemo(() => {
        if (selectedCourse === "all") {
            return coursesProgress
        }
        return coursesProgress.filter(p => p.courseId === parseInt(selectedCourse))
    }, [coursesProgress, selectedCourse])

    // Calculate overall statistics
    const overallStats = useMemo(() => {
        const totalModules = coursesProgress.reduce((sum, p) => sum + p.totalModules, 0)
        const completedModules = coursesProgress.reduce((sum, p) => sum + p.completedModules, 0)
        const averageProgress = coursesProgress.length > 0 
            ? coursesProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / coursesProgress.length 
            : 0

        return {
            totalCourses: coursesProgress.length,
            totalModules,
            completedModules,
            averageProgress: Math.round(averageProgress),
            coursesCompleted: coursesProgress.filter(p => p.progressPercentage >= 100).length
        }
    }, [coursesProgress])

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h1>
                    <p className="text-gray-600">Track your learning journey and achievements</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-600">Loading your progress...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button 
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Stats Cards */}
                        <StatsCards cards={[
                            { 
                                title: "Total Courses", 
                                subtitle: "Enrolled", 
                                value: overallStats.totalCourses, 
                                icon: BookOpen, 
                                color: "blue", 
                                accent: "from-blue-500 to-blue-600" 
                            },
                            { 
                                title: "Avg Progress", 
                                subtitle: "Overall", 
                                value: overallStats.averageProgress, 
                                icon: BarChart3, 
                                color: "green", 
                                accent: "from-green-500 to-green-600" 
                            },
                            { 
                                title: "Modules Done", 
                                subtitle: "Completed", 
                                value: overallStats.completedModules, 
                                icon: CheckCircle2, 
                                color: "purple", 
                                accent: "from-purple-500 to-purple-600" 
                            },
                            { 
                                title: "Completed", 
                                subtitle: "Courses", 
                                value: overallStats.coursesCompleted, 
                                icon: Trophy, 
                                color: "yellow", 
                                accent: "from-yellow-500 to-yellow-600" 
                            }
                        ]} />

                        {/* Course Filter */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200/30 p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-900">Filter by Course:</h3>
                                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                    <SelectTrigger className="w-64 rounded-full border-blue-200/50 bg-white/60 backdrop-blur-sm">
                                        <SelectValue placeholder="All Courses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Courses</SelectItem>
                                        {coursesProgress.map(progress => (
                                            <SelectItem key={progress.courseId} value={progress.courseId.toString()}>
                                                {progress.courseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Empty State */}
                        {coursesProgress.length === 0 && (
                            <div className="text-center py-12">
                                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Progress Data</h3>
                                <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet. Start learning to track your progress!</p>
                                <Link href="/student/courses">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        Browse Courses
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Progress Cards */}
                        {filteredProgress.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProgress.map((progress) => (
                                    <Card key={progress.courseId} className="bg-white/70 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg text-gray-900 mb-1 truncate">
                                                        {progress.courseName}
                                                    </CardTitle>
                                                    <p className="text-xs text-gray-600">
                                                        {progress.courseInstructor}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-2">
                                                    <div className="text-xl font-bold text-blue-600">
                                                        {Math.round(progress.progressPercentage)}%
                                                    </div>
                                                    <Badge 
                                                        variant={progress.progressPercentage >= 100 ? "default" : "secondary"}
                                                        className="text-xs"
                                                    >
                                                        {progress.progressPercentage >= 100 ? 'Done' : 
                                                         progress.progressPercentage > 0 ? 'Active' : 'New'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        
                                        <CardContent className="space-y-3">
                                            {/* Progress Bar */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-600">Progress</span>
                                                    <span className="text-gray-900 font-medium">
                                                        {progress.completedModules}/{progress.totalModules}
                                                    </span>
                                                </div>
                                                <Progress value={progress.progressPercentage} className="h-2" />
                                            </div>

                                            {/* Compact Stats */}
                                            <div className="grid grid-cols-2 gap-2 text-center">
                                                <div className="p-2 bg-blue-50 rounded">
                                                    <div className="text-sm font-semibold text-gray-900">{progress.totalModules}</div>
                                                    <div className="text-xs text-gray-600">Modules</div>
                                                </div>
                                                <div className="p-2 bg-green-50 rounded">
                                                    <div className="text-sm font-semibold text-gray-900">{progress.completedModules}</div>
                                                    <div className="text-xs text-gray-600">Done</div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Link href={`/student/courses/${progress.courseId}/view`} className="flex-1">
                                                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                                                        <PlayCircle className="w-3 h-3 mr-1" />
                                                        Continue
                                                    </Button>
                                                </Link>
                                                <Link href={`/student/courses/${progress.courseId}`}>
                                                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs">
                                                        <BookOpen className="w-3 h-3" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}