import { apiClient } from './config';
import { enrollmentApi, EnrollmentDTO } from './enrollment';
import { moduleProgressApi } from './module-progress';
import { courseApi } from './course';
import { CourseDTO } from '@/types';

export interface EnrollmentStatistics {
  totalEnrollments: number;
  courseEnrollments: {
    courseId: number;
    courseTitle: string;
    enrollmentCount: number;
    completionRate: number;
  }[];
  enrollmentTrends: {
    period: string; // e.g., 'Jan 2023', 'Feb 2023', etc.
    count: number;
  }[];
}

export interface ProgressStatistics {
  averageCompletionRate: number;
  courseCompletionRates: {
    courseId: number;
    courseTitle: string;
    completionRate: number;
    totalStudents: number;
    studentsCompleted: number;
  }[];
  moduleCompletionRates: {
    moduleId: number;
    moduleTitle: string;
    courseId: number;
    courseTitle: string;
    completionRate: number;
    totalStudents: number;
    studentsCompleted: number;
  }[];
}

export interface EngagementStatistics {
  mostEngagedCourses: {
    courseId: number;
    courseTitle: string;
    engagementScore: number;
  }[];
  leastEngagedCourses: {
    courseId: number;
    courseTitle: string;
    engagementScore: number;
  }[];
  averageTimeSpent: {
    courseId: number;
    courseTitle: string;
    averageMinutes: number;
  }[];
}

export interface InstructorDashboardStatistics {
  totalStudents: number;
  totalCourses: number;
  totalModules: number;
  averageCompletionRate: number;
  recentEnrollments: EnrollmentDTO[];
  enrollment: EnrollmentStatistics;
  progress: ProgressStatistics;
  engagement: EngagementStatistics;
}

