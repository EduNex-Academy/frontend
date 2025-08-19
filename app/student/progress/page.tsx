"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BookOpen, 
  Clock, 
  Award, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle2,
  PlayCircle,
  Pause,
  Trophy,
  Flame,
  Zap,
  Star,
  ChevronRight,
  Brain,
  Timer
} from "lucide-react"
import { mockCourses, mockProgress } from "@/data/mock-data"
import { StatsCards } from "@/components/common/StatsCards"
import Link from "next/link"

// Enhanced progress data with detailed analytics
const enhancedProgressData = mockCourses.filter(course => course.isEnrolled).map((course, index) => {
  const baseProgress = mockProgress.find(p => p.courseId === course.id) || {
    id: `${index + 1}`,
    userId: "1",
    courseId: course.id,
    completedLessons: Math.floor(Math.random() * course.lessons),
    totalLessons: course.lessons,
    percentage: Math.floor(Math.random() * 100),
    lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    timeSpent: Math.floor(Math.random() * 500) + 50
  }

  return {
    ...baseProgress,
    course,
    weeklyGoal: 20, // hours per week
    currentStreak: Math.floor(Math.random() * 30) + 1,
    longestStreak: Math.floor(Math.random() * 50) + 20,
    avgSessionTime: Math.floor(Math.random() * 60) + 30, // minutes
    sessionsThisWeek: Math.floor(Math.random() * 10) + 1,
    quizScores: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
      score: Math.floor(Math.random() * 40) + 60,
      maxScore: 100,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      topic: ["Variables", "Functions", "Loops", "Objects", "APIs"][Math.floor(Math.random() * 5)]
    })),
    assignments: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
      score: Math.floor(Math.random() * 40) + 60,
      maxScore: 100,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      title: ["Project 1", "Assignment 2", "Final Project"][Math.floor(Math.random() * 3)]
    })),
    learningVelocity: Math.random() * 2 + 0.5, // lessons per day
    difficultyProgress: {
      easy: Math.floor(Math.random() * 10) + 5,
      medium: Math.floor(Math.random() * 8) + 3,
      hard: Math.floor(Math.random() * 5) + 1
    },
    skillsAcquired: [
      "Problem Solving",
      "Critical Thinking", 
      "Technical Writing",
      "Code Review",
      "Testing"
    ].slice(0, Math.floor(Math.random() * 3) + 2),
    weeklyActivity: Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).getDay(),
      hours: Math.random() * 4,
      sessions: Math.floor(Math.random() * 3)
    })),
    monthlyStats: Array.from({ length: 4 }, (_, i) => ({
      week: i + 1,
      hoursStudied: Math.floor(Math.random() * 20) + 5,
      lessonsCompleted: Math.floor(Math.random() * 10) + 3,
      quizzesTaken: Math.floor(Math.random() * 5) + 1
    })),
    certificationProgress: {
      totalRequirements: 10,
      completed: Math.floor(Math.random() * 7) + 2,
      requirements: [
        { name: "Complete all lessons", completed: baseProgress.percentage >= 100 },
        { name: "Pass all quizzes", completed: Math.random() > 0.3 },
        { name: "Submit final project", completed: Math.random() > 0.5 },
        { name: "Peer review participation", completed: Math.random() > 0.6 },
        { name: "Community engagement", completed: Math.random() > 0.4 }
      ]
    }
  }
})

