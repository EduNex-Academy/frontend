"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  Heart,
  Share2,
  Award,
  CheckCircle,
  ArrowLeft,
  Globe,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Course } from "@/types/course"

interface CourseDetailsLayoutProps {
  course: Course
  userRole: 'STUDENT' | 'INSTRUCTOR'
}

const navigationItems = [
  { id: 'about', label: 'About', icon: BookOpen },
  { id: 'outcomes', label: 'Outcomes', icon: Target },
  { id: 'modules', label: 'Modules', icon: BookOpen },
  { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'reviews', label: 'Reviews', icon: Star },
]

// Mock data for course details
const mockCourseDetails = {
  outcomes: [
    "Build modern web applications with React and TypeScript",
    "Master state management with Redux and Context API",
    "Implement authentication and authorization",
    "Deploy applications to cloud platforms",
    "Write clean, maintainable, and testable code",
    "Understand modern development workflows"
  ],
  modules: [
    {
      id: 1,
      title: "Introduction to React",
      lessons: 8,
      duration: "3.5 hours",
      completed: true,
      lessons_detail: [
        { title: "What is React?", duration: "25 min", completed: true },
        { title: "Setting up the environment", duration: "30 min", completed: true },
        { title: "Your first component", duration: "45 min", completed: false },
      ]
    },
    {
      id: 2,
      title: "Components and Props",
      lessons: 12,
      duration: "5.2 hours",
      completed: false,
      lessons_detail: [
        { title: "Functional vs Class Components", duration: "35 min", completed: false },
        { title: "Props and State", duration: "40 min", completed: false },
        { title: "Event Handling", duration: "30 min", completed: false },
      ]
    },
    {
      id: 3,
      title: "State Management",
      lessons: 15,
      duration: "6.8 hours",
      completed: false,
      lessons_detail: [
        { title: "useState Hook", duration: "45 min", completed: false },
        { title: "useEffect Hook", duration: "50 min", completed: false },
        { title: "Context API", duration: "60 min", completed: false },
      ]
    }
  ],
  recommendations: [
    {
      id: 1,
      title: "Advanced React Patterns",
      instructor: "John Smith",
      rating: 4.9,
      thumbnail: "/placeholder.svg",
      price: 89,
      level: "Advanced"
    },
    {
      id: 2,
      title: "TypeScript Fundamentals",
      instructor: "Sarah Wilson",
      rating: 4.7,
      thumbnail: "/placeholder.svg",
      price: 69,
      level: "Intermediate"
    }
  ],
  testimonials: [
    {
      id: 1,
      name: "Alice Johnson",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "This course completely transformed my understanding of React. The instructor explains complex concepts in a very clear and practical way.",
      role: "Frontend Developer",
      company: "Google"
    },
    {
      id: 2,
      name: "Bob Smith",
      avatar: "/placeholder.svg",
      rating: 5,
      text: "Excellent course with hands-on projects. I was able to apply the concepts immediately in my work.",
      role: "Software Engineer",
      company: "Microsoft"
    }
  ],
  reviews: [
    {
      id: 1,
      name: "Emma Davis",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2 days ago",
      text: "Outstanding course! The project-based approach made learning React enjoyable and practical. Highly recommended!"
    },
    {
      id: 2,
      name: "Michael Brown",
      avatar: "/placeholder.svg",
      rating: 4,
      date: "1 week ago",
      text: "Great content and well-structured modules. The instructor is knowledgeable and engaging."
    },
    {
      id: 3,
      name: "Lisa Wilson",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2 weeks ago",
      text: "This course exceeded my expectations. The real-world examples and exercises were particularly helpful."
    }
  ]
}

export function CourseDetailsLayout({ course, userRole }: CourseDetailsLayoutProps) {
  const [activeTab, setActiveTab] = useState('about')
  const [isWishlisted, setIsWishlisted] = useState(false)

  const isInstructor = userRole === 'INSTRUCTOR'
  const backUrl = isInstructor ? '/instructor/courses' : '/student/courses'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-200/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={backUrl}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="rounded-full border-blue-200/50 hover:border-blue-300"
              >
                <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                Wishlist
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-blue-200/50 hover:border-blue-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Hero */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/30 overflow-hidden mb-8">
              <div className="relative aspect-video">
                <Image
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-blue-600/90 hover:bg-blue-600 backdrop-blur-sm">
                      {course.category}
                    </Badge>
                    <Badge className="bg-purple-600/90 hover:bg-purple-600 backdrop-blur-sm">
                      {course.level}
                    </Badge>
                    {course.learningPath && (
                      <Badge className="bg-green-600/90 hover:bg-green-600 backdrop-blur-sm">
                        {course.learningPath}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-white/90 text-lg">
                    {course.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Mini Navigation */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200/30 p-1 mb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-6 bg-transparent p-0 h-auto gap-1">
                  {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl
                      data-[state=active]:bg-gray-50/50
                      data-[state=active]:border-b-2 border-blue-600
                      data-[state=active]:text-blue-600
                      transition-all duration-200
                      hover:bg-gray-100
                      group"
                    >
                    <Icon
                      className={`w-5 h-5
                      group-hover:text-blue-600
                      ${activeTab === item.id ? 'text-blue-600' : 'text-gray-600'}
                      `}
                    />
                    <span className="text-sm font-medium group-hover:text-blue-600 hidden sm:block">{item.label}</span>
                    </TabsTrigger>
                  )
                  })}
                </TabsList>

                {/* Tab Content */}
                <div className="mt-8">
                  <TabsContent value="about" className="mt-0">
                    <AboutSection course={course} />
                  </TabsContent>
                  <TabsContent value="outcomes" className="mt-0">
                    <OutcomesSection outcomes={mockCourseDetails.outcomes} />
                  </TabsContent>
                  <TabsContent value="modules" className="mt-0">
                    <ModulesSection modules={mockCourseDetails.modules} userRole={userRole} />
                  </TabsContent>
                  <TabsContent value="recommendations" className="mt-0">
                    <RecommendationsSection recommendations={mockCourseDetails.recommendations} />
                  </TabsContent>
                  <TabsContent value="testimonials" className="mt-0">
                    <TestimonialsSection testimonials={mockCourseDetails.testimonials} />
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-0">
                    <ReviewsSection reviews={mockCourseDetails.reviews} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CourseSidebar course={course} userRole={userRole} />
          </div>
        </div>
      </div>
    </div>
  )
}

// About Section Component
function AboutSection({ course }: { course: Course }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">About this Course</h3>
          <p className="text-gray-700 leading-relaxed">
            {course.description}
          </p>
        </div>

        <Separator className="bg-blue-200/30" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50/50 rounded-xl">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Duration</div>
            <div className="font-semibold">{course.duration}</div>
          </div>
          <div className="text-center p-4 bg-purple-50/50 rounded-xl">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Students</div>
            <div className="font-semibold">{course.studentsEnrolled}</div>
          </div>
          <div className="text-center p-4 bg-green-50/50 rounded-xl">
            <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Lessons</div>
            <div className="font-semibold">{course.lessons}</div>
          </div>
          <div className="text-center p-4 bg-orange-50/50 rounded-xl">
            <Award className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Level</div>
            <div className="font-semibold">{course.level}</div>
          </div>
        </div>

        <Separator className="bg-blue-200/30" />

        <div>
          <h4 className="font-semibold mb-3 text-gray-900">What you'll learn</h4>
          <div className="grid gap-3">
            {[
              "Master the fundamentals and advanced concepts",
              "Build real-world projects from scratch",
              "Best practices and industry standards",
              "Career guidance and portfolio development"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Outcomes Section Component
function OutcomesSection({ outcomes }: { outcomes: string[] }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Learning Outcomes</h3>
      <div className="grid gap-4">
        {outcomes.map((outcome, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/30 rounded-xl border border-blue-100/50">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </div>
            <p className="text-gray-700 font-medium">{outcome}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Modules Section Component
function ModulesSection({ modules, userRole }: { modules: any[], userRole: string }) {
  return (
    <div className="space-y-4">
      {modules.map((module, index) => (
        <Card key={module.id} className="bg-white/50 backdrop-blur-sm border border-blue-200/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{module.lessons} lessons</span>
                    <span>•</span>
                    <span>{module.duration}</span>
                  </div>
                </div>
              </div>
              {module.completed && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {module.lessons_detail.map((lesson: any, lessonIndex: number) => (
                <div key={lessonIndex} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {lesson.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`text-sm ${lesson.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                    {userRole === 'STUDENT' && (
                      <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                        <Play className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Recommendations Section Component
function RecommendationsSection({ recommendations }: { recommendations: any[] }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Recommended Courses</h3>
      <div className="grid gap-4">
        {recommendations.map((course) => (
          <div key={course.id} className="flex gap-4 p-4 bg-gradient-to-r from-blue-50/30 to-purple-50/20 rounded-xl border border-blue-100/50 hover:shadow-md transition-shadow">
            <Image
              src={course.thumbnail}
              alt={course.title}
              width={80}
              height={60}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
              <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ${course.price}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Testimonials Section Component
function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Student Success Stories</h3>
      <div className="grid gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/30 rounded-xl border border-blue-100/50">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <div className="flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{testimonial.role} at {testimonial.company}</p>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Reviews Section Component
function ReviewsSection({ reviews }: { reviews: any[] }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Student Reviews</h3>
        <Button variant="outline" size="sm" className="rounded-full">
          Write a Review
        </Button>
      </div>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-4 p-4 bg-gray-50/50 rounded-xl">
            <Avatar>
              <AvatarImage src={review.avatar} alt={review.name} />
              <AvatarFallback>{review.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-700">{review.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Course Sidebar Component
function CourseSidebar({ course, userRole }: { course: Course, userRole: string }) {
  const isInstructor = userRole === 'INSTRUCTOR'

  return (
    <div className="space-y-6">
      {/* Instructor Card */}
      <Card className="bg-white/70 backdrop-blur-sm border border-blue-200/30">
        <CardHeader>
          <CardTitle className="text-lg">
            {isInstructor ? 'Course Analytics' : 'Instructor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isInstructor ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{course.studentsEnrolled}</div>
                  <div className="text-xs text-gray-600">Students</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{course.rating}</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </div>
              <Button className="w-full" size="lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={course.instructorAvatar} alt={course.instructor} />
                  <AvatarFallback>{course.instructor?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{course.instructor}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.9 instructor rating</span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total students</span>
                  <span className="font-semibold">125,000+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Reviews</span>
                  <span className="font-semibold">45,000+</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price/Enrollment Card */}
      {!isInstructor && (
        <Card className="bg-white/70 backdrop-blur-sm border border-blue-200/30">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">${course.price}</div>
                {course.originalPrice && (
                  <div className="text-lg text-gray-500 line-through">${course.originalPrice}</div>
                )}
              </div>

              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                <Play className="w-5 h-5 mr-2" />
                Enroll Now
              </Button>

              <Button variant="outline" size="lg" className="w-full">
                Try Free Preview
              </Button>

              <div className="text-center text-sm text-gray-600">
                30-day money-back guarantee
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Stats */}
      <Card className="bg-white/70 backdrop-blur-sm border border-blue-200/30">
        <CardHeader>
          <CardTitle className="text-lg">Course Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm">{course.duration} of content</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span className="text-sm">{course.lessons} lessons</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Lifetime access</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-sm">Certificate of completion</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-red-600" />
              <span className="text-sm">Learn at your own pace</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
