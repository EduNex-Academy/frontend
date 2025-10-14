"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Download,
  Eye,
  User,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { courseApi } from "@/lib/api/course";
import { useCertificate } from "@/hooks/use-certificate";
import { StatsCards } from "@/components/common/StatsCards";
import { useToast } from "@/hooks/use-toast";
import type { CourseDTO } from "@/types/course";
import type { CertificateData } from "@/lib/utils/certificate-generator";

interface CompletedCourse extends CourseDTO {
  certificateData?: CertificateData;
}

interface PreviewCertificate extends CertificateData {
  previewUrl?: string;
}

export default function CertificatesPage() {
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewingCertificate, setPreviewingCertificate] = useState<PreviewCertificate | null>(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState<string | null>(null);
  
  const { isCourseCompleted, generateCertificateData } = useCertificate();
  const { toast } = useToast();

  // Handle certificate download
  const handleDownloadCertificate = async (certificateData: CertificateData, courseTitle: string) => {
    try {
      setDownloadingCertificate(courseTitle);
      const { CertificateGenerator } = await import("@/lib/utils/certificate-generator");
      await CertificateGenerator.downloadCertificate(certificateData);
      
      toast({
        title: "Success",
        description: "Certificate downloaded successfully!",
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingCertificate(null);
    }
  };

  // Handle certificate preview
  const handlePreviewCertificate = async (certificateData: CertificateData) => {
    try {
      const { CertificateGenerator } = await import("@/lib/utils/certificate-generator");
      const blob = await CertificateGenerator.generateCertificatePDF(certificateData);
      const url = URL.createObjectURL(blob);
      setPreviewingCertificate({ ...certificateData, previewUrl: url });
    } catch (error) {
      console.error('Error generating certificate preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate certificate preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all enrolled courses
        const enrolledCourses = await courseApi.getEnrolledCourses();
        
        // Filter completed courses and generate certificate data
        const completedCoursesWithCertificates: CompletedCourse[] = [];
        
        for (const course of enrolledCourses) {
          try {
            const isCompleted = await isCourseCompleted(course.id);
            
            if (isCompleted) {
              const certificateData = await generateCertificateData(course);
              completedCoursesWithCertificates.push({
                ...course,
                certificateData: certificateData || undefined
              });
            }
          } catch (courseError) {
            console.warn(`Error processing course ${course.id}:`, courseError);
            // Continue with other courses even if one fails
          }
        }
        
        setCompletedCourses(completedCoursesWithCertificates);
      } catch (err) {
        console.error('Error fetching completed courses:', err);
        setError('Failed to load certificates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, [isCourseCompleted, generateCertificateData]);

  // Calculate stats like other pages
  const stats = {
    totalCertificates: completedCourses.length,
    totalModules: completedCourses.reduce((total, course) => 
      total + (course.certificateData?.totalModules || 0), 0
    ),
    categoriesMastered: new Set(completedCourses.map(course => course.category)).size,
    averageScore: 100 // All completed courses have 100% score
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">View and download your course completion certificates</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading your certificates...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <StatsCards cards={[
              { 
                title: "Certificates", 
                subtitle: "Earned", 
                value: stats.totalCertificates, 
                icon: Trophy, 
                color: "yellow", 
                accent: "from-yellow-500 to-yellow-600" 
              },
              { 
                title: "Total Modules", 
                subtitle: "Completed", 
                value: stats.totalModules, 
                icon: BookOpen, 
                color: "green", 
                accent: "from-green-500 to-green-600" 
              },
              { 
                title: "Categories", 
                subtitle: "Mastered", 
                value: stats.categoriesMastered, 
                icon: Award, 
                color: "purple", 
                accent: "from-purple-500 to-purple-600" 
              },
              { 
                title: "Achievement", 
                subtitle: "Score", 
                value: stats.averageScore, 
                icon: CheckCircle2, 
                color: "blue", 
                accent: "from-blue-500 to-blue-600" 
              }
            ]} />

            {/* Empty State */}
            {completedCourses.length === 0 && (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Certificates Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Complete your first course to earn your first certificate! 
                  Certificates are automatically generated when you finish all modules in a course.
                </p>
                <Link href="/student/courses">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}

            {/* Certificates Grid */}
            {completedCourses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <Card key={course.id} className="bg-white/70 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-300 mb-2">
                          Certificate Earned
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {course.certificateData?.instructorName || course.instructorName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Completed: {course.certificateData && new Date(course.certificateData.completionDate).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-900">{course.certificateData?.totalModules || 0}</div>
                          <div className="text-xs text-gray-600">Modules</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-900">{course.category}</div>
                          <div className="text-xs text-gray-600">Category</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => course.certificateData && handleDownloadCertificate(course.certificateData, course.title)}
                          disabled={downloadingCertificate === course.title}
                          size="sm"
                        >
                          {downloadingCertificate === course.title ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          {downloadingCertificate === course.title ? 'Generating...' : 'Download'}
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => course.certificateData && handlePreviewCertificate(course.certificateData)}
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Link href={`/student/courses/${course.id}`} className="flex-1">
                            <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" size="sm">
                              <BookOpen className="w-4 h-4 mr-1" />
                              Course
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Certificate Preview Modal */}
        {previewingCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Certificate Preview - {previewingCertificate.courseName}
                </h3>
                <Button 
                  onClick={() => {
                    if (previewingCertificate.previewUrl) {
                      URL.revokeObjectURL(previewingCertificate.previewUrl);
                    }
                    setPreviewingCertificate(null);
                  }} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                {previewingCertificate.previewUrl ? (
                  <iframe
                    src={previewingCertificate.previewUrl}
                    className="w-full h-[70vh] border rounded-lg"
                    title="Certificate Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600">Generating certificate preview...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button 
                  onClick={() => {
                    if (previewingCertificate.previewUrl) {
                      URL.revokeObjectURL(previewingCertificate.previewUrl);
                    }
                    setPreviewingCertificate(null);
                  }} 
                  variant="outline"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => handleDownloadCertificate(previewingCertificate, previewingCertificate.courseName)}
                  disabled={downloadingCertificate === previewingCertificate.courseName}
                >
                  {downloadingCertificate === previewingCertificate.courseName ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}