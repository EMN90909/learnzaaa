"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Award, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardWithImageProps {
  lesson: {
    id: string;
    title: string;
    subject: string;
    age_range: string;
    image_url?: string;
    is_premium?: boolean;
    parts?: number;
    created_at: string;
  };
  onClick: () => void;
  ageGroup: 'young' | 'middle' | 'older';
}

const LessonCardWithImage: React.FC<LessonCardWithImageProps> = ({ lesson, onClick, ageGroup }) => {
  // Get age group specific styles
  const getAgeGroupStyles = () => {
    switch (ageGroup) {
      case 'young':
        return {
          cardClass: 'lesson-card-young',
          categoryColor: '#ff6b6b',
          hoverRotation: '8deg',
          fontSize: 'text-lg',
          padding: 'p-6'
        };
      case 'middle':
        return {
          cardClass: 'lesson-card-middle',
          categoryColor: '#40c9ff',
          hoverRotation: '6deg',
          fontSize: 'text-base',
          padding: 'p-5'
        };
      case 'older':
        return {
          cardClass: 'lesson-card-older',
          categoryColor: '#8b5cf6',
          hoverRotation: '4deg',
          fontSize: 'text-sm',
          padding: 'p-4'
        };
    }
  };

  const styles = getAgeGroupStyles();

  return (
    <div
      className={cn(
        `${styles.cardClass} lesson-card-animation`,
        "w-full max-w-sm h-[350px] color-white bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-transparent rounded-lg flex flex-col cursor-pointer transition-all duration-600 ease-in-out transform hover:rotate-[8deg]",
        "hover:shadow-2xl hover:shadow-purple-500/20"
      )}
      onClick={onClick}
    >
      <div className="lesson-card-main-content flex-1">
        {/* Header with date and subject */}
        <div className="lesson-card-header flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Article on</span>
            <span className="text-gray-300 text-sm">
              {new Date(lesson.created_at).toLocaleDateString()}
            </span>
          </div>
          {lesson.is_premium && (
            <Badge className="bg-yellow-500 text-yellow-900 text-xs">
              Premium
            </Badge>
          )}
        </div>

        {/* Lesson title */}
        <h3 className={cn(
          "lesson-card-heading text-xl font-semibold mb-4 text-white",
          styles.fontSize
        )}>
          {lesson.title}
        </h3>

        {/* Categories/tags */}
        <div className="lesson-card-categories flex flex-wrap gap-2 mb-4">
          <Badge
            className="bg-purple-600 text-white text-xs font-semibold"
            style={{ backgroundColor: styles.categoryColor }}
          >
            {lesson.subject}
          </Badge>
          <Badge className="bg-blue-600 text-white text-xs font-semibold">
            {lesson.age_range || 'All Ages'}
          </Badge>
          {lesson.parts && lesson.parts > 1 && (
            <Badge className="bg-green-600 text-white text-xs font-semibold">
              {lesson.parts} Parts
            </Badge>
          )}
        </div>

        {/* Image preview if available */}
        {lesson.image_url && (
          <div className="lesson-image-wrapper mt-4 rounded-lg overflow-hidden border border-gray-600">
            <img
              src={lesson.image_url}
              alt={lesson.title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>

      {/* Footer with author/creator info */}
      <div className="lesson-card-footer flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">Lesson</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-400" />
          <span className="text-gray-300 text-sm">Click to view</span>
        </div>
      </div>
    </div>
  );
};

export default LessonCardWithImage;