export const instructorAnalyticsApi = {
  /**
   * Get all analytics data for the instructor dashboard
   */
  getDashboardStatistics: async (instructorId: string, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<InstructorDashboardStatistics> => {
    try {
      // Get all instructor courses
      const courses = await courseApi.getCoursesByInstructorId(instructorId);
      
      // Get enrollments for all instructor courses
      const courseEnrollments = await Promise.all(
        courses.map(course => enrollmentApi.getCourseEnrollments(course.id))
      );
      
      // Flatten enrollments
      const allEnrollments = courseEnrollments.flat();
      
      // Get unique student count
      const uniqueStudentIds = new Set(allEnrollments.map(e => e.userId));
      
      // Calculate total modules
      const totalModules = courses.reduce((total, course) => {
        return total + (course.modules?.length || 0);
      }, 0);
      
      // Calculate average completion rate
      const averageCompletionRate = allEnrollments.length > 0
        ? allEnrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / allEnrollments.length
        : 0;
      
      // Create enrollment statistics
      const enrollmentStats: EnrollmentStatistics = {
        totalEnrollments: allEnrollments.length,
        courseEnrollments: courses.map(course => {
          const courseEnrolls = allEnrollments.filter(e => e.courseId === course.id);
          const completionRate = courseEnrolls.length > 0
            ? courseEnrolls.reduce((sum, e) => sum + e.completionPercentage, 0) / courseEnrolls.length
            : 0;
          
          return {
            courseId: course.id,
            courseTitle: course.title,
            enrollmentCount: courseEnrolls.length,
            completionRate: completionRate
          };
        }),
        enrollmentTrends: generateEnrollmentTrends(allEnrollments, timeframe)
      };
      
      // Create progress statistics
      const progressStats: ProgressStatistics = {
        averageCompletionRate,
        courseCompletionRates: courses.map(course => {
          const courseEnrolls = allEnrollments.filter(e => e.courseId === course.id);
          const completionRate = courseEnrolls.length > 0
            ? courseEnrolls.reduce((sum, e) => sum + e.completionPercentage, 0) / courseEnrolls.length
            : 0;
          
          // Count students who completed the course (100%)
          const completedStudents = courseEnrolls.filter(e => e.completionPercentage === 100).length;
          
          return {
            courseId: course.id,
            courseTitle: course.title,
            completionRate: completionRate,
            totalStudents: courseEnrolls.length,
            studentsCompleted: completedStudents
          };
        }),
        // For now, we'll return an empty array for module completion rates
        // In a real implementation, you'd fetch specific module progress data
        moduleCompletionRates: []
      };
      
      // Mock engagement statistics for now
      // In a real implementation, you'd fetch actual engagement data
      const engagementStats: EngagementStatistics = {
        mostEngagedCourses: courses.slice(0, 3).map(course => ({
          courseId: course.id,
          courseTitle: course.title,
          engagementScore: Math.random() * 100
        })),
        leastEngagedCourses: courses.slice(-3).map(course => ({
          courseId: course.id,
          courseTitle: course.title,
          engagementScore: Math.random() * 50
        })),
        averageTimeSpent: courses.map(course => ({
          courseId: course.id,
          courseTitle: course.title,
          averageMinutes: Math.floor(Math.random() * 120) + 30 // Random time between 30-150 minutes
        }))
      };
      
      // Get the 5 most recent enrollments
      const recentEnrollments = [...allEnrollments]
        .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
        .slice(0, 5);
      
      return {
        totalStudents: uniqueStudentIds.size,
        totalCourses: courses.length,
        totalModules: totalModules,
        averageCompletionRate,
        recentEnrollments,
        enrollment: enrollmentStats,
        progress: progressStats,
        engagement: engagementStats
      };
    } catch (error: any) {
      console.error('Failed to fetch instructor dashboard statistics:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard statistics';
      throw new Error(message);
    }
  },

  /**
   * Get course-specific analytics
   */
  getCourseAnalytics: async (courseId: number): Promise<any> => {
    try {
      // Get enrollments for this course
      const enrollments = await enrollmentApi.getCourseEnrollments(courseId);
      
      // Get course details with modules
      const courseDetails = await courseApi.getCourseById(courseId, true);
      
      // Calculate average completion rate
      const avgCompletionRate = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / enrollments.length
        : 0;
        
      // Get module completion rates if modules exist
      const moduleStats = courseDetails.modules 
        ? await Promise.all(courseDetails.modules.map(async module => {
            // In a real implementation, you would fetch module-specific completion data
            // For now, we'll generate random completion rates
            return {
              moduleId: module.id,
              moduleTitle: module.title,
              completionRate: Math.random() * 100,
              avgTimeSpent: Math.floor(Math.random() * 60) + 10 // Random time between 10-70 minutes
            };
          }))
        : [];
        
      return {
        courseId: courseId,
        courseTitle: courseDetails.title,
        totalEnrollments: enrollments.length,
        averageCompletionRate: avgCompletionRate,
        moduleStats,
        enrollments: enrollments.slice(0, 10) // Return just the first 10 enrollments
      };
    } catch (error: any) {
      console.error(`Failed to fetch analytics for course ${courseId}:`, error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch course analytics';
      throw new Error(message);
    }
  }
};

// Helper function to generate enrollment trends based on the specified timeframe
function generateEnrollmentTrends(
  enrollments: EnrollmentDTO[],
  timeframe: 'week' | 'month' | 'quarter' | 'year'
): { period: string; count: number }[] {
  const now = new Date();
  const periods: { period: string; count: number }[] = [];
  
  let numPeriods = 0;
  let periodFormat: (date: Date) => string;
  let incrementPeriod: (date: Date, increment: number) => Date;
  
  switch (timeframe) {
    case 'week':
      numPeriods = 7; // Last 7 days
      periodFormat = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
      incrementPeriod = (date, inc) => new Date(date.setDate(date.getDate() - inc));
      break;
    case 'month':
      numPeriods = 4; // Last 4 weeks
      periodFormat = (date) => {
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 6);
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${date.toLocaleDateString('en-US', { day: 'numeric' })}`;
      };
      incrementPeriod = (date, inc) => new Date(date.setDate(date.getDate() - (7 * inc)));
      break;
    case 'quarter':
      numPeriods = 3; // Last 3 months
      periodFormat = (date) => date.toLocaleDateString('en-US', { month: 'short' });
      incrementPeriod = (date, inc) => new Date(date.setMonth(date.getMonth() - inc));
      break;
    case 'year':
      numPeriods = 12; // Last 12 months
      periodFormat = (date) => date.toLocaleDateString('en-US', { month: 'short' });
      incrementPeriod = (date, inc) => new Date(date.setMonth(date.getMonth() - inc));
      break;
    default:
      numPeriods = 4; // Default to last 4 weeks
      periodFormat = (date) => {
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 6);
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${date.toLocaleDateString('en-US', { day: 'numeric' })}`;
      };
      incrementPeriod = (date, inc) => new Date(date.setDate(date.getDate() - (7 * inc)));
  }
  
  // Generate periods
  for (let i = 0; i < numPeriods; i++) {
    const periodEnd = i === 0 ? now : incrementPeriod(new Date(periods[i - 1].period.split(' - ')[0]), 1);
    const periodLabel = periodFormat(periodEnd);
    
    // Count enrollments for this period
    let count = 0;
    if (timeframe === 'week') {
      const periodDate = periodEnd.toDateString();
      count = enrollments.filter(e => new Date(e.enrolledAt).toDateString() === periodDate).length;
    } else if (timeframe === 'month') {
      const periodStart = new Date(periodEnd);
      periodStart.setDate(periodStart.getDate() - 6);
      count = enrollments.filter(e => {
        const enrollDate = new Date(e.enrolledAt);
        return enrollDate >= periodStart && enrollDate <= periodEnd;
      }).length;
    } else if (timeframe === 'quarter') {
      const periodMonth = periodEnd.getMonth();
      const periodYear = periodEnd.getFullYear();
      count = enrollments.filter(e => {
        const enrollDate = new Date(e.enrolledAt);
        return enrollDate.getMonth() === periodMonth && enrollDate.getFullYear() === periodYear;
      }).length;
    } else if (timeframe === 'year') {
      const periodMonth = periodEnd.getMonth();
      const periodYear = periodEnd.getFullYear();
      count = enrollments.filter(e => {
        const enrollDate = new Date(e.enrolledAt);
        return enrollDate.getMonth() === periodMonth && enrollDate.getFullYear() === periodYear;
      }).length;
    }
    
    periods.push({
      period: periodLabel,
      count: count
    });
  }
  
  // Reverse to get chronological order
  return periods.reverse();
}