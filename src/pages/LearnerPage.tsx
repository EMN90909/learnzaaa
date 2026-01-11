"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Star, Award, Upload, LogOut, Menu, CheckCircle, Lightbulb, PartyPopper, Copy, Check, AlertCircle, Files, X, GraduationCap } from 'lucide-react';
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
  reviewed_at: string;
  parent_comment: string;
}

interface Organization {
  id: string;
  tier: string;
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
  const [organization, setOrganization] = useState<Organization | null>(null);
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

  // Get age group specific styles and content
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
      },
      emoji: '🎉',
      encouragement: 'Great job!',
      challengeText: 'Ready for a challenge?'
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
          },
          emoji: '🎈',
          encouragement: 'Awesome work!',
          challengeText: 'Want to try something fun?'
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
          },
          emoji: '🚀',
          encouragement: 'You got this!',
          challengeText: 'Ready for the next level?'
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
          },
          emoji: '💡',
          encouragement: 'Keep going!',
          challengeText: 'Challenge accepted?'
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

      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', parsedLearner.org_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Fetch lessons based on organization tier
      let lessonsQuery = supabase.from('lessons').select('*');

      if (orgData?.tier === 'free') {
        lessonsQuery = lessonsQuery.or('is_premium.is.null,is_premium.eq.false');
      }

      const { data: lessonsData, error: lessonsError } = await lessonsQuery;

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

      showSuccess(`Welcome back, ${parsedLearner.name}! ${ageStyles.emoji}`);
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
    showSuccess('See you next time! 👋');
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
        showError('You already completed this lesson! 🎉');
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

      showSuccess(`${ageStyles.encouragement} +${pointsReward} 💎, +${xpReward} ⚡`);
    } catch (error: any) {
      showError('Oops! Something went wrong: ' + error.message);
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

      showSuccess(`🎉 Correct! +${pointsAwarded} 💎, +${xpAwarded} ⚡`);

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
      showError('❌ Not quite! Try again!');
    }
  };

  const handleRevealAnswer = async (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz || !learner || !pointsBalance) return;

    if (pointsBalance.points < quiz.reveal_cost) {
      showError(`You need ${quiz.reveal_cost} 💎 to reveal the answer. Complete more lessons to earn points!`);
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

    showSuccess(`Answer revealed! -${quiz.reveal_cost} 💎. Use hints wisely!`);
    return true;
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

  const handleHomeworkUploadSuccess = () => {
    fetchData(); // Refresh data after homework upload
  };

  const copyToClipboard = () => {
    const textToCopy = `My Learnzaa Progress:
💎 Points: ${pointsBalance?.points || 0}
⚡ XP: ${xpBalance?.xp || 0}
🏆 Level: ${levelInfo.level} ${levelInfo.name} ${levelInfo.emoji}
📚 Lessons Completed: ${completedLessons}/${totalLessons} (${completionRate.toFixed(0)}%)`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      showSuccess('Progress copied to clipboard! 📋');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      showError('Could not copy to clipboard');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="loader">
          <span><span></span><span></span><span></span><span></span></span>
          <div className="base">
            <span></span>
            <div className="face"></div>
          </div>
        </div>
        <div className="longfazers">
          <span></span><span></span><span></span><span></span>
        </div>
        <style>{`
          .loader {
            position: absolute;
            top: 50%;
            margin-left: -50px;
            left: 50%;
            animation: speeder 0.4s linear infinite;
          }
          .loader > span {
            height: 5px;
            width: 35px;
            background: #000;
            position: absolute;
            top: -19px;
            left: 60px;
            border-radius: 2px 10px 1px 0;
          }
          .base span {
            position: absolute;
            width: 0;
            height: 0;
            border-top: 6px solid transparent;
            border-right: 100px solid #000;
            border-bottom: 6px solid transparent;
          }
          .base span:before {
            content: "";
            height: 22px;
            width: 22px;
            border-radius: 50%;
            background: #000;
            position: absolute;
            right: -110px;
            top: -16px;
          }
          .base span:after {
            content: "";
            position: absolute;
            width: 0;
            height: 0;
            border-top: 0 solid transparent;
            border-right: 55px solid #000;
            border-bottom: 16px solid transparent;
            top: -16px;
            right: -98px;
          }
          .face {
            position: absolute;
            height: 12px;
            width: 20px;
            background: #000;
            border-radius: 20px 20px 0 0;
            transform: rotate(-40deg);
            right: -125px;
            top: -15px;
          }
          .face:after {
            content: "";
            height: 12px;
            width: 12px;
            background: #000;
            right: 4px;
            top: 7px;
            position: absolute;
            transform: rotate(40deg);
            transform-origin: 50% 50%;
            border-radius: 0 0 0 2px;
          }
          .loader > span > span:nth-child(1),
          .loader > span > span:nth-child(2),
          .loader > span > span:nth-child(3),
          .loader > span > span:nth-child(4) {
            width: 30px;
            height: 1px;
            background: #000;
            position: absolute;
            animation: fazer1 0.2s linear infinite;
          }
          .loader > span > span:nth-child(2) {
            top: 3px;
            animation: fazer2 0.4s linear infinite;
          }
          .loader > span > span:nth-child(3) {
            top: 1px;
            animation: fazer3 0.4s linear infinite;
            animation-delay: -1s;
          }
          .loader > span > span:nth-child(4) {
            top: 4px;
            animation: fazer4 1s linear infinite;
            animation-delay: -1s;
          }
          @keyframes fazer1 {
            0% {
              left: 0;
            }
            100% {
              left: -80px;
              opacity: 0;
            }
          }
          @keyframes fazer2 {
            0% {
              left: 0;
            }
            100% {
              left: -100px;
              opacity: 0;
            }
          }
          @keyframes fazer3 {
            0% {
              left: 0;
            }
            100% {
              left: -50px;
              opacity: 0;
            }
          }
          @keyframes fazer4 {
            0% {
              left: 0;
            }
              100% {
              left: -150px;
              opacity: 0;
            }
          }
          @keyframes speeder {
            0% {
              transform: translate(2px, 1px) rotate(0deg);
            }
            10% {
              transform: translate(-1px, -3px) rotate(-1deg);
            }
            20% {
              transform: translate(-2px, 0px) rotate(1deg);
            }
            30% {
              transform: translate(1px, 2px) rotate(0deg);
            }
            40% {
              transform: translate(1px, -1px) rotate(1deg);
            }
            50% {
              transform: translate(-1px, 3px) rotate(-1deg);
            }
            60% {
              transform: translate(-1px, 1px) rotate(0deg);
            }
            70% {
              transform: translate(3px, 1px) rotate(-1deg);
            }
            80% {
              transform: translate(-2px, -1px) rotate(1deg);
            }
            90% {
              transform: translate(2px, 1px) rotate(0deg);
            }
            100% {
              transform: translate(1px, -2px) rotate(-1deg);
            }
          }
          .longfazers {
            position: absolute;
            width: 100%;
            height: 100%;
          }
          .longfazers span {
            position: absolute;
            height: 2px;
            width: 20%;
            background: #000;
          }
          .longfazers span:nth-child(1) {
            top: 20%;
            animation: lf 0.6s linear infinite;
            animation-delay: -5s;
          }
          .longfazers span:nth-child(2) {
            top: 40%;
            animation: lf2 0.8s linear infinite;
            animation-delay: -1s;
          }
          .longfazers span:nth-child(3) {
            top: 60%;
            animation: lf3 0.6s linear infinite;
          }
          .longfazers span:nth-child(4) {
            top: 80%;
            animation: lf4 0.5s linear infinite;
            animation-delay: -3s;
          }
          @keyframes lf {
            0% {
              left: 200%;
            }
            100% {
              left: -200%;
              opacity: 0;
            }
          }
          @keyframes lf2 {
            0% {
              left: 200%;
            }
            100% {
              left: -200%;
              opacity: 0;
            }
          }
          @keyframes lf3 {
            0% {
              left: 200%;
            }
            100% {
              left: -100%;
              opacity: 0;
            }
          }
          @keyframes lf4 {
            0% {
              left: 200%;
            }
            100% {
              left: -100%;
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Welcome to Learnzaa!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">Please login to start your learning journey</p>
            <Button onClick={() => navigate('/learner-auth')} className="bg-blue-600 hover:bg-blue-700 text-white">
              <GraduationCap className="h-4 w-4 mr-2" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <Menu className="h-6 w-6 text-blue-600" />
        </Button>
        <div className="text-xl font-bold text-blue-600">Learnzaa</div>
        <div className="relative">
          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <AvatarFallback className="bg-blue-600 text-white">
              {learner.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <p className="font-semibold">{learner.name}</p>
                <p className="text-sm text-gray-500">{learner.grade}</p>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                variant="ghost"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white/90 backdrop-blur-sm border-b p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('lessons'); setShowMobileMenu(false); }}>
            <BookOpen className="h-4 w-4 mr-2 text-blue-600" /> My Lessons
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('progress'); setShowMobileMenu(false); }}>
            <Star className="h-4 w-4 mr-2 text-yellow-500" /> My Progress
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setActiveTab('help'); setShowMobileMenu(false); }}>
            <Lightbulb className="h-4 w-4 mr-2 text-green-500" /> Help Center
          </Button>
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold text-blue-600">Learnzaa</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 shadow-sm border"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-blue-600" />}
              {copied ? 'Copied!' : 'Copy Progress'}
            </Button>
            <div className="relative">
              <Avatar className="h-10 w-10 cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <AvatarFallback className="bg-blue-600 text-white">
                  {learner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <p className="font-semibold">{learner.name}</p>
                    <p className="text-sm text-gray-500">{learner.grade}</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    variant="ghost"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learner Info Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-blue-100">
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {learner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
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
                  <div className="text-sm text-gray-500">{levelInfo.name}</div>
                  <Progress value={levelInfo.progress} className="mt-2 h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-green-50 border-green-200">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-green-500" />
                <div className="text-center">
                  <div className="text-lg font-bold">{completionRate.toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">Progress</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Premium Notice for Free Accounts */}
        {organization?.tier === 'free' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Upgrade to Premium</p>
                  <p className="text-sm text-yellow-700">Unlock all lessons and remove ads for only Ksh 1,071.73/month</p>
                </div>
              </div>
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => showSuccess('Contact your parent/guardian to upgrade your account!')}
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="lessons" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Lessons
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <Star className="h-4 w-4" /> Progress
                </TabsTrigger>
                <TabsTrigger value="help" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Help
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lessons">
                <div className="space-y-6">
                  {currentLesson ? (
                    <Card className="border-2 border-blue-100">
                      <CardHeader className="bg-blue-50">
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <BookOpen className="text-blue-600" /> {currentLesson.title}
                        </CardTitle>
                        <CardDescription className="text-lg flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
                            {currentLesson.subject}
                          </span>
                          {currentLesson.is_premium && organization?.tier === 'free' && (
                            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-sm font-medium">
                              Premium Lesson
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-4">
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
                                ? <span className="flex items-center gap-2">✅ Lesson Completed {ageStyles.emoji}</span>
                                : <span className="flex items-center gap-2">🎯 Mark as Done</span>}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="text-center p-8 bg-white/50">
                      <CardContent>
                        <div className="mb-4">
                          <BookOpen className="h-12 w-12 text-blue-300 mx-auto" />
                        </div>
                        <p className="text-gray-600">No lesson selected</p>
                        <p className="text-sm text-gray-500 mt-2">Choose a lesson from the sidebar to get started!</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quizzes for current lesson */}
                  {lessonQuizzes.length > 0 && (
                    <Card className="border-2 border-green-100">
                      <CardHeader className="bg-green-50">
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="text-green-600" /> Lesson Quizzes
                        </CardTitle>
                        <CardDescription>Test your understanding and earn points!</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {lessonQuizzes.map((quiz) => (
                            <Card
                              key={quiz.id}
                              className="hover:shadow-md transition-shadow cursor-pointer border border-green-100"
                              onClick={() => handleQuizSelect(quiz)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-semibold">{quiz.question}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Reward: {quiz.points_reward} 💎</p>
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
                  <Card className="border-2 border-yellow-100">
                    <CardHeader className="bg-yellow-50">
                      <CardTitle className="flex items-center gap-2">
                        <Star className="text-yellow-500" /> My Learning Journey
                      </CardTitle>
                      <CardDescription>Track your progress and achievements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-3xl font-bold text-blue-600">{completedLessons}</div>
                            <div className="text-sm text-gray-500 mt-1">Lessons Completed</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-3xl font-bold text-yellow-600">{pointsBalance?.points || 0}</div>
                            <div className="text-sm text-gray-500 mt-1">💎 Total Points</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-3xl font-bold text-purple-600">{xpBalance?.xp || 0}</div>
                            <div className="text-sm text-gray-500 mt-1">⚡ Total XP</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-3xl font-bold text-green-600">{completionRate.toFixed(0)}%</div>
                            <div className="text-sm text-gray-500 mt-1">Completion Rate</div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="text-green-500" /> Completed Lessons
                          </h3>
                          {progressData.filter(p => p.completed).length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500 mb-2">No lessons completed yet</p>
                              <p className="text-sm text-gray-400">Start learning to see your progress here!</p>
                              <Button
                                onClick={() => setActiveTab('lessons')}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Start Learning
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {progressData.filter(p => p.completed).map((progress) => {
                                const lesson = lessons.find(l => l.id === progress.lesson_id);
                                return lesson ? (
                                  <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                    <div className="flex items-center space-x-3">
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                      <div>
                                        <p className="font-medium">{lesson.title}</p>
                                        <p className="text-sm text-gray-500">{lesson.subject}</p>
                                      </div>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      Completed ✅
                                    </Badge>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>

                        {/* Homework Section */}
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Upload className="text-blue-500" /> My Homework
                          </h3>
                          {homework.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500 mb-2">No homework uploaded yet</p>
                              <p className="text-sm text-gray-400">Upload your completed work to get feedback!</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {homework.map((hw) => {
                                const lesson = lessons.find(l => l.id === hw.lesson_id);
                                const fileType = hw.file_url.split('.').pop()?.toUpperCase();
                                const fileIcon = fileType === 'PDF' ? <FilePdf className="h-5 w-5" /> :
                                              (['JPG', 'JPEG', 'PNG'].includes(fileType || '') ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />);

                                return (
                                  <div key={hw.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        {fileIcon}
                                      </div>
                                      <div>
                                        <p className="font-medium">{lesson ? `${lesson.title} homework` : 'Homework'}</p>
                                        <p className="text-sm text-gray-500">
                                          {new Date(hw.uploaded_at).toLocaleDateString()} • {fileType}
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="help">
                <Card className="border-2 border-purple-100">
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="text-purple-500" /> Help & Support
                    </CardTitle>
                    <CardDescription>Need help with your lessons or account?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                          <GraduationCap className="text-blue-500" /> How to use Learnzaa
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full mt-1">
                              <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <p>Select a lesson from the sidebar</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full mt-1">
                              <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p>Read the lesson content carefully</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full mt-1">
                              <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p>Complete the quizzes to earn points 💎</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full mt-1">
                              <span className="text-blue-600 font-bold">4</span>
                            </div>
                            <p>Mark lessons as done when completed</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full mt-1">
                              <span className="text-blue-600 font-bold">5</span>
                            </div>
                            <p>Upload your homework to get feedback</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full mt-1">
                              <span className="text-blue-600 font-bold">6</span>
                            </div>
                            <p>Track your progress and level up! 🚀</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                          <PartyPopper className="text-green-500" /> Tips for Learning
                        </h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                          <li>Take your time reading each lesson</li>
                          <li>Try quizzes multiple times to understand</li>
                          <li>Use hints when you're stuck - they're free! 💡</li>
                          <li>Complete lessons regularly to earn rewards</li>
                          <li>Upload your homework to get feedback from your teacher</li>
                          <li>Ask for help when you need it - we're here to support you!</li>
                        </ul>
                      </div>

                      <div className="bg-white p-6 rounded-lg border">
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-600">
                          <Award className="text-purple-500" /> Points & Levels
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-full mt-1">
                              <span className="text-purple-600 font-bold">💎</span>
                            </div>
                            <div>
                              <p className="font-medium">Points</p>
                              <p className="text-sm text-gray-600">Earn points by completing lessons and quizzes</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-full mt-1">
                              <span className="text-purple-600 font-bold">⚡</span>
                            </div>
                            <div>
                              <p className="font-medium">XP (Experience Points)</p>
                              <p className="text-sm text-gray-600">Gain XP to level up and unlock achievements</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 p-2 rounded-full mt-1">
                              <span className="text-purple-600 font-bold">🏆</span>
                            </div>
                            <div>
                              <p className="font-medium">Levels</p>
                              <p className="text-sm text-gray-600">Level up as you gain more XP and complete more lessons</p>
                            </div>
                          </div>
                        </div>
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
            <Card className="border-2 border-yellow-100">
              <CardHeader className="bg-yellow-50">
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-yellow-500" /> Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>💎 Points</span>
                    </div>
                    <span className="text-xl font-bold">{pointsBalance?.points || 0}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span>⚡ XP</span>
                    </div>
                    <span className="text-xl font-bold">{xpBalance?.xp || 0}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-green-500" />
                      <span>Level</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{levelInfo.level}</span>
                      <span className="text-sm text-gray-500 block">{levelInfo.name} {levelInfo.emoji}</span>
                    </div>
                  </div>

                  <Progress value={levelInfo.progress} className="h-3" />
                  <p className="text-xs text-gray-500 text-center">
                    {levelInfo.progress.toFixed(0)}% to next level {levelInfo.level < 4 ? '🚀' : '🏆'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Lesson Card */}
            {lessons.length > 0 && (
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-blue-500" /> Next Lessons
                  </CardTitle>
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
                              isCompleted ? "border-green-200 bg-green-50" : "border-blue-200 bg-white"
                            )}
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={cn(
                                  "font-medium",
                                  isCompleted ? "text-green-700" : "text-blue-700"
                                )}>
                                  {lesson.title}
                                </h3>
                                <p className="text-sm text-gray-500">{lesson.subject}</p>
                                {lesson.is_premium && organization?.tier === 'free' && (
                                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                                    Premium
                                  </span>
                                )}
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
            <Card className="border-2 border-green-100">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-green-500" /> Quick Actions
                </CardTitle>
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
                    className="w-full justify-start bg-white border border-green-200 hover:bg-green-50 text-green-700"
                    onClick={() => setActiveTab('progress')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    My Progress
                  </Button>

                  <HomeworkUpload
                    learnerId={learner.id}
                    onUploadSuccess={handleHomeworkUploadSuccess}
                  />

                  <Button
                    className="w-full justify-start bg-white border border-blue-200 hover:bg-blue-50 text-blue-700"
                    onClick={() => setActiveTab('help')}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Award className="text-purple-500" /> My Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">First Lesson</p>
                        <p className="text-sm text-gray-500">Complete your first lesson</p>
                      </div>
                    </div>
                    {completedLessons > 0 && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Quiz Master</p>
                        <p className="text-sm text-gray-500">Complete 5 quizzes correctly</p>
                      </div>
                    </div>
                    {quizAttempts.filter(a => a.correct).length >= 5 && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Learning Streak</p>
                        <p className="text-sm text-gray-500">Complete 3 lessons in a row</p>
                      </div>
                    </div>
                    {completedLessons >= 3 && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Upload className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Homework Hero</p>
                        <p className="text-sm text-gray-500">Upload 3 homework assignments</p>
                      </div>
                    </div>
                    {homework.length >= 3 && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
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
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="text-yellow-500" /> Quiz Question
            </DialogTitle>
            <DialogDescription>Answer the question to earn points! 💎</DialogDescription>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedQuiz.question}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" /> Reward: {selectedQuiz.points_reward} 💎
                </p>
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
                        isSelected ? (isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700") : "bg-blue-100 hover:bg-blue-200 text-blue-800"
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
                  onClick={() => showSuccess('💡 Hint: Try to understand the question and think about what you learned in the lesson!')}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" /> {ageStyles.hintText}
                </Button>

                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-600 flex items-center gap-2"
                  onClick={async () => {
                    const success = await handleRevealAnswer(selectedQuiz.id);
                    if (success) {
                      // Show the correct answer
                      showSuccess(`✨ Correct answer: ${String.fromCharCode(65 + selectedQuiz.correct_index)}. ${selectedQuiz.options[selectedQuiz.correct_index]}`);
                    }
                  }}
                >
                  <Star className="h-4 w-4" /> {ageStyles.revealText} ({selectedQuiz.reveal_cost} 💎)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-6 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('lessons')} className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Lessons
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('progress')} className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Progress
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('help')} className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Help
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              <span>© 2026 Learnzaa. Made with ❤️ for learners!</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnerPage;