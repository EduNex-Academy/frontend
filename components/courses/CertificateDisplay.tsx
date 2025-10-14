"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Award, Calendar, User, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CertificateData } from "@/lib/utils/certificate-generator";

interface CertificateDisplayProps {
  certificateData: CertificateData;
  showPreview?: boolean;
  className?: string;
}

export function CertificateDisplay({ 
  certificateData, 
  showPreview = false, 
  className = "" 
}: CertificateDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownloadCertificate = async () => {
    try {
      setIsDownloading(true);
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
      setIsDownloading(false);
    }
  };

  const handlePreviewCertificate = async () => {
    try {
      setIsGeneratingPreview(true);
      const { CertificateGenerator } = await import("@/lib/utils/certificate-generator");
      const blob = await CertificateGenerator.generateCertificatePDF(certificateData);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate certificate preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Course Certificate</h3>
                <p className="text-sm text-gray-600">Congratulations on your achievement!</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Completed
            </Badge>
          </div>

          {/* Certificate Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Course Name</p>
                  <p className="text-sm text-gray-600">{certificateData.courseName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Instructor</p>
                  <p className="text-sm text-gray-600">{certificateData.instructorName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Completion Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(certificateData.completionDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Modules Completed</p>
                  <p className="text-sm text-gray-600">{certificateData.totalModules} modules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleDownloadCertificate} 
              disabled={isDownloading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isDownloading ? 'Generating...' : 'Download Certificate'}
            </Button>
            
            {showPreview && (
              <Button 
                onClick={handlePreviewCertificate} 
                disabled={isGeneratingPreview}
                variant="outline"
                className="flex-1"
              >
                {isGeneratingPreview ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {isGeneratingPreview ? 'Generating...' : 'Preview Certificate'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Certificate Preview</h3>
              <Button 
                onClick={handleClosePreview} 
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border rounded-lg"
                title="Certificate Preview"
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button onClick={handleClosePreview} variant="outline">
                Close
              </Button>
              <Button onClick={handleDownloadCertificate} disabled={isDownloading}>
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
  );
}

export default CertificateDisplay;