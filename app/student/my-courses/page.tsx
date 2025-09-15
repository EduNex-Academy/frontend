"use client"

import { useState, useMemo } from "react"
import { CourseCard } from "@/components/common/CourseCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Search,
    BookOpen,
    Clock,
    TrendingUp,
    Award,
    Play
} from "lucide-react"
import { mockCourses } from "@/data/mock-data"
import Link from "next/link"
import { StatsCards } from "@/components/common/StatsCards"

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFilter, setSelectedFilter] = useState("all")


    // Filter enrolled courses (mock data - replace with API call)
    const enrolledCourses = mockCourses.filter(course => course.isEnrolled).map(course => {
        const progress = course.progress || Math.floor(Math.random() * 100)
        return {
            id: parseInt(course.id), // Convert string to number for CourseDTO
            title: course.title,
            description: course.description,
            instructorId: `instructor-${course.id}`, // Generate instructorId
            instructorName: course.instructor, // Map instructor name
            category: course.category,
            createdAt: course.createdAt || new Date().toISOString(),
            moduleCount: course.lessons, // Map lessons to moduleCount
            enrollmentCount: course.studentsEnrolled,
            completionPercentage: progress,
            userEnrolled: true, // Since these are enrolled courses
            progress,
            lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextDeadline: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: progress === 100 ? 'completed' : progress > 80 ? 'almost-complete' : progress > 0 ? 'in-progress' : 'not-started'
        }
    })

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
            filtered = filtered.filter(course => course.status === selectedFilter)
        }

        return filtered
    }, [searchQuery, selectedFilter])

    const stats = {
        total: enrolledCourses.length,
        inProgress: enrolledCourses.filter(c => c.status === 'in-progress').length,
        completed: enrolledCourses.filter(c => c.status === 'completed').length,
        almostComplete: enrolledCourses.filter(c => c.status === 'almost-complete').length
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

                {/* Courses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="relative">
                            <CourseCard course={course} userRole="STUDENT" />

                            {/* Progress Overlay */}
                            <div className="absolute top-2 left-2 right-2">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-blue-200/30">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                        <span className="font-medium">Progress</span>
                                        <span>{course.completionPercentage}%</span>
                                    </div>
                                    <Progress value={course.completionPercentage} className="h-1.5" />
                                    <div className="flex justify-between items-center mt-1">
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${course.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                course.status === 'almost-complete' ? 'bg-orange-100 text-orange-700' :
                                                    course.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {course.status === 'completed' ? 'Completed' :
                                                course.status === 'almost-complete' ? 'Almost Done' :
                                                    course.status === 'in-progress' ? 'In Progress' :
                                                        'Not Started'}
                                        </Badge>
                                        <Link href={`/student/courses/${course.id}`}>
                                            <Button size="sm" variant="outline" className="text-xs h-6">
                                                <Play className="w-3 h-3 mr-1" />
                                                Continue
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || selectedFilter !== "all"
                                ? "Try adjusting your search or filters"
                                : "You haven't enrolled in any courses yet"}
                        </p>
                        {!searchQuery && selectedFilter === "all" && (
                            <Link href="/student/courses">
                                <Button>
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Browse Courses
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
