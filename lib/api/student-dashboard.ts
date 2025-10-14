import { apiClient } from './config'
import { enrollmentApi, type EnrollmentDTO } from './enrollment'
import { courseApi } from './course'
import { moduleApi } from './module'
import { moduleProgressApi } from './module-progress'
import { quizApi } from './quiz'
import type { CourseDTO, QuizDTO, ModuleDTO } from '@/types'

export interface StudentStats {
  enrolledCoursesCount: number
  totalHoursLearned: number
  certificatesEarned: number
  averageScore: number
}

export interface EnrolledCourseWithProgress extends CourseDTO {
  enrollmentId: number
  enrolledAt: string
  completionPercentage: number
  lastAccessed?: string
  instructorName: string
  estimatedDuration?: number // in hours
}

export interface UpcomingQuiz extends QuizDTO {
  courseTitle: string
  daysUntilDeadline: number
  status: 'not-started' | 'in-progress' | 'completed'
}

export interface DashboardData {
  stats: StudentStats
  enrolledCourses: EnrolledCourseWithProgress[]
  upcomingQuizzes: UpcomingQuiz[]
}

export const studentDashboardApi = {
  /**
   * Get comprehensive dashboard data for the current student
   */
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      // Use the more efficient enrolled courses API
      const enrolledCourses = await courseApi.getEnrolledCourses('PUBLISHED')
      
      // Transform to our expected format
      const transformedCourses: EnrolledCourseWithProgress[] = enrolledCourses.map(course => ({
        ...course,
        enrollmentId: 0, // Will be filled by enrollment API if needed
        enrolledAt: course.createdAt,
        completionPercentage: course.completionPercentage || 0,
        instructorName: course.instructorName || 'Andrew Ng',
        estimatedDuration: course.moduleCount ? course.moduleCount * 2 : 10 // Estimate 2 hours per module
      }))

      // Fetch upcoming quizzes from enrolled courses
      const upcomingQuizzesPromises = transformedCourses.slice(0, 3).map(async (course) => {
        try {
          const modules = await moduleApi.getModulesByCourseId(course.id)
          const quizzesPromises = modules.map((module: ModuleDTO) => 
            quizApi.getQuizzesByModuleId(module.id).catch(() => [])
          )
          const moduleQuizzes = await Promise.all(quizzesPromises)
          const allQuizzes = moduleQuizzes.flat()
          
          return allQuizzes.map((quiz: QuizDTO) => ({
            ...quiz,
            courseTitle: course.title,
            daysUntilDeadline: Math.floor(Math.random() * 7) + 1, // Mock deadline for now
            status: 'not-started' as const
          }))
        } catch (error) {
          console.error(`Failed to fetch quizzes for course ${course.id}:`, error)
          return []
        }
      })

      const quizzesResults = await Promise.allSettled(upcomingQuizzesPromises)
      const upcomingQuizzes = quizzesResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<UpcomingQuiz[]>).value)
        .flat()
        .slice(0, 5) // Limit to 5 most urgent

      // Calculate statistics
      const stats: StudentStats = {
        enrolledCoursesCount: transformedCourses.length,
        totalHoursLearned: transformedCourses.reduce((total, course) => {
          // Estimate hours based on completion percentage
          const estimatedTotalHours = course.estimatedDuration || 0
          return total + (estimatedTotalHours * (course.completionPercentage / 100))
        }, 0),
        certificatesEarned: transformedCourses.filter(course => course.completionPercentage === 100).length,
        averageScore: transformedCourses.length > 0 
          ? transformedCourses.reduce((sum, course) => sum + course.completionPercentage, 0) / transformedCourses.length
          : 0
      }

      return {
        stats,
        enrolledCourses: transformedCourses,
        upcomingQuizzes
      }

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error)
      const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard data'
      throw new Error(message)
    }
  },

  /**
   * Get student statistics only
   */
  getStudentStats: async (): Promise<StudentStats> => {
    try {
      const enrollments = await enrollmentApi.getUserEnrollments()
      
      const stats: StudentStats = {
        enrolledCoursesCount: enrollments.length,
        totalHoursLearned: enrollments.reduce((total, enrollment) => {
          // Rough estimate: 30 hours per course * completion percentage
          return total + (30 * (enrollment.completionPercentage / 100))
        }, 0),
        certificatesEarned: enrollments.filter(e => e.completionPercentage === 100).length,
        averageScore: enrollments.length > 0 
          ? enrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / enrollments.length
          : 0
      }

      return stats
    } catch (error: any) {
      console.error('Failed to fetch student stats:', error)
      throw new Error('Failed to fetch student statistics')
    }
  },

  /**
   * Get recent activity for the student
   */
  getRecentActivity: async (): Promise<any[]> => {
    try {
      // This would typically come from an activity log API
      // For now, we'll return enrolled courses as recent activity
      const enrollments = await enrollmentApi.getUserEnrollments()
      
      return enrollments
        .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
        .slice(0, 5)
        .map(enrollment => ({
          id: enrollment.id,
          type: 'enrollment',
          description: `Enrolled in course: ${enrollment.courseTitle}`,
          timestamp: enrollment.enrolledAt,
          courseId: enrollment.courseId
        }))
    } catch (error: any) {
      console.error('Failed to fetch recent activity:', error)
      throw new Error('Failed to fetch recent activity')
    }
  }
}