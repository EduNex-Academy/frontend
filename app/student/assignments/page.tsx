"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Search,
    Clock,
    FileText,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Upload,
    Download,
    Eye,
    BookOpen,
    User,
    TrendingUp,
    Award
} from "lucide-react"
import { mockCourses, mockAssignments } from "@/data/mock-data"
import { StatsCards } from "@/components/common/StatsCards"

// Extended assignment data with more details
const extendedAssignments = mockAssignments.map((assignment, index) => ({
    ...assignment,
    courseName: mockCourses.find(c => c.id === assignment.courseId)?.title || "Unknown Course",
    courseInstructor: mockCourses.find(c => c.id === assignment.courseId)?.instructor || "Unknown Instructor",
    courseCategory: mockCourses.find(c => c.id === assignment.courseId)?.category || "General",
    description: [
        "Create a comprehensive data analysis project using Python and pandas library",
        "Build a responsive web application using React and modern CSS",
        "Develop a machine learning model to predict housing prices",
        "Design and implement a RESTful API with proper documentation"
    ][index] || "Complete the assigned task according to the instructions provided.",
    submissionFormat: ["PDF Report + Code Files", "GitHub Repository Link", "Jupyter Notebook", "ZIP Archive"][index % 4],
    difficulty: ["Medium", "Hard", "Easy", "Medium"][index % 4],
    estimatedHours: [8, 12, 4, 6][index % 4],
    submittedAt: assignment.status === "submitted" ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : null,
    feedback: assignment.status === "graded" ? "Excellent work! Your analysis was thorough and well-structured." : null,
    attachments: [
        { name: "assignment_requirements.pdf", size: "2.3 MB", type: "pdf" },
        { name: "sample_dataset.csv", size: "1.8 MB", type: "csv" }
    ]
}))

