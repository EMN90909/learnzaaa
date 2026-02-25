"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Star, Award, Upload, LogOut, Menu, CheckCircle, Lightbulb, Copy, Check, Trophy } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import HomeworkUpload from '@/components/HomeworkUpload';
import { File as FilePdf, Image as ImageIcon, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ResultsSummary from '@/components/ResultsSummary';
import Leaderboard from '@/components/Leaderboard';
import MonthlyWinnerCard from '@/components/MonthlyWinnerCard';

interface Learner {
  id: string;
  name: string;
  username: string;
  dob: string;
  grade: string;
  org_id: string;
}

interface Lesson {
  id: string;
  title: string;
  subject: string;
  age_range: string;
  md_content: string;
  image_url?: string;
  is_premium?: boolean;
}

interface Quiz {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_index: number;
  points_reward: number;
  reveal_cost: number;
}

interface ProgressData {
  id: string;
  learner_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  updated_at: string;
}

interface PointsBalance {
  id: string;
  learner_id: string;
  points: number;
}

interface XPBalance {
  id: string;
  learner_id: string;
  xp: number;
}

interface Homework {
  id: string;
  learner_id: string;
  lesson_id: string;
  file_url: string;
  status: string;
  review_notes: string;
  uploaded_at: string;
}

const LearnerPage: React.FC = () => {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [xpBalance, setXpBalance] = useState<XPBalance | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const [ageGroup, setAgeGroup] = useState<'young' | 'middle' | 'older'>('middle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<{quizId: string, chosenIndex: number, correct: boolean}[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [resultsSummaryData, setResultsSummaryData] = useState<{
    lessonId?: string;
    quizId?: string;
    score: number;
    totalPoints: number;
    taskType: 'lesson' | 'quiz' | 'homework';
  } | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const calculateAgeGroup = (dob: string): 'young' | 'middle' | 'older' => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age >= 7 && age <= 9) return 'young';
    if (age >= 10 && age <= 12) return 'middle';
    return 'older';
  };

  const getAgeGroupStyles = () => {
    switch (ageGroup) {
      case 'young':
        return { buttonText: 'Do it!', hintText: 'Help me!', revealText: 'Show answer', colors: { primary: 'bg-blue-500', secondary: 'bg-green-500' }, emoji: '🎈', encouragement: 'Awesome work!' };
      case 'middle':
        return { buttonText: 'Try quiz', hintText: 'Hint', revealText: 'Reveal', colors: { primary: 'bg-blue-600', secondary: 'bg-green-600' }, emoji: '🚀', encouragement: 'You got this!' };
      case 'older':
        return { buttonText: 'Attempt quiz', hintText: 'AI explain', revealText: 'Reveal (cost)', colors: { primary: 'bg-blue-700', secondary: 'bg-green-700' }, emoji: '💡', encouragement: 'Keep going!' };
    }
  };

  const ageStyles = getAgeGroupStyles();

  const fetchData = async () => {
    setLoading(true);
    try {
      const learnerData = localStorage.getItem('learnerData');
      if (!learnerData) {
        navigate('/learner-auth');
        return;
      }

      const parsedLearner = JSON.parse(learnerData);
      setLearner(parsedLearner);
      setAgeGroup(calculateAgeGroup(parsedLearner.dob));

      const { data: lessonsData, error: lessonsError } = await supabase.from('lessons').select('*');
      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
      if (lessonsData?.length > 0) setCurrentLesson(lessonsData[0]);

      const { data: quizzesData, error: quizzesError } = await supabase.from('quizzes').select('*');
      if (quizzesError) throw quizzesError;
      setQuizzes(quizzesData || []);

      const { data: progressData, error: progressError } = await supabase.from('progress').select('*').eq('learner_id', parsedLearner.id);
      if (progressError) throw progressError;
      setProgressData(progressData || []);

      const { data: pointsData } = await supabase.from('points_balance').select('*').eq('learner_id', parsedLearner.id).single();
      setPointsBalance(pointsData || { id: '', learner_id: parsedLearner.id, points: 0 });

      const { data: xpData } = await supabase.from('xp_balance').select('*').eq('learner_id', parsedLearner.id).single();
      setXpBalance(xpData || { id: '', learner_id: parsedLearner.id, xp: 0 });

      const { data: homeworkData } = await supabase.from('homework').select('*').eq('learner_id', parsedLearner.id).order('uploaded_at', { ascending: false });
      setHomework(homeworkData || []);

    } catch (error: any) {
      showError('Failed to load dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('learnerData');
    navigate('/learner-auth');
  };

  const handleMarkAsDone = async () => {
    if (!currentLesson || !learner) return;
    const existingProgress = progressData.find(p => p.lesson_id === currentLesson.id);
    if (existingProgress?.completed) return;

    setResultsSummaryData({ lessonId: currentLesson.id, score: 100, totalPoints: 100, taskType: 'lesson' });
    setShowResultsSummary(true);

    await supabase.from('progress').upsert({
      learner_id: learner.id,
      lesson_id: currentLesson.id,
      completed: true,
      score: 100,
      updated_at: new Date().toISOString()
    });
    fetchData();
  };

  const handleQuizAnswer = async (quizId: string, chosenIndex: number) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz || !learner) return;
    const isCorrect = chosenIndex === quiz.correct_index;
    setQuizAttempts(prev => [...prev, { quizId, chosenIndex, correct: isCorrect }]);
    if (isCorrect) {
      showSuccess(`🎉 Correct! +${quiz.points_reward} 💎`);
      fetchData();
    } else {
      showError('❌ Not quite! Try again!');
    }
  };

  const getLevelFromXP = (xp: number) => {
    if (xp >= 3000) return { level: 4, name: 'Master', progress: 100, emoji: '🏆' };
    if (xp >= 1500) return { level: 3, name: 'Explorer', progress: Math.min(100, ((xp - 1500) / 1500) * 100), emoji: '🌟' };
    if (xp >= 500) return { level: 2, name: 'Learner', progress: Math.min(100, ((xp - 500) / 1000) * 100), emoji: '📚' };
    return { level: 1, name: 'Beginner', progress: Math.min(100, (xp / 500) * 100), emoji: '🐣' };
  };

  const levelInfo = xpBalance ? getLevelFromXP(xpBalance.xp) : { level: 1, name: 'Beginner', progress: 0, emoji: '🐣' };
  const completedLessons = progressData.filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const lessonQuizzes = currentLesson ? quizzes.filter(q => q.lesson_id === currentLesson.id) : [];

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!learner) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {showResultsSummary && resultsSummaryData && (
        <ResultsSummary {...resultsSummaryData} onContinue={() => setShowResultsSummary(false)} onClose={() => setShowResultsSummary(false)} />
      )}

      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Learnzaa</h1>
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10 cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <AvatarFallback className="bg-blue-600 text-white">{learner.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <Button onClick={handleLogout} className="w-full justify-start text-red-500" variant="ghost">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-blue-100">
                <AvatarFallback className="bg-blue-600 text-white text-xl">{learner.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                {levelInfo.emoji} Lvl {levelInfo.level}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{learner.name}</h2>
              <p className="text-gray-600">{learner.grade}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Card className="p-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold">{pointsBalance?.points || 0}</span>
                <span className="text-sm text-gray-500">💎</span>
              </div>
            </Card>
            <Card className="p-3 bg-purple-50 border-purple-200">
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-purple-500" />
                <div className="text-center">
                  <div className="text-lg font-bold">Level {levelInfo.level}</div>
                  <Progress value={levelInfo.progress} className="mt-2 h-2" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <MonthlyWinnerCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="lessons"><BookOpen className="h-4 w-4 mr-2" /> Lessons</TabsTrigger>
                <TabsTrigger value="progress"><Star className="h-4 w-4 mr-2" /> Progress</TabsTrigger>
                <TabsTrigger value="leaderboard"><Trophy className="h-4 w-4 mr-2" /> Leaderboard</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons">
                {currentLesson && (
                  <Card className="border-2 border-blue-100">
                    <CardHeader className="bg-blue-50">
                      <CardTitle>{currentLesson.title}</CardTitle>
                      <CardDescription>{currentLesson.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <MarkdownRenderer content={currentLesson.md_content} ageGroup={ageGroup} learnerId={learner.id} lessonId={currentLesson.id} />
                      <div className="mt-8">
                        <HomeworkUpload learnerId={learner.id} lessonId={currentLesson.id} onUploadSuccess={fetchData} />
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button onClick={handleMarkAsDone} className={cn("px-6 py-3", ageStyles.colors.primary)} disabled={progressData.some(p => p.lesson_id === currentLesson.id && p.completed)}>
                          {progressData.some(p => p.lesson_id === currentLesson.id && p.completed) ? '✅ Completed' : '🎯 Mark as Done'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {lessonQuizzes.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {lessonQuizzes.map((quiz) => (
                      <Card key={quiz.id} className="hover:shadow-md cursor-pointer" onClick={() => { setSelectedQuiz(quiz); setIsModalOpen(true); }}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{quiz.question}</h3>
                            <p className="text-sm text-gray-500">Reward: {quiz.points_reward} 💎</p>
                          </div>
                          <Button size="sm" className={ageStyles.colors.secondary}>{ageStyles.buttonText}</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress">
                <Card className="border-2 border-yellow-100">
                  <CardHeader className="bg-yellow-50"><CardTitle>My Progress</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold">{completedLessons}</div>
                        <div className="text-xs text-gray-500">Lessons</div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold">{pointsBalance?.points || 0}</div>
                        <div className="text-xs text-gray-500">💎 Points</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Leaderboard />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-blue-100">
              <CardHeader className="bg-blue-50"><CardTitle>Next Lessons</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="p-3 border rounded cursor-pointer hover:bg-gray-50" onClick={() => setCurrentLesson(lesson)}>
                        <h3 className="font-medium">{lesson.title}</h3>
                        <p className="text-xs text-gray-500">{lesson.subject}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Quiz</DialogTitle></DialogHeader>
          {selectedQuiz && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{selectedQuiz.question}</h3>
              <div className="space-y-3">
                {selectedQuiz.options.map((option, index) => (
                  <Button key={index} className="w-full justify-start" variant="outline" onClick={() => handleQuizAnswer(selectedQuiz.id, index)}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Button>
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