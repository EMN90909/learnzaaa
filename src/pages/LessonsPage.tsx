import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import LessonCard from '@/components/LessonCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParams } from 'react-router-dom'; // Import useParams

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  level: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const LessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { lessonId: routeLessonId } = useParams<{ lessonId: string }>(); // Get lessonId from URL

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*');

      if (error) {
        showError('Failed to fetch lessons: ' + error.message);
        console.error('Error fetching lessons:', error);
      } else {
        setLessons(data || []);
        showSuccess('Lessons loaded successfully!');
      }
      setLoading(false);
    };

    fetchLessons();
  }, []);

  useEffect(() => {
    if (routeLessonId && lessons.length > 0) {
      const lesson = lessons.find(l => l.id === routeLessonId);
      if (lesson) {
        setSelectedLesson(lesson);
        setIsModalOpen(true);
      }
    }
  }, [routeLessonId, lessons]);

  const handleViewDetails = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setIsModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Available Lessons</h1>
      {lessons.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No lessons available yet. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedLesson?.title}</DialogTitle>
            <DialogDescription>{selectedLesson?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-4">
            <div className="prose dark:prose-invert max-w-none">
              {/* Render lesson content. Assuming it's markdown or plain text for now. */}
              <p>{selectedLesson?.content}</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonsPage;