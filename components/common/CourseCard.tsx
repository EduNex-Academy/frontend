"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Clock, 
  Users, 
  Star, 
  Play,
  Heart
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Course } from "@/types/course"

interface CourseCardProps {
  course: Course
  userRole?: 'STUDENT' | 'INSTRUCTOR'
}

export function CourseCard({ course, userRole = 'STUDENT' }: CourseCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  const levelColors: Record<string, string> = {
    Beginner: 'bg-green-100 text-green-700 border-green-200',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Advanced: 'bg-red-100 text-red-700 border-red-200'
  }

  const isInstructor = userRole === 'INSTRUCTOR'
  const courseDetailsUrl = isInstructor 
    ? `/instructor/courses/${course.id}` 
    : `/student/courses/${course.id}`

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm bg-white overflow-hidden max-w-sm">
      {/* Course Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay with action buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link href={courseDetailsUrl}>
            <Button size="sm" className="bg-white/90 text-black hover:bg-white">
              <Play className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </Link>
        </div>

        {/* Price badge */}
        <div className="absolute top-2 right-2">
          {course.price === 0 ? (
            <Badge className="bg-green-500 hover:bg-green-500 text-xs">Free</Badge>
          ) : (
            <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">
              ${course.price}
              {course.originalPrice && (
                <span className="line-through ml-1 text-xs opacity-75">
                  ${course.originalPrice}
                </span>
              )}
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <div className="absolute top-2 left-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="w-7 h-7 p-0 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
          >
            <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Progress bar for enrolled courses */}
        {course.isEnrolled && course.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-1.5">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium">Progress</span>
              <span>{course.progress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={courseDetailsUrl} className="block">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                {course.title}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {course.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2 px-4">
        {/* Instructor info */}
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={course.instructorAvatar} />
            <AvatarFallback className="text-xs">
              {course.instructor.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{course.instructor}</span>
        </div>

        {/* Course stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {course.duration}
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {course.studentsEnrolled.toLocaleString()}
            </div>
          </div>
          
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course.rating}</span>
            <span className="ml-1">(1.2k)</span>
          </div>
        </div>

        {/* Tags and Level */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className={`${levelColors[course.level]} text-xs px-1.5 py-0.5`}>
            {course.level}
          </Badge>
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {course.category}
          </Badge>
          {course.learningPath && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0.5">
              {course.learningPath}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
