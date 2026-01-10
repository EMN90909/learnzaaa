import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Hash } from 'lucide-react';

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    content: string; // Assuming content is a string for display, could be more complex
  };
  onViewDetails: (lessonId: string) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onViewDetails }) => {
  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{lesson.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Hash className="h-4 w-4" /> {lesson.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{lesson.description}</p>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <BookOpen className="h-4 w-4" /> Level: <span className="font-medium capitalize">{lesson.level}</span>
        </div>
      </CardContent>
      <div className="p-4 pt-0">
        <Button onClick={() => onViewDetails(lesson.id)} className="w-full">
          View Lesson
        </Button>
      </div>
    </Card>
  );
};

export default LessonCard;