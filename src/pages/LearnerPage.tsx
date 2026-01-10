"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Star, Award, Upload, LogOut, ChevronLeft, Home, Menu, CheckCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import HomeworkUpload from '@/components/HomeworkUpload';
import { File as FilePdf, Image as ImageIcon, FileText } from 'lucide-react';

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
  images?: string[];
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
  reviewed_at: string;
  parent_comment: string;
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
  const navigate = useNavigate();

  // Calculate age group based on DOB
  const calculateAgeGroup = (dob: string): 'young' | 'middle' | 'older' => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 7 && age <= 9) return 'young';
    if (age >= 10 && age <= 12) return 'middle';
    return 'older';
  };

  // Get age group specific styles
  const getAgeGroupStyles = () => {
    const baseStyles = {
      buttonSize: 'medium',
      fontSize: 'text-base',
      buttonText: 'Try Quiz',
      hintText: 'Hint',
      revealText: 'Reveal Answer',
      progressIcon: 'bar',
      colors: {
        primary: 'bg-blue-600',
        secondary: 'bg-green-600',
        accent: 'bg-purple-600'
      }
    };

    switch (ageGroup) {
      case 'young':
        return {
          ...baseStyles,
          buttonSize: 'large',
          fontSize: 'text-lg',
          buttonText: 'Do it!',
          hintText: 'Help me!',
          revealText: 'Show answer',
          progressIcon: 'stars',
          colors: {
            primary: 'bg-blue-500',
            secondary: 'bg-green-500',
            accent: 'bg-purple-500'
          }
        };
      case 'middle':
        return {
          ...baseStyles,
          buttonSize: 'medium',
          fontSize: 'text-base',
          buttonText: 'Try quiz',
          hintText: 'Hint',
          revealText: 'Reveal',
          progressIcon: 'bar',
          colors: {
            primary: 'bg-blue-600',
            secondary: 'bg-green-600',
            accent: 'bg-purple-600'
          }
        };
      case 'older':
        return {
          ...baseStyles,
          buttonSize: 'normal',
          fontSize: 'text-sm',
          buttonText: 'Attempt quiz',
          hintText: 'AI explain',
          revealText: 'Reveal (cost)',
          progressIcon: 'graph',
          colors: {
            primary: 'bg-blue-700',
            secondary: 'bg-green-700',
            accent: 'bg-purple-700'
          }
        };
    }
  };

  const ageStyles = getAgeGroupStyles();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get learner data from localStorage
      const learnerData = localStorage.getItem('learnerData');
      if (!learnerData) {
        showError('Please login first');
        navigate('/learner-auth');
        return;
      }

      const parsedLearner = JSON.parse(learnerData);
      setLearner(parsedLearner);

      // Calculate age group
      const group = calculateAgeGroup(parsedLearner.dob);
      setAgeGroup(group);

      // Fetch lessons appropriate for age group
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .or(`age_range.eq.${group},age_range.eq.all`);

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Set first lesson as current if available
      if (lessonsData && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
      }

      // Fetch quizzes for lessons
      if (lessonsData && lessonsData.length > 0) {
        const lessonIds = lessonsData.map(lesson => lesson.id);
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select('*')
          .in('lesson_id', lessonIds);

        if (quizzesError) throw quizzesError;
        setQuizzes(quizzesData || []);
      }

      // Fetch progress data
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('learner_id', parsedLearner.id);

      if (progressError) throw progressError;
      setProgressData(progressData || []);

      // Fetch points balance
      const { data: pointsData, error: pointsError } = await supabase
        .from('points_balance')
        .select('*')
        .eq('learner_id', parsedLearner.id)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') throw pointsError;
      setPointsBalance(pointsData || { id: '', learner_id: parsedLearner.id, points: 0 });

      // Fetch XP balance
      const { data: xpData, error: xpError } = await supabase
        .from('xp_balance')
        .select('*')
        .eq('learner_id', parsedLearner.id)
        .single();

      if (xpError && xpError.code !== 'PGRST116') throw xpError;
      setXpBalance(xpData || { id: '', learner_id: parsedLearner.id, xp: 0 });

      // Fetch homework
      const { data: homeworkData, error: homeworkError } = await supabase
        .from('homework')
        .select('*')
        .eq('learner_id', parsedLearner.id)
        .order('uploaded_at', { ascending: false });

      if (homeworkError) throw homeworkError;
      setHomework(homeworkData || []);

      showSuccess('Dashboard loaded successfully!');
    } catch (error: any) {
      showError('Failed to load dashboard: ' + error.message);
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('learnerData');
    showSuccess('Logged out successfully!');
    navigate('/learner-auth');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setActiveTab('lessons');
  };

  const handleMarkAsDone = async () => {
    if (!currentLesson || !learner) return;

    try {
      // Check if already completed
      const existingProgress = progressData.find(p => p.lesson_id === currentLesson.id);
      if (existingProgress?.completed) {
        showError('Lesson already marked as completed');
        return;
      }

      // Update or create progress
      const { data, error } = existingProgress
        ? await supabase
            .from('progress')
            .update({ completed: true, updated_at: new Date().toISOString() })
            .eq('id', existingProgress.id)
            .select()
        : await supabase
            .from('progress')
            .insert({
              learner_id: learner.id,
              lesson_id: currentLesson.id,
              completed: true,
              score: 0,
              updated_at: new Date().toISOString()
            })
            .select();

      if (error) throw error;

      // Award points and XP
      const pointsReward = 30;
      const xpReward = 100;

      // Update points
      const currentPoints = pointsBalance?.points || 0;
      const { error: pointsError } = pointsBalance
        ? await supabase
            .from('points_balance')
            .update({ points: currentPoints + pointsReward })
            .eq('id', pointsBalance.id)
        : await supabase
            .from('points_balance')
            .insert({
              learner_id: learner.id,
              points: pointsReward
            });

      if (pointsError) throw pointsError;

      // Update XP
      const currentXP = xpBalance?.xp || 0;
      const { error: xpError } = xpBalance
        ? await supabase
            .from('xp_balance')
            .update({ xp: currentXP + xpReward })
            .eq('id', xpBalance.id)
        : await supabase
            .from('xp_balance')
            .insert({
              learner_id: learner.id,
              xp: xpReward
            });

      if (xpError) throw xpError;

      // Update local state
      setPointsBalance(prev => ({ ...prev!, points: (prev?.points || 0) + pointsReward }));
      setXpBalance(prev => ({ ...prev!, xp: (prev?.xp || 0) + xpReward }));

      if (existingProgress) {
        setProgressData(prev => prev.map(p =>
          p.id === existingProgress.id ? { ...p, completed: true } : p
        ));
      } else {
        setProgressData(prev => [...prev, {
          id: data[0].id,
          learner_id: learner.id,
          lesson_id: currentLesson.id,
          completed: true,
          score: 0,
          updated_at: new Date().toISOString()
        }]);
      }

      showSuccess(`Lesson completed! +${pointsReward} points, +${xpReward} XP`);
    } catch (error: any) {
      showError('Failed to mark lesson as completed: ' + error.message);
      console.error('Error marking lesson as completed:', error);
    }
  };

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleQuizAnswer = async (quizId: string, chosenIndex: number) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz || !learner) return;

    const isCorrect = chosenIndex === quiz.correct_index;
    const pointsAwarded = isCorrect ? quiz.points_reward : 0;

    // Update quiz attempts state
    setQuizAttempts(prev => [...prev, {
      quizId,
      chosenIndex,
      correct: isCorrect
    }]);

    if (isCorrect) {
      // Award points
      const currentPoints = pointsBalance?.points || 0;
      const { error: pointsError } = pointsBalance
        ? await supabase
            .from('points_balance')
            .update({ points: currentPoints + pointsAwarded })
            .eq('id', pointsBalance.id)
        : await supabase
            .from('points_balance')
            .insert({
              learner_id: learner.id,
              points: pointsAwarded
            });

      if (pointsError) throw pointsError;

      // Award XP
      const xpAwarded = 40;
      const currentXP = xpBalance?.xp || 0;
      const { error: xpError } = xpBalance
        ? await supabase
            .from('xp_balance')
            .update({ xp: currentXP + xpAwarded })
            .eq('id', xpBalance.id)
        : await supabase
            .from('xp_balance')
            .insert({
              learner_id: learner.id,
              xp: xpAwarded
            });

      if (xpError) throw xpError;

      // Update local state
      setPointsBalance(prev => ({ ...prev!, points: (prev?.points || 0) + pointsAwarded }));
      setXpBalance(prev => ({ ...prev!, xp: (prev?.xp || 0) + xpAwarded }));

      showSuccess(`Correct! +${pointsAwarded} points, +${xpAwarded} XP`);

      // Record quiz attempt
      await supabase.from('quiz_attempts').insert({
        learner_id: learner.id,
        quiz_id: quizId,
        chosen_index: chosenIndex,
        correct: true,
        points_awarded: pointsAwarded,
        created_at: new Date().toISOString()
      });
    } else {
      showError('Incorrect answer. Try again!');
    }
  };

  const handleRevealAnswer = async (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz || !learner || !pointsBalance) return;

    if (pointsBalance.points < quiz.reveal_cost) {
      showError(`You need ${quiz.reveal_cost} points to reveal the answer. Complete more lessons to earn points!`);
      return;
    }

    // Deduct points
    const { error } = await supabase
      .from('points_balance')
      .update({ points: pointsBalance.points - quiz.reveal_cost })
      .eq('id', pointsBalance.id);

    if (error) {
      showError('Failed to deduct points');
      return;
    }

    // Update local state
    setPointsBalance(prev => ({ ...prev!, points: prev.points - quiz.reveal_cost }));

    showSuccess(`Answer revealed! -${quiz.reveal_cost} points. Use hints wisely!`);
    return true;
  };

  const getLevelFromXP = (xp: number) => {
    if (xp >= 3000) return { level: 4, name: 'Master', progress: 100 };
    if (xp >= 1500) return { level: 3, name: 'Explorer', progress: Math.min(100, ((xp - 1500) / 1500) * 100) };
    if (xp >= 500) return { level: 2, name: 'Learner', progress: Math.min(100, ((xp - 500) / 1000) * 100) };
    return { level: 1, name: 'Beginner', progress: Math.min(100, (xp / 500) * 100) };
  };

  const levelInfo = xpBalance ? getLevelFromXP(xpBalance.xp) : { level: 1, name: 'Beginner', progress: 0 };

  const completedLessons = progressData.filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const lessonQuizzes = currentLesson ? quizzes.filter(q => q.lesson_id === currentLesson.id) : [];

  const handleHomeworkUploadSuccess = () => {
    fetchData(); // Refresh data after homework upload
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-600">Please login to access your dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">Learnzaa</div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5 text-red-500" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-b p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('lessons'); setShowMobileMenu(false); }}>
            <BookOpen className="h-4 w-4 mr-2" /> Lessons
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('progress'); setShowMobileMenu(false); }}>
            <Star className="h-4 w-4 mr-2" /> My Progress
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('help'); setShowMobileMenu(false); }}>
            <Award className="h-4 w-4 mr-2" /> Help
          </Button>
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Learnzaa</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="hidden md:flex text-red-500 hover:text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/learner-dashboard" className="flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLesson?.subject || 'Subject'}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLesson?.title || 'Lesson'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Learner Info Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-white">
                {learner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{learner.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{learner.grade}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{pointsBalance?.points || 0}</span>
                <span className="text-sm text-gray-500">Points</span>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <div className="text-center">
                  <div className="text-lg font-bold">Level {levelInfo.level}</div>
                  <div className="text-sm text-gray-500">{levelInfo.name}</div>
                  <Progress value={levelInfo.progress} className="mt-2 h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <div className="text-center">
                  <div className="text-lg font-bold">{completionRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">Progress</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="progress">My Progress</TabsTrigger>
                <TabsTrigger value="help">Help</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons">
                <div className="space-y-6">
                  {currentLesson ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
                        <CardDescription className="text-lg">{currentLesson.subject}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                          {/* Render markdown content using MarkdownRenderer */}
                          <MarkdownRenderer content={currentLesson.md_content} ageGroup={ageGroup} />

                          {/* Homework Upload Section */}
                          <div className="mt-8">
                            <HomeworkUpload
                              learnerId={learner.id}
                              lessonId={currentLesson.id}
                              onUploadSuccess={handleHomeworkUploadSuccess}
                            />
                          </div>

                          {/* Lesson completion button */}
                          <div className="mt-6 flex justify-end">
                            <Button
                              onClick={handleMarkAsDone}
                              className={cn(
                                "px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md",
                                ageStyles.colors.primary,
                                "text-white hover:opacity-90"
                              )}
                              disabled={progressData.some(p => p.lesson_id === currentLesson.id && p.completed)}
                            >
                              {progressData.some(p => p.lesson_id === currentLesson.id && p.completed)
                                ? 'Lesson Completed ✅'
                                : 'Mark as Done'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="text-center p-8">
                        <p className="text-gray-600 dark:text-gray-400">No lesson selected</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quizzes for current lesson */}
                  {lessonQuizzes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Lesson Quizzes</CardTitle>
                        <CardDescription>Test your understanding with these quizzes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {lessonQuizzes.map((quiz) => (
                            <Card key={quiz.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleQuizSelect(quiz)}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-semibold">{quiz.question}</h3>
                                    <p className="text-sm text-gray-500">Reward: {quiz.points_reward} points</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    className={cn(
                                      ageStyles.colors.secondary,
                                      "text-white hover:opacity-90"
                                    )}
                                  >
                                    {ageStyles.buttonText}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="progress">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Learning Progress</CardTitle>
                      <CardDescription>Track your completed lessons and achievements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Lessons Completed</span>
                          <span className="text-2xl font-bold">{completedLessons}/{totalLessons}</span>
                        </div>
                        <Progress value={completionRate} className="h-3" />
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <p className="text-sm text-gray-500">Total Points</p>
                            <p className="text-2xl font-bold">{pointsBalance?.points || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total XP</p>
                            <p className="text-2xl font-bold">{xpBalance?.xp || 0}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Lessons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {progressData.filter(p => p.completed).length === 0 ? (
                        <p className="text-center text-gray-500">No lessons completed yet. Start learning!</p>
                      ) : (
                        <div className="space-y-3">
                          {progressData.filter(p => p.completed).map((progress) => {
                            const lesson = lessons.find(l => l.id === progress.lesson_id);
                            return lesson ? (
                              <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  <div>
                                    <p className="font-medium">{lesson.title}</p>
                                    <p className="text-sm text-gray-500">{lesson.subject}</p>
                                  </div>
                                </div>
                                <Badge variant="default">Completed</Badge>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Homework Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>My Homework</CardTitle>
                      <CardDescription>View your uploaded homework</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {homework.length === 0 ? (
                        <p className="text-center text-gray-500">No homework uploaded yet</p>
                      ) : (
                        <div className="space-y-4">
                          {homework.map((hw) => {
                            const lesson = lessons.find(l => l.id === hw.lesson_id);
                            const fileType = hw.file_url.split('.').pop()?.toUpperCase();
                            const fileIcon = fileType === 'PDF' ? <FilePdf className="h-5 w-5" /> :
                                          (['JPG', 'JPEG', 'PNG'].includes(fileType || '') ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />);

                            return (
                              <div key={hw.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    {fileIcon}
                                  </div>
                                  <div>
                                    <p className="font-medium">{lesson ? `${lesson.title} homework` : 'Homework'}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(hw.uploaded_at).toLocaleDateString()} • {fileType} • {hw.status}
                                    </p>
                                    {hw.review_notes && (
                                      <p className="text-xs text-gray-400 mt-1">Note: {hw.review_notes}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge variant={hw.status === 'reviewed' ? 'default' : 'secondary'}>
                                  {hw.status}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="help">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>Need help with your lessons or account?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">How to use Learnzaa</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          1. Select a lesson from the sidebar<br />
                          2. Read the lesson content carefully<br />
                          3. Complete the quizzes to earn points<br />
                          4. Mark lessons as done when completed<br />
                          5. Upload your homework<br />
                          6. Track your progress and level up!
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Contact Support</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          If you need help, contact your parent or teacher. They can assist you with any questions about the platform.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Tips for Learning</h3>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                          <li>Take your time reading each lesson</li>
                          <li>Try quizzes multiple times to understand</li>
                          <li>Use hints when you're stuck</li>
                          <li>Complete lessons regularly to earn rewards</li>
                          <li>Upload your homework to get feedback</li>
                          <li>Ask for help when you need it!</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Points & XP Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>Points</span>
                    </div>
                    <span className="text-xl font-bold">{pointsBalance?.points || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span>XP</span>
                    </div>
                    <span className="text-xl font-bold">{xpBalance?.xp || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-green-500" />
                      <span>Level</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{levelInfo.level}</span>
                      <span className="text-sm text-gray-500 block">{levelInfo.name}</span>
                    </div>
                  </div>

                  <Progress value={levelInfo.progress} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">
                    {levelInfo.progress.toFixed(0)}% to next level
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Lesson Card */}
            {lessons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Next Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {lessons.map((lesson) => {
                        const isCompleted = progressData.some(p => p.lesson_id === lesson.id && p.completed);
                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                              isCompleted ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-gray-200"
                            )}
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={cn(
                                  "font-medium",
                                  isCompleted ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-gray-100"
                                )}>
                                  {lesson.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{lesson.subject}</p>
                              </div>
                              {isCompleted && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className={cn(
                      "w-full justify-start",
                      ageStyles.colors.secondary,
                      "text-white hover:opacity-90"
                    )}
                    onClick={() => setActiveTab('lessons')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Lessons
                  </Button>

                  <Button
                    className="w-full justify-start bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setActiveTab('progress')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    My Progress
                  </Button>

                  <HomeworkUpload
                    learnerId={learner.id}
                    onUploadSuccess={handleHomeworkUploadSuccess}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>My Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                      </div>
                      <div>
                        <p className="font-medium">First Lesson</p>
                        <p className="text-sm text-gray-500">Complete your first lesson</p>
                      </div>
                    </div>
                    {completedLessons > 0 && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="font-medium">Quiz Master</p>
                        <p className="text-sm text-gray-500">Complete 5 quizzes correctly</p>
                      </div>
                    </div>
                    {quizAttempts.filter(a => a.correct).length >= 5 && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium">Learning Streak</p>
                        <p className="text-sm text-gray-500">Complete 3 lessons in a row</p>
                      </div>
                    </div>
                    {completedLessons >= 3 && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Upload className="h-4 w-4 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="font-medium">Homework Hero</p>
                        <p className="text-sm text-gray-500">Upload 3 homework assignments</p>
                      </div>
                    </div>
                    {homework.length >= 3 && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Quiz Question</DialogTitle>
            <DialogDescription>Answer the question to earn points!</DialogDescription>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedQuiz.question}</h3>
                <p className="text-sm text-gray-500 mb-4">Reward: {selectedQuiz.points_reward} points</p>
              </div>

              <div className="space-y-3">
                {selectedQuiz.options.map((option, index) => {
                  const isSelected = quizAttempts.some(a => a.quizId === selectedQuiz.id && a.chosenIndex === index);
                  const isCorrect = quizAttempts.some(a => a.quizId === selectedQuiz.id && a.correct && a.chosenIndex === index);
                  const isIncorrect = quizAttempts.some(a => a.quizId === selectedQuiz.id && !a.correct && a.chosenIndex === index);

                  return (
                    <Button
                      key={index}
                      className={cn(
                        "w-full justify-start text-left",
                        isSelected ? (isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700") : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                      onClick={() => handleQuizAnswer(selectedQuiz.id, index)}
                      disabled={isSelected}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                      {isSelected && (isCorrect ? ' ✅' : ' ❌')}
                    </Button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => showSuccess('Hint: Try to understand the question and think about what you learned in the lesson!')}
                >
                  {ageStyles.hintText}
                </Button>

                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-600"
                  onClick={async () => {
                    const success = await handleRevealAnswer(selectedQuiz.id);
                    if (success) {
                      // Show the correct answer
                      showSuccess(`Correct answer: ${String.fromCharCode(65 + selectedQuiz.correct_index)}. ${selectedQuiz.options[selectedQuiz.correct_index]}`);
                    }
                  }}
                >
                  {ageStyles.revealText} ({selectedQuiz.reveal_cost} points)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 mt-12 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('lessons')}>
                <BookOpen className="h-4 w-4 mr-1" /> Subjects
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('progress')}>
                <Star className="h-4 w-4 mr-1" /> My Progress
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('help')}>
                <Award className="h-4 w-4 mr-1" /> Help
              </Button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span>© 2026 Learnzaa. All rights reserved.</span>
              <Link to="/privacy" className="ml-4 hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
              <Link to="/terms" className="ml-4 hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnerPage;