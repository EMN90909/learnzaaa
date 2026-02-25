"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Star, Award, LogOut, Trophy } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import HomeworkUpload from '@/components/HomeworkUpload';
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

const LearnerPage: React.FC = () => {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const [ageGroup, setAgeGroup] = useState<'young' | 'middle' | 'older'>('middle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [resultsSummaryData, setResultsSummaryData] = useState<any>(null);
  const navigate = useNavigate();

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

      // Fetch lessons
      const { data: lessonsData } = await supabase.from('lessons').select('*');
      setLessons(lessonsData || []);
      if (lessonsData?.length > 0) setCurrentLesson(lessonsData[0]);

      // Fetch quizzes
      const { data: quizzesData } = await supabase.from('quizzes').select('*');
      setQuizzes(quizzesData || []);

      // Fetch progress
      const { data: progData } = await supabase.from('progress').select('*').eq('learner_id', parsedLearner.id);
      setProgressData(progData || []);

      // Fetch points and XP with maybeSingle to avoid 406 errors if no row exists
      const { data: pointsData, error: pointsError } = await supabase
        .from('points_balance')
        .select('points')
        .eq('learner_id', parsedLearner.id)
        .maybeSingle();
      
      if (!pointsError && pointsData) setPoints(pointsData.points);

      const { data: xpData, error: xpError } = await supabase
        .from('xp_balance')
        .select('xp')
        .eq('learner_id', parsedLearner.id)
        .maybeSingle();
      
      if (!xpError && xpData) setXp(xpData.xp);

    } catch (error: any) {
      console.error('Error loading learner data:', error);
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
    
    setResultsSummaryData({ 
      lessonId: currentLesson.id, 
      score: 100, 
      totalPoints: 100, 
      taskType: 'lesson' 
    });
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
    if (isCorrect) {
      showSuccess(`🎉 Correct! +${quiz.points_reward} 💎`);
      fetchData();
      setIsModalOpen(false);
    } else {
      showError('❌ Not quite! Try again!');
    }
  };

  const getLevelInfo = (xp: number) => {
    if (xp >= 3000) return { level: 4, name: 'Master', progress: 100, emoji: '🏆' };
    if (xp >= 1500) return { level: 3, name: 'Explorer', progress: Math.min(100, ((xp - 1500) / 1500) * 100), emoji: '🌟' };
    if (xp >= 500) return { level: 2, name: 'Learner', progress: Math.min(100, ((xp - 500) / 1000) * 100), emoji: '📚' };
    return { level: 1, name: 'Beginner', progress: Math.min(100, (xp / 500) * 100), emoji: '🐣' };
  };

  const levelInfo = getLevelInfo(xp);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (!learner) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-slate-900">
      {showResultsSummary && resultsSummaryData && (
        <ResultsSummary {...resultsSummaryData} onContinue={() => setShowResultsSummary(false)} onClose={() => setShowResultsSummary(false)} />
      )}

      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/learner-dashboard')} className="font-bold text-blue-600">
            ← Back to Dashboard
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">{learner.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button onClick={handleLogout} variant="ghost" size="icon" className="text-red-500">
              <LogOut className="h-5 w-5" />
            </Button>
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
              <h2 className="text-2xl font-bold dark:text-white">{learner.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{learner.grade}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Card className="p-3 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold dark:text-yellow-400">{points}</span>
                <span className="text-sm text-gray-500">💎</span>
              </div>
            </Card>
            <Card className="p-3 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-purple-500" />
                <div className="text-center">
                  <div className="text-lg font-bold dark:text-purple-400">Level {levelInfo.level}</div>
                  <Progress value={levelInfo.progress} className="mt-2 h-2 w-24" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
                <TabsTrigger value="lessons"><BookOpen className="h-4 w-4 mr-2" /> Lessons</TabsTrigger>
                <TabsTrigger value="progress"><Star className="h-4 w-4 mr-2" /> Progress</TabsTrigger>
                <TabsTrigger value="leaderboard"><Trophy className="h-4 w-4 mr-2" /> Leaderboard</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons">
                {currentLesson && (
                  <Card className="border-2 border-blue-100 dark:border-blue-900">
                    <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                      <CardTitle className="dark:text-white">{currentLesson.title}</CardTitle>
                      <CardDescription className="dark:text-blue-300">{currentLesson.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <MarkdownRenderer content={currentLesson.md_content} ageGroup={ageGroup} learnerId={learner.id} lessonId={currentLesson.id} />
                      <div className="mt-8">
                        <HomeworkUpload learnerId={learner.id} lessonId={currentLesson.id} onUploadSuccess={fetchData} />
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button 
                          onClick={handleMarkAsDone} 
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700" 
                          disabled={progressData.some(p => p.lesson_id === currentLesson.id && p.completed)}
                        >
                          {progressData.some(p => p.lesson_id === currentLesson.id && p.completed) ? '✅ Completed' : '🎯 Mark as Done'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Lesson Quizzes</h3>
                  {currentLesson && quizzes.filter(q => q.lesson_id === currentLesson.id).length > 0 ? (
                    quizzes.filter(q => q.lesson_id === currentLesson.id).map((quiz) => (
                      <Card key={quiz.id} className="hover:shadow-md cursor-pointer dark:bg-gray-800 dark:border-gray-700" onClick={() => { setSelectedQuiz(quiz); setIsModalOpen(true); }}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold dark:text-white">{quiz.question}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Reward: {quiz.points_reward} 💎</p>
                          </div>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">Try Quiz</Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">No quizzes for this lesson yet.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="progress">
                <div className="space-y-6">
                  <MonthlyWinnerCard />
                  <Card className="border-2 border-yellow-100 dark:border-yellow-900">
                    <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20"><CardTitle className="dark:text-white">My Progress</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 border rounded dark:border-gray-700">
                          <div className="text-2xl font-bold dark:text-white">{progressData.filter(p => p.completed).length}</div>
                          <div className="text-xs text-gray-500">Lessons Done</div>
                        </div>
                        <div className="text-center p-4 border rounded dark:border-gray-700">
                          <div className="text-2xl font-bold dark:text-white">{points}</div>
                          <div className="text-xs text-gray-500">💎 Points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Leaderboard />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20"><CardTitle className="dark:text-white">All Lessons</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className={cn(
                          "p-3 border rounded cursor-pointer transition-colors",
                          currentLesson?.id === lesson.id ? "bg-blue-100 border-blue-300 dark:bg-blue-900/40" : "hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        )} 
                        onClick={() => setCurrentLesson(lesson)}
                      >
                        <h3 className="font-medium dark:text-white">{lesson.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.subject}</p>
                        {progressData.find(p => p.lesson_id === lesson.id)?.completed && (
                          <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">Completed</Badge>
                        )}
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
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">Quiz Time!</DialogTitle></DialogHeader>
          {selectedQuiz && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold dark:text-white">{selectedQuiz.question}</h3>
              <div className="grid grid-cols-1 gap-3">
                {selectedQuiz.options.map((option, index) => (
                  <Button 
                    key={index} 
                    className="w-full justify-start text-left h-auto py-4 px-6 dark:text-white dark:border-gray-700" 
                    variant="outline" 
                    onClick={() => handleQuizAnswer(selectedQuiz.id, index)}
                  >
                    <span className="font-bold mr-4">{String.fromCharCode(65 + index)}.</span> {option}
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