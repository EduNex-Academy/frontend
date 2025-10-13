"use client"

import { useState, useMemo, useEffect } from "react"
import { CourseCard } from "@/components/common/CourseCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Search,
    BookOpen,
    Clock,
    TrendingUp,
    Award,
    Play,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { StatsCards } from "@/components/common/StatsCards"
import { courseApi } from "@/lib/api/course"
import { moduleApi } from "@/lib/api/module"
import { moduleProgressApi } from "@/lib/api/module-progress"
import { CourseDTO, ModuleDTO } from "@/types"

// Enhanced course interface for UI display
interface EnhancedCourse extends CourseDTO {
    progress?: number
    lastAccessed?: string
    nextDeadline?: string
    progressStatus?: 'not-started' | 'in-progress' | 'almost-complete' | 'completed'
    moduleCount?: number
    enrollmentCount?: number
    completionPercentage?: number
    userEnrolled?: boolean
}

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFilter, setSelectedFilter] = useState("all")
    const [enrolledCourses, setEnrolledCourses] = useState<EnhancedCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch enrolled courses and their progress
    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                setLoading(true)
                setError(null)

                // Get enrolled courses
                const courses = await courseApi.getEnrolledCourses('PUBLISHED')
                
                // Get all completed modules for the user
                const completedModuleIds = await moduleProgressApi.getUserCompletedModules()
                
                // Enhance courses with progress data calculated on frontend
                const enhancedCourses = await Promise.all(
                    courses.map(async (course) => {
                        try {
                            // Get all modules for this course
                            const courseModules = await moduleApi.getModulesByCourseId(course.id)
                            
                            // Calculate progress
                            const totalModules = courseModules.length
                            const completedModules = courseModules.filter(module => 
                                completedModuleIds.includes(module.id)
                            ).length
                            
                            const progress = totalModules > 0 
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
                                ...course,
                                progress,
                                completionPercentage: progress,
                                userEnrolled: true,
                                lastAccessed: lastActivity,
                                progressStatus: progress === 100 ? 'completed' as const 
                                    : progress > 80 ? 'almost-complete' as const 
                                    : progress > 0 ? 'in-progress' as const 
                                    : 'not-started' as const,
                                moduleCount: totalModules,
                                enrollmentCount: 0 // Will be updated if needed
                            }
                        } catch (progressError) {
                            console.warn(`Failed to calculate progress for course ${course.id}:`, progressError)
                            return {
                                ...course,
                                progress: 0,
                                completionPercentage: 0,
                                userEnrolled: true,
                                lastAccessed: new Date().toISOString(),
                                progressStatus: 'not-started' as const,
                                moduleCount: 0,
                                enrollmentCount: 0
                            }
                        }
                    })
                )

                setEnrolledCourses(enhancedCourses)
            } catch (err) {
                console.error('Failed to fetch enrolled courses:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch enrolled courses')
            } finally {
                setLoading(false)
            }
        }

        fetchEnrolledCourses()
    }, [])

    const filteredCourses = useMemo(() => {
        let filtered = enrolledCourses

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.instructorName && course.instructorName.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }

        // Status filter
        if (selectedFilter !== "all") {
            filtered = filtered.filter(course => course.progressStatus === selectedFilter)
        }

        return filtered
    }, [enrolledCourses, searchQuery, selectedFilter])

    const stats = {
        total: enrolledCourses.length,
        inProgress: enrolledCourses.filter(c => c.progressStatus === 'in-progress').length,
        completed: enrolledCourses.filter(c => c.progressStatus === 'completed').length,
        almostComplete: enrolledCourses.filter(c => c.progressStatus === 'almost-complete').length
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                    <p className="text-gray-600">Continue your learning journey</p>
                </div>

                <StatsCards cards={[
                    {
                        title: "Total",
                        subtitle: "Courses",
                        value: stats.total,
                        icon: BookOpen,
                        color: "blue",
                        accent: "from-blue-400 to-blue-600"
                    },
                    {
                        title: "Active",
                        subtitle: "Learning",
                        value: stats.inProgress,
                        icon: Clock,
                        color: "yellow",
                        accent: "from-yellow-400 to-yellow-600"
                    },
                    {
                        title: "Almost",
                        subtitle: "Done",
                        value: stats.almostComplete,
                        icon: TrendingUp,
                        color: "orange",
                        accent: "from-orange-400 to-orange-600"
                    },
                    {
                        title: "Finished",
                        subtitle: "Success",
                        value: stats.completed,
                        icon: Award,
                        color: "green",
                        accent: "from-green-400 to-green-600"
                    }
                ]} />

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200/30 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 z-10" />
                            <Input
                                placeholder="Search your courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-full border-blue-200/50 focus:border-blue-400 bg-white/80 backdrop-blur-sm"
                            />
                        </div>

                        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                            <SelectTrigger className="w-40 rounded-full border-blue-200/50 bg-white/60 backdrop-blur-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="almost-complete">Almost Done</SelectItem>
                                <SelectItem value="not-started">Not Started</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-600">Loading your courses...</p>
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

                {/* Empty State */}
                {!loading && !error && enrolledCourses.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Enrolled Courses</h3>
                        <p className="text-gray-500 mb-6">Start your learning journey by browsing available courses</p>
                        <Link href="/student/courses">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Browse Courses
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Courses Grid */}
                {!loading && !error && filteredCourses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => (
                            <div key={course.id} className="group">
                                <CourseCard course={course} userRole="STUDENT" />
                                
                                {/* Additional Progress and Action Info */}
                                <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 transition-all duration-200 group-hover:shadow-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs font-medium ${course.progressStatus === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                course.progressStatus === 'almost-complete' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                    course.progressStatus === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}
                                        >
                                            {course.progressStatus === 'completed' ? '✅ Completed' :
                                                course.progressStatus === 'almost-complete' ? '🎯 Almost Done' :
                                                    course.progressStatus === 'in-progress' ? '📚 In Progress' :
                                                        '🚀 Not Started'}
                                        </Badge>
                                        <span className="text-sm font-semibold text-gray-700">{course.completionPercentage}%</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">
                                            {course.moduleCount} modules • Last accessed {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'Never'}
                                        </span>
                                        <Link href={`/student/courses/${course.id}`}>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                                <Play className="w-3 h-3 mr-1" />
                                                {course.progressStatus === 'completed' ? 'Review' : course.progressStatus === 'not-started' ? 'Start' : 'Continue'}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Results State (when user has courses but filters show none) */}
                {!loading && !error && enrolledCourses.length > 0 && filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
