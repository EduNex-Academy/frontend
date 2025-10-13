"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { BookOpen, Clock, Trophy, TrendingUp, PlayCircle, FileText, Calendar, RefreshCw, AlertCircle } from "lucide-react"
import { useDashboardData } from "@/hooks/use-student-dashboard"
import { useAuth } from "@/hooks/use-auth"
import EtherealWelcome from "@/components/common/EtherealWelcome"

export default function StudentDashboard() {
  const { user } = useAuth()
  const { dashboardData, isLoading, error, refetch } = useDashboardData()

  // Extract data with fallbacks
  const stats = dashboardData?.stats || {
    enrolledCoursesCount: 0,
    totalHoursLearned: 0,
    certificatesEarned: 0,
    averageScore: 0
  }
  
  const enrolledCourses = dashboardData?.enrolledCourses || []
  const upcomingQuizzes = dashboardData?.upcomingQuizzes || []

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <EtherealWelcome />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-36" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <EtherealWelcome />

        {/* Error Alert */}
        {error && (
          <div className="mb-6 mt-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-8">
          {[
            {
              title: "Enrolled Courses",
              value: stats.enrolledCoursesCount.toString(),
              change: `${stats.enrolledCoursesCount > 0 ? 'Active learning' : 'Start your journey'}`,
              icon: BookOpen,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "Hours Learned",
              value: stats.totalHoursLearned.toFixed(1),
              change: `${stats.totalHoursLearned > 10 ? 'Great progress!' : 'Keep going!'}`,
              icon: Clock,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              title: "Certificates",
              value: stats.certificatesEarned.toString(),
              change: `${enrolledCourses.length - stats.certificatesEarned} in progress`,
              icon: Trophy,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              title: "Average Score",
              value: `${Math.round(stats.averageScore)}%`,
              change: `${stats.averageScore >= 70 ? 'Excellent!' : stats.averageScore >= 50 ? 'Good progress' : 'Keep improving'}`,
              icon: TrendingUp,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((stat, index) => (
            <div
              key={stat.title}
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          {/* Continue Learning */}
          <div>
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-blue-600" />
                  Continue Learning
                </CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg transition-all duration-300 hover:shadow-md hover:border-blue-200 group"
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={course.thumbnailUrl || "/placeholder.svg"}
                          alt={course.title}
                          className="w-16 h-16 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <PlayCircle className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate group-hover:text-blue-600 transition-colors duration-200">
                          {course.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{course.instructorName}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className="font-medium">{Math.round(course.completionPercentage)}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={course.completionPercentage} className="h-2 progress-bar" />
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="transition-all duration-200 hover:scale-105 hover:bg-blue-50 bg-transparent"
                        onClick={() => window.location.href = `/student/courses/${course.id}`}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <p className="mb-4">No courses enrolled yet</p>
                    <Button 
                      onClick={() => window.location.href = '/student/courses'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Assignments */}
          <div>
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Upcoming Quizzes
                </CardTitle>
                <CardDescription>Don't miss these deadlines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingQuizzes.length > 0 ? (
                  upcomingQuizzes.slice(0, 5).map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 border rounded-lg transition-all duration-300 hover:shadow-md hover:border-orange-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-50 rounded-lg transition-transform duration-300 group-hover:scale-110">
                          <FileText className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium group-hover:text-orange-600 transition-colors duration-200">
                            {quiz.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{quiz.courseTitle}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {quiz.daysUntilDeadline === 0 ? 'Due today' : 
                               quiz.daysUntilDeadline === 1 ? 'Due tomorrow' :
                               `Due in ${quiz.daysUntilDeadline} days`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          quiz.daysUntilDeadline <= 1 
                            ? 'text-red-600 border-red-600 animate-pulse' 
                            : 'text-orange-600 border-orange-600'
                        }`}
                      >
                        {quiz.status === 'not-started' ? 'Pending' : 
                         quiz.status === 'in-progress' ? 'In Progress' : 'Completed'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>All caught up! No upcoming quizzes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