export default function AssignmentsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFilter, setSelectedFilter] = useState("all")
    const [selectedCourse, setSelectedCourse] = useState("all")
    const [activeTab, setActiveTab] = useState("all")

    const courseMap = new Map()
    extendedAssignments.forEach(a => {
        courseMap.set(a.courseId, { id: a.courseId, name: a.courseName })
    })
    const courses = Array.from(courseMap.values())

    const filteredAssignments = useMemo(() => {
        let filtered = extendedAssignments

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(assignment =>
                assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Status filter
        if (activeTab !== "all") {
            filtered = filtered.filter(assignment => assignment.status === activeTab)
        }

        // Course filter
        if (selectedCourse !== "all") {
            filtered = filtered.filter(assignment => assignment.courseId === selectedCourse)
        }

        // Sort by due date
        filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

        return filtered
    }, [searchQuery, selectedFilter, selectedCourse, activeTab])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'submitted':
            case 'graded':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getDaysUntilDeadline = (dueDate: string) => {
        const now = new Date()
        const deadline = new Date(dueDate)
        const diffTime = deadline.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const getDeadlineStatus = (dueDate: string, status: string) => {
        const days = getDaysUntilDeadline(dueDate)
        if (status === 'submitted' || status === 'graded') return 'submitted'
        if (days < 0) return 'overdue'
        if (days === 0) return 'due-today'
        if (days <= 3) return 'due-soon'
        return 'upcoming'
    }

    const stats = {
        total: extendedAssignments.length,
        pending: extendedAssignments.filter(a => a.status === 'pending').length,
        submitted: extendedAssignments.filter(a => a.status === 'submitted').length,
        graded: extendedAssignments.filter(a => a.status === 'graded').length
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
                    <p className="text-gray-600">Manage your course assignments and deadlines</p>
                </div>

                {/* Stats Cards */}
                <StatsCards cards={[
                    { title: "Total", subtitle: "Assignments", value: 4, icon: BookOpen, color: "blue", accent: "from-blue-500 to-blue-600" },
                    { title: "Pending", subtitle: "To Do", value: 2, icon: Clock, color: "orange", accent: "from-orange-500 to-orange-600" },
                    { title: "Submitted", subtitle: "Review", value: 1, icon: TrendingUp, color: "yellow", accent: "from-yellow-500 to-yellow-600" },
                    { title: "Graded", subtitle: "Complete", value: 1, icon: Award, color: "green", accent: "from-green-500 to-green-600" }
                ]} />

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-blue-200/30 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search assignments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-full border-blue-200/50 focus:border-blue-400 bg-white/60 backdrop-blur-sm"
                            />
                        </div>

                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-48 rounded-full border-blue-200/50 bg-white/60 backdrop-blur-sm">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white/70 backdrop-blur-sm border border-blue-200/30 p-1 rounded-full">
                        <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                            All ({extendedAssignments.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-full data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                            Pending ({stats.pending})
                        </TabsTrigger>
                        <TabsTrigger value="submitted" className="rounded-full data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                            Submitted ({stats.submitted})
                        </TabsTrigger>
                        <TabsTrigger value="graded" className="rounded-full data-[state=active]:bg-green-600 data-[state=active]:text-white">
                            Graded ({stats.graded})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-4">
                        {filteredAssignments.map((assignment) => {
                            const deadlineStatus = getDeadlineStatus(assignment.dueDate, assignment.status)
                            const daysUntil = getDaysUntilDeadline(assignment.dueDate)

                            return (
                                <Card key={assignment.id} className="bg-white/70 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                                                        <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>

                                                        {/* Course Info */}
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="w-4 h-4 text-gray-500" />
                                                                <span className="text-sm text-gray-600">{assignment.courseName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4 text-gray-500" />
                                                                <span className="text-sm text-gray-600">{assignment.courseInstructor}</span>
                                                            </div>
                                                        </div>

                                                        {/* Assignment Details */}
                                                        <div className="flex flex-wrap gap-4 mb-4">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4 text-gray-500" />
                                                                <span className="text-sm text-gray-600">{assignment.estimatedHours}h estimated</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                {assignment.difficulty}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {assignment.submissionFormat}
                                                            </Badge>
                                                        </div>

                                                        {/* Status and Score */}
                                                        <div className="flex items-center gap-4">
                                                            <Badge className={getStatusColor(assignment.status)}>
                                                                {assignment.status === 'pending' ? 'Pending' :
                                                                    assignment.status === 'submitted' ? 'Submitted' :
                                                                        assignment.status === 'graded' ? 'Graded' : assignment.status}
                                                            </Badge>

                                                            {assignment.status === 'graded' && assignment.score !== undefined && (
                                                                <div className="text-sm">
                                                                    <span className="font-medium">Score: </span>
                                                                    <span className={`font-bold ${assignment.score >= 80 ? 'text-green-600' : assignment.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                        {assignment.score}/{assignment.maxScore}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Deadline and Actions */}
                                            <div className="text-right">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${deadlineStatus === 'overdue' ? 'bg-red-100 text-red-700' :
                                                        deadlineStatus === 'due-today' ? 'bg-orange-100 text-orange-700' :
                                                            deadlineStatus === 'due-soon' ? 'bg-yellow-100 text-yellow-700' :
                                                                deadlineStatus === 'submitted' ? 'bg-green-100 text-green-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {deadlineStatus === 'overdue' && <XCircle className="w-4 h-4" />}
                                                    {deadlineStatus === 'due-today' && <AlertTriangle className="w-4 h-4" />}
                                                    {deadlineStatus === 'due-soon' && <Clock className="w-4 h-4" />}
                                                    {deadlineStatus === 'submitted' && <CheckCircle2 className="w-4 h-4" />}

                                                    {deadlineStatus === 'submitted' ? 'Submitted' :
                                                        deadlineStatus === 'overdue' ? `${Math.abs(daysUntil)} days overdue` :
                                                            deadlineStatus === 'due-today' ? 'Due today' :
                                                                deadlineStatus === 'due-soon' ? `Due in ${daysUntil} days` :
                                                                    `Due in ${daysUntil} days`}
                                                </div>

                                                <p className="text-sm text-gray-600 mb-4">
                                                    Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>

                                                <div className="space-y-2">
                                                    {assignment.status === 'pending' && (
                                                        <Button size="sm" className="w-full">
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Submit
                                                        </Button>
                                                    )}

                                                    {assignment.status === 'submitted' && (
                                                        <Button size="sm" variant="outline" className="w-full">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Submission
                                                        </Button>
                                                    )}

                                                    {assignment.status === 'graded' && (
                                                        <Button size="sm" variant="outline" className="w-full">
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download Feedback
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submitted info */}
                                        {assignment.submittedAt && (
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <p className="text-sm text-gray-600">
                                                    Submitted on {new Date(assignment.submittedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                {assignment.feedback && (
                                                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                                        <p className="text-sm text-green-800 font-medium">Instructor Feedback:</p>
                                                        <p className="text-sm text-green-700">{assignment.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Attachments */}
                                        {assignment.attachments && assignment.attachments.length > 0 && (
                                            <div className="border-t border-gray-200 pt-4 mt-4">
                                                <p className="text-sm font-medium text-gray-900 mb-2">Attachments:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {assignment.attachments.map((file, index) => (
                                                        <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                                            <FileText className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm text-gray-700">{file.name}</span>
                                                            <span className="text-xs text-gray-500">({file.size})</span>
                                                            <Button size="sm" variant="ghost" className="p-1 h-auto">
                                                                <Download className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}

                        {filteredAssignments.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
                                <p className="text-gray-600">
                                    {searchQuery || selectedCourse !== "all"
                                        ? "Try adjusting your search or filters"
                                        : "You don't have any assignments yet"}
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