export default function ProgressPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("week")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  const filteredData = selectedCourse === "all" 
    ? enhancedProgressData 
    : enhancedProgressData.filter(p => p.courseId === selectedCourse)

  // Calculate overall statistics
  const uniqueSkills = useMemo(() => {
    const allSkills = enhancedProgressData.flatMap(p => p.skillsAcquired)
    return Array.from(new Set(allSkills))
  }, [])

  const overallStats = useMemo(() => {
    const totalTimeSpent = enhancedProgressData.reduce((sum, p) => sum + p.timeSpent, 0)
    const totalLessons = enhancedProgressData.reduce((sum, p) => sum + p.totalLessons, 0)
    const completedLessons = enhancedProgressData.reduce((sum, p) => sum + p.completedLessons, 0)
    const averageProgress = enhancedProgressData.reduce((sum, p) => sum + p.percentage, 0) / enhancedProgressData.length
    const totalCourses = enhancedProgressData.length
    const completedCourses = enhancedProgressData.filter(p => p.percentage >= 100).length
    const currentStreak = Math.max(...enhancedProgressData.map(p => p.currentStreak))
    const skillsSet = new Set(enhancedProgressData.flatMap(p => p.skillsAcquired))
    const totalSkills = uniqueSkills.length

    return {
      totalTimeSpent: Math.floor(totalTimeSpent / 60), // convert to hours
      totalLessons,
      completedLessons,
      averageProgress,
      totalCourses,
      completedCourses,
      currentStreak,
      totalSkills
    }
  }, [])

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        {/* Stats Cards */}
        <StatsCards cards={[
          {
            title: "Study Time",
            subtitle: "Hours",
            value: overallStats.totalTimeSpent,
            icon: Clock,
            color: "blue",
            accent: "from-blue-500 to-purple-600"
          },
          {
            title: "Lessons",
            subtitle: "Completed",
            value: overallStats.completedLessons,
            icon: BookOpen,
            color: "green",
            accent: "from-green-500 to-teal-600"
          },
          {
            title: "Current",
            subtitle: "Streak",
            value: overallStats.currentStreak,
            icon: Flame,
            color: "orange",
            accent: "from-orange-500 to-red-600"
          },
          {
            title: "Skills",
            subtitle: "Acquired",
            value: overallStats.totalSkills,
            icon: Brain,
            color: "purple",
            accent: "from-purple-500 to-pink-600"
          }
        ]} />

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200/30 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64 rounded-full border-blue-200/50 bg-white/60 backdrop-blur-sm">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {enhancedProgressData.map(p => (
                  <SelectItem key={p.courseId} value={p.courseId}>{p.course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-48 rounded-full border-blue-200/50 bg-white/60 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-blue-200/30 p-1 rounded-full">
            <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
            <TabsTrigger value="courses" className="rounded-full">Course Progress</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-full">Performance</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-full">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Activity Chart */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end space-x-2 h-40">
                  {enhancedProgressData[0]?.weeklyActivity.map((day, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md w-full transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                        style={{ height: `${Math.max((day.hours / 4) * 100, 5)}%` }}
                      />
                      <div className="text-xs text-gray-600 mt-2">{dayNames[day.day]}</div>
                      <div className="text-xs text-gray-500">{day.hours.toFixed(1)}h</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Velocity & Study Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-blue-200/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Learning Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredData.map((progress) => (
                      <div key={progress.courseId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium">{progress.course.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{progress.learningVelocity.toFixed(1)} lessons/day</div>
                          <div className="text-xs text-gray-500">avg velocity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-blue-200/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Study Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredData.map((progress) => (
                      <div key={progress.courseId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <PlayCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium">{progress.course.title}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{progress.sessionsThisWeek} sessions</div>
                          <div className="text-xs text-gray-500">{progress.avgSessionTime} min avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            {filteredData.map((progress) => (
              <Card key={progress.courseId} className="bg-white/70 backdrop-blur-sm border-blue-200/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={progress.course.thumbnail || "/placeholder.svg"}
                        alt={progress.course.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{progress.course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{progress.course.instructor}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {Math.floor(progress.timeSpent / 60)}h {progress.timeSpent % 60}m studied
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {progress.completedLessons}/{progress.totalLessons} lessons
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{progress.percentage}%</div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <Progress value={progress.percentage} className="h-3" />
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Difficulty Progress</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Easy</span>
                          <span>{progress.difficultyProgress.easy} completed</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Medium</span>
                          <span>{progress.difficultyProgress.medium} completed</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Hard</span>
                          <span>{progress.difficultyProgress.hard} completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Skills Acquired</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {progress.skillsAcquired.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Certification</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {progress.certificationProgress.completed}/{progress.certificationProgress.totalRequirements} requirements
                      </div>
                      <Progress 
                        value={(progress.certificationProgress.completed / progress.certificationProgress.totalRequirements) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-gray-500">
                      Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
                    </div>
                    <Link href={`/student/courses/${progress.courseId}`}>
                      <Button size="sm" variant="outline">
                        Continue Learning
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Quiz Performance */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Quiz Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.map((progress) => (
                    <div key={progress.courseId}>
                      <h4 className="font-medium text-gray-900 mb-3">{progress.course.title}</h4>
                      <div className="space-y-2">
                        {progress.quizScores.map((quiz, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div>
                              <span className="text-sm font-medium">{quiz.topic} Quiz</span>
                              <div className="text-xs text-gray-500">
                                {new Date(quiz.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${
                                quiz.score >= 90 ? 'text-green-600' :
                                quiz.score >= 80 ? 'text-blue-600' :
                                quiz.score >= 70 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {quiz.score}%
                              </div>
                              <div className="text-xs text-gray-500">{quiz.score}/{quiz.maxScore}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Assignment Performance */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Assignment Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.map((progress) => (
                    <div key={progress.courseId}>
                      <h4 className="font-medium text-gray-900 mb-3">{progress.course.title}</h4>
                      <div className="space-y-2">
                        {progress.assignments.map((assignment, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div>
                              <span className="text-sm font-medium">{assignment.title}</span>
                              <div className="text-xs text-gray-500">
                                {new Date(assignment.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-bold ${
                                assignment.score >= 90 ? 'text-green-600' :
                                assignment.score >= 80 ? 'text-blue-600' :
                                assignment.score >= 70 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {assignment.score}%
                              </div>
                              <div className="text-xs text-gray-500">{assignment.score}/{assignment.maxScore}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {/* Streaks and Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Flame className="w-12 h-12" />
                    <div>
                      <h3 className="text-xl font-bold">Study Streak</h3>
                      <p className="text-orange-100">Keep the momentum going!</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{overallStats.currentStreak} days</div>
                    <div className="text-sm text-orange-100">
                      Longest: {Math.max(...enhancedProgressData.map(p => p.longestStreak))} days
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Trophy className="w-12 h-12" />
                    <div>
                      <h3 className="text-xl font-bold">Achievements</h3>
                      <p className="text-yellow-100">Your learning milestones</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{overallStats.completedCourses}</div>
                    <div className="text-sm text-yellow-100">Courses completed</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certification Progress */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certification Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredData.map((progress) => (
                    <div key={progress.courseId}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{progress.course.title}</h4>
                        <div className="text-sm text-gray-600">
                          {progress.certificationProgress.completed}/{progress.certificationProgress.totalRequirements} complete
                        </div>
                      </div>
                      <div className="space-y-2">
                        {progress.certificationProgress.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              req.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`}>
                              {req.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${req.completed ? 'text-green-700 line-through' : 'text-gray-600'}`}>
                              {req.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Badges */}
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Skills & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {uniqueSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
