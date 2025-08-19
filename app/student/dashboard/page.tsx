"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Trophy, TrendingUp, PlayCircle, FileText, Calendar, CreditCard, Sparkles } from "lucide-react"
import { mockCourses, mockAssignments } from "@/data/mock-data"
import EtherealWelcome from "@/components/common/EtherealWelcome"

export default function StudentDashboard() {
  // Mock enrolled courses
  const enrolledCourses = mockCourses.slice(0, 3).map((course) => ({
    ...course,
    isEnrolled: true,
    progress: Math.floor(Math.random() * 100),
    instructorName: course.instructor,
  }))

  const upcomingAssignments = mockAssignments.filter((a) => a.status === "pending")

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <EtherealWelcome />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 mt-8">
          {[
            {
              title: "Enrolled Courses",
              value: "3",
              change: "+1 from last month",
              icon: BookOpen,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "Hours Learned",
              value: "24.5",
              change: "+2.5 this week",
              icon: Clock,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              title: "Certificates",
              value: "2",
              change: "1 in progress",
              icon: Trophy,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              title: "Average Score",
              value: "87%",
              change: "+5% from last month",
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
                {enrolledCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg transition-all duration-300 hover:shadow-md hover:border-blue-200 group"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
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
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={course.progress} className="h-2 progress-bar" />
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="transition-all duration-200 hover:scale-105 hover:bg-blue-50 bg-transparent"
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Continue
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Assignments */}
          <div>
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Upcoming Assignments
                </CardTitle>
                <CardDescription>Don't miss these deadlines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAssignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg transition-all duration-300 hover:shadow-md hover:border-orange-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-50 rounded-lg transition-transform duration-300 group-hover:scale-110">
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium group-hover:text-orange-600 transition-colors duration-200">
                          {assignment.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-600 animate-pulse">
                      Pending
                    </Badge>
                  </div>
                ))}
                {upcomingAssignments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>All caught up! No upcoming assignments</p>
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
