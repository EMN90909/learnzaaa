"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Star, Award, LogOut, ChevronLeft, ChevronRight, Home, Trophy } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import HomeworkUpload from '@/components/HomeworkUpload';
import ResultsSummary from '@/components/ResultsSummary';
import Leaderboard from '@/components/Leaderboard';
import MonthlyWinnerCard from '@/components/MonthlyWinnerCard';
import AdUnit from '@/components/AdUnit';

const LearnerPage: React.FC = () => {
  const [learner, setLearner] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [pointsBalance, setPointsBalance] = useState<any>(null);
  const [xpBalance, setXpBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [resultsSummaryData, setResultsSummaryData] = useState<any>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const learnerData = localStorage.getItem('learnerData');
      if (!learnerData) { navigate('/learner-auth'); return; }
      const parsedLearner = JSON.parse(learnerData);
      setLearner(parsedLearner);

      const { data: lessonsData } = await supabase.from('lessons').select('*');
      setLessons(lessonsData || []);

      const { data: quizzesData } = await supabase.from('quizzes').select('*');
      setQuizzes(quizzesData || []);

      const { data: progress } = await supabase.from('progress').select('*').eq('learner_id', parsedLearner.id);
      setProgressData(progress || []);

      const { data: points } = await supabase.from('points_balance').select('*').eq('learner_id', parsedLearner.id).single();
      setPointsBalance(points || { points: 0 });

      const { data: xp } = await supabase.from('xp_balance').select('*').eq('learner_id', parsedLearner.id).single();
      setXpBalance(xp || { xp: 0 });
    } catch (e) { showError('Error loading data'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLessonIndex, lessons.length]);

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) setCurrentLessonIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) setCurrentLessonIndex(prev => prev - 1);
  };

  const handleMarkAsDone = async () => {
    const currentLesson = lessons[currentLessonIndex];
    if (!currentLesson || !learner) return;
    setResultsSummaryData({ lessonId: currentLesson.id, score: 100, totalPoints: 100, taskType: 'lesson' });
    setShowResultsSummary(true);
    await supabase.from('progress').upsert({ learner_id: learner.id, lesson_id: currentLesson.id, completed: true, score: 100, updated_at: new Date().toISOString() });
    fetchData();
  };

  const currentLesson = lessons[currentLessonIndex];
  const lessonQuizzes = currentLesson ? quizzes.filter(q => q.lesson_id === currentLesson.id) : [];

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-black"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      {showResultsSummary && resultsSummaryData && (
        <ResultsSummary {...resultsSummaryData} onContinue={() => setShowResultsSummary(false)} onClose={() => setShowResultsSummary(false)} />
      )}

      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Learnzaaac</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/learner-dashboard')} className="dark:text-white">
              <Home className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { localStorage.removeItem('learnerData'); navigate('/learner-auth'); }} className="text-red-500">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <MonthlyWinnerCard />
            <Leaderboard />
            <AdUnit type="rectangle" />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-800 shadow-sm">
              <Button variant="outline" onClick={handlePrev} disabled={currentLessonIndex === 0} className="dark:border-gray-700 dark:text-white">
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="font-bold text-sm">Lesson {currentLessonIndex + 1} of {lessons.length}</span>
              <Button variant="outline" onClick={handleNext} disabled={currentLessonIndex === lessons.length - 1} className="dark:border-gray-700 dark:text-white">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <AdUnit type="banner" />

            {currentLesson && (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
                  <Badge className="w-fit">{currentLesson.subject}</Badge>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer content={currentLesson.md_content} lessonId={currentLesson.id} learnerId={learner.id} />
                  
                  <AdUnit type="banner" className="my-8" />

                  <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Homework Task</h3>
                    <HomeworkUpload learnerId={learner.id} lessonId={currentLesson.id} onUploadSuccess={fetchData} />
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button onClick={handleMarkAsDone} size="lg" className="bg-green-600 hover:bg-green-700 text-white px-12" disabled={progressData.some(p => p.lesson_id === currentLesson.id && p.completed)}>
                      {progressData.some(p => p.lesson_id === currentLesson.id && p.completed) ? '✅ Lesson Completed' : '🎯 Finish Lesson'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <AdUnit type="banner" />

            {lessonQuizzes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonQuizzes.map((quiz: any) => (
                  <Card key={quiz.id} className="dark:bg-gray-900 dark:border-gray-800 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => { setSelectedQuiz(quiz); setIsModalOpen(true); }}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg"><Star className="h-5 w-5 text-yellow-600" /></div>
                        <span className="font-bold text-sm truncate max-w-[150px]">{quiz.question}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-600">Start</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="dark:bg-gray-900 dark:border-gray-800 dark:text-white">
          <DialogHeader><DialogTitle>Quiz Time!</DialogTitle></DialogHeader>
          {selectedQuiz && (
            <div className="space-y-4">
              <p className="font-bold text-lg">{selectedQuiz.question}</p>
              <div className="grid gap-2">
                {selectedQuiz.options.map((opt: string, i: number) => (
                  <Button key={i} variant="outline" className="justify-start dark:border-gray-700 dark:text-white" onClick={() => {
                    if (i === selectedQuiz.correct_index) {
                      showSuccess("Correct! +10 Points");
                      setIsModalOpen(false);
                      fetchData();
                    } else {
                      showError("Try again!");
                    }
                  }}>{opt}</Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearnerPage;