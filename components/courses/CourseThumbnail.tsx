import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CourseDTO } from '@/types';
import Image from 'next/image';

interface CourseThumbnailProps {
  course: CourseDTO;
  size?: 'small' | 'medium' | 'large';
}

export const CourseThumbnail: React.FC<CourseThumbnailProps> = ({ 
  course, 
  size = 'medium' 
}) => {
  const defaultThumbnail = '/placeholder.svg';
  const thumbnailUrl = course.thumbnailUrl || defaultThumbnail;
  
  const dimensions = {
    small: { width: 120, height: 68 },
    medium: { width: 240, height: 135 },
    large: { width: 480, height: 270 }
  };
  
  const { width, height } = dimensions[size];
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        <div 
          style={{ width, height }}
          className="relative overflow-hidden"
        >
          {thumbnailUrl !== defaultThumbnail ? (
            <img
              src={thumbnailUrl}
              alt={`Thumbnail for ${course.title}`}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No thumbnail</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};