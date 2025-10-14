"use client"

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { moduleApi } from '@/lib/api/module';
import { moduleProgressApi } from '@/lib/api/module-progress';
import type { CourseDTO } from '@/types/course';
import type { CertificateData } from '@/lib/utils/certificate-generator';

export function useCertificate() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Check if a course is completed (100% progress)
   */
  const isCourseCompleted = useCallback(async (courseId: number): Promise<boolean> => {
    try {
      const progress = await moduleProgressApi.getCourseProgress(courseId);
      return progress >= 100;
    } catch (error) {
      console.error(`Error checking course completion for ${courseId}:`, error);
      return false;
    }
  }, []);

  /**
   * Generate certificate data for a completed course
   */
  const generateCertificateData = useCallback(async (course: CourseDTO): Promise<CertificateData | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      // Check if course is completed
      const isCompleted = await isCourseCompleted(course.id);
      if (!isCompleted) {
        throw new Error('Course is not completed yet');
      }

      // Get course modules to count total modules
      const modules = await moduleApi.getModulesByCourseId(course.id);
      
      // Get the completion date (latest module completion date)
      const progressDetails = await moduleProgressApi.getCourseProgressDetails(course.id);
      const completedModules = progressDetails.filter(progress => progress.completed);
      
      let completionDate = new Date().toISOString();
      if (completedModules.length > 0) {
        // Find the latest completion date
        const latestCompletion = completedModules.reduce((latest, item) => {
          const currentDate = new Date(item.completionDate || item.createdAt);
          const latestDate = new Date(latest.completionDate || latest.createdAt);
          return currentDate > latestDate ? item : latest;
        });
        completionDate = latestCompletion.completionDate || latestCompletion.createdAt || completionDate;
      }

      const certificateData: CertificateData = {
        studentName: user.firstName + ' ' + user.lastName || user.email || 'Student',
        courseName: course.title,
        instructorName: course.instructorName || 'Instructor',
        completionDate: completionDate,
        courseCategory: course.category,
        totalModules: modules.length
      };

      return certificateData;
    } catch (error) {
      console.error('Error generating certificate data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, isCourseCompleted]);

  /**
   * Calculate course completion percentage
   */
  const getCourseCompletionPercentage = useCallback(async (courseId: number): Promise<number> => {
    try {
      return await moduleProgressApi.getCourseProgress(courseId);
    } catch (error) {
      console.error(`Error getting course completion percentage for ${courseId}:`, error);
      return 0;
    }
  }, []);

  /**
   * Check if user can access certificate for a course
   */
  const canAccessCertificate = useCallback(async (courseId: number): Promise<boolean> => {
    try {
      return await isCourseCompleted(courseId);
    } catch (error) {
      console.error(`Error checking certificate access for course ${courseId}:`, error);
      return false;
    }
  }, [isCourseCompleted]);

  return {
    loading,
    isCourseCompleted,
    generateCertificateData,
    getCourseCompletionPercentage,
    canAccessCertificate
  };
}