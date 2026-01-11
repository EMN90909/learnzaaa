"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Award, CheckCircle, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface ResultsSummaryProps {
  lessonId?: string;
  quizId?: string;
  score?: number;
  totalPoints?: number;
  onContinue?: () => void;
  onClose?: () => void;
  taskType: 'lesson' | 'quiz' | 'homework';
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  lessonId,
  quizId,
  score = 0,
  totalPoints = 100,
  onContinue,
  onClose,
  taskType = 'lesson'
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [performanceText, setPerformanceText] = useState('');
  const [performanceColor, setPerformanceColor] = useState('');
  const [gradientColors, setGradientColors] = useState(['#f7bb97', '#dd5e89']);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useSession();

  // Calculate performance based on score
  const calculatePerformance = (score: number) => {
    const percentage = (score / totalPoints) * 100;

    if (percentage >= 90) {
      setPerformanceText('Excellent!');
      setPerformanceColor('#4CAF50');
      setGradientColors(['#4CAF50', '#8BC34A']);
      return 'excellent';
    } else if (percentage >= 75) {
      setPerformanceText('Great Job!');
      setPerformanceColor('#FFC107');
      setGradientColors(['#FFC107', '#FF9800']);
      return 'great';
    } else if (percentage >= 60) {
      setPerformanceText('Good Effort!');
      setPerformanceColor('#2196F3');
      setGradientColors(['#2196F3', '#03A9F4']);
      return 'good';
    } else {
      setPerformanceText('Keep Trying!');
      setPerformanceColor('#FF5722');
      setGradientColors(['#FF5722', '#E91E63']);
      return 'needs-improvement';
    }
  };

  // Calculate points and XP based on task type and performance
  const calculateRewards = (performance: string) => {
    let points = 0;
    let xp = 0;

    switch (taskType) {
      case 'lesson':
        points = performance === 'excellent' ? 50 :
                 performance === 'great' ? 40 :
                 performance === 'good' ? 30 : 20;
        xp = performance === 'excellent' ? 150 :
             performance === 'great' ? 120 :
             performance === 'good' ? 90 : 60;
        break;
      case 'quiz':
        points = performance === 'excellent' ? 30 :
                 performance === 'great' ? 25 :
                 performance === 'good' ? 20 : 15;
        xp = performance === 'excellent' ? 100 :
             performance === 'great' ? 80 :
             performance === 'good' ? 60 : 40;
        break;
      case 'homework':
        points = performance === 'excellent' ? 40 :
                 performance === 'great' ? 35 :
                 performance === 'good' ? 30 : 25;
        xp = performance === 'excellent' ? 120 :
             performance === 'great' ? 100 :
             performance === 'good' ? 80 : 60;
        break;
    }

    setPointsEarned(points);
    setXpEarned(xp);
    return { points, xp };
  };

  // Award points and XP to learner
  const awardRewards = async (learnerId: string, points: number, xp: number) => {
    try {
      // Update points balance
      const { data: pointsData, error: pointsError } = await supabase
        .from('points_balance')
        .select('*')
        .eq('learner_id', learnerId)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') {
        throw pointsError;
      }

      const currentPoints = pointsData?.points || 0;
      const { error: updatePointsError } = pointsData
        ? await supabase
            .from('points_balance')
            .update({ points: currentPoints + points })
            .eq('id', pointsData.id)
        : await supabase
            .from('points_balance')
            .insert({ learner_id: learnerId, points });

      if (updatePointsError) throw updatePointsError;

      // Update XP balance
      const { data: xpData, error: xpError } = await supabase
        .from('xp_balance')
        .select('*')
        .eq('learner_id', learnerId)
        .single();

      if (xpError && xpError.code !== 'PGRST116') {
        throw xpError;
      }

      const currentXP = xpData?.xp || 0;
      const { error: updateXPError } = xpData
        ? await supabase
            .from('xp_balance')
            .update({ xp: currentXP + xp })
            .eq('id', xpData.id)
        : await supabase
            .from('xp_balance')
            .insert({ learner_id: learnerId, xp });

      if (updateXPError) throw updateXPError;

      // Record the completion
      if (lessonId) {
        const { error: progressError } = await supabase
          .from('progress')
          .upsert({
            learner_id: learnerId,
            lesson_id: lessonId,
            completed: true,
            score: score,
            updated_at: new Date().toISOString()
          });

        if (progressError) throw progressError;
      }

      return true;
    } catch (error: any) {
      showError('Failed to award rewards: ' + error.message);
      console.error('Error awarding rewards:', error);
      return false;
    }
  };

  useEffect(() => {
    // Start confetti animation
    setShowConfetti(true);

    // Calculate performance and rewards
    const performance = calculatePerformance(score);
    const { points, xp } = calculateRewards(performance);

    // If we have a learner ID, award the rewards
    if (user) {
      // In a real app, you'd get the learner ID from the session
      // For now, we'll simulate this
      const learnerId = localStorage.getItem('learnerData')
        ? JSON.parse(localStorage.getItem('learnerData')!).id
        : null;

      if (learnerId) {
        awardRewards(learnerId, points, xp);
      }
    }

    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [score, totalPoints, taskType, user]);

  const getTaskIcon = () => {
    switch (taskType) {
      case 'lesson': return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'quiz': return <Star className="h-8 w-8 text-yellow-500" />;
      case 'homework': return <Trophy className="h-8 w-8 text-blue-500" />;
      default: return <Award className="h-8 w-8 text-purple-500" />;
    }
  };

  const getTaskTitle = () => {
    switch (taskType) {
      case 'lesson': return 'Lesson Completed!';
      case 'quiz': return 'Quiz Results';
      case 'homework': return 'Homework Review';
      default: return 'Task Completed';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2000}ms`,
                animationDuration: `${2000 + Math.random() * 2000}ms`,
                backgroundColor: i % 2 === 0 ? '#FFD700' :
                               i % 3 === 0 ? '#FF6B6B' :
                               i % 4 === 0 ? '#4ECDC4' :
                               i % 5 === 0 ? '#45B7D1' : '#96CEB4'
              }}
            />
          ))}
        </div>
      )}

      <Card className="w-full max-w-md relative overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            {getTaskIcon()}
            {getTaskTitle()}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="relative inline-block">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: `linear-gradient(-45deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}
              >
                <div className="text-4xl font-bold text-white">
                  {Math.round((score / totalPoints) * 100)}
                </div>
              </div>
              <div className="text-sm text-gray-600">Score: {score}/{totalPoints}</div>
            </div>
          </div>

          {/* Performance Feedback */}
          <div className="text-center">
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: performanceColor }}
            >
              {performanceText}
            </h3>
            <p className="text-gray-600">
              {taskType === 'lesson' && 'Great job completing the lesson!'}
              {taskType === 'quiz' && 'You did well on the quiz!'}
              {taskType === 'homework' && 'Excellent work on your homework!'}
            </p>
          </div>

          {/* Rewards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Points Earned</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">+{pointsEarned}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">XP Earned</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">+{xpEarned}</div>
            </div>
          </div>

          {/* Additional Details */}
          {showDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Performance Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-medium">{Math.round((score / totalPoints) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Spent:</span>
                  <span className="font-medium">5 min 30 sec</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="font-medium">Medium</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                onContinue?.();
                onClose?.();
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
            >
              Continue Learning
            </Button>

            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="w-full"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confetti Styles */}
      <style>{`
        .confetti {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 20px;
          opacity: 0;
          animation: makeItRain 3000ms infinite linear;
        }

        @keyframes makeItRain {
          from {
            opacity: 0;
          }

          50% {
            opacity: 1;
          }

          to {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsSummary;