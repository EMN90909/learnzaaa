"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, PlusCircle, ShoppingBag, LogOut, GraduationCap, Star, Award } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Learner {
  id: string;
  name: string;
  username: string;
  grade: string;
  org_id: string;
}

const LearnerDashboard: React.FC = () => {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const learnerData = localStorage.getItem('learnerData');
    if (!learnerData) {
      showError('Please login first');
      navigate('/learner-auth');
      return;
    }

    const parsedLearner = JSON.parse(learnerData);
    setLearner(parsedLearner);
    fetchStats(parsedLearner.id);
  }, [navigate]);

  const fetchStats = async (learnerId: string) => {
    try {
      const { data: pointsData } = await supabase
        .from('points_balance')
        .select('points')
        .eq('learner_id', learnerId)
        .maybeSingle();
      
      if (pointsData) setPoints(pointsData.points);

      const { data: xpData } = await supabase
        .from('xp_balance')
        .select('xp')
        .eq('learner_id', learnerId)
        .maybeSingle();
      
      if (xpData) setXp(xpData.xp);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('learnerData');
    showSuccess('Logged out successfully!');
    navigate('/learner-auth');
  };

  if (!learner) return null;

  const actionCards = [
    {
      title: "Learn",
      description: "Explore interactive lessons and take fun quizzes.",
      icon: <BookOpen className="h-12 w-12 text-blue-500" />,
      color: "hover:border-blue-500 hover:bg-blue-50/50",
      action: () => navigate('/learner-page'),
      buttonText: "Start Learning",
      buttonClass: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Create",
      description: "Build your own websites and apps with visual blocks.",
      icon: <PlusCircle className="h-12 w-12 text-green-500" />,
      color: "hover:border-green-500 hover:bg-green-50/50",
      action: () => navigate('/builder'),
      buttonText: "Open Builder",
      buttonClass: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Marketplace",
      description: "Share your projects and trade them for gems!",
      icon: <ShoppingBag className="h-12 w-12 text-purple-500" />,
      color: "hover:border-purple-500 hover:bg-purple-50/50",
      action: () => navigate('/marketplace'),
      buttonText: "Visit Market",
      buttonClass: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Learnzaa</h1>
              <p className="text-slate-500 font-medium">Welcome back, {learner.name}!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 flex items-center gap-3 bg-white/80 backdrop-blur-sm border-none shadow-sm">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-slate-700">{points} 💎</span>
            </Card>
            <Card className="px-4 py-2 flex items-center gap-3 bg-white/80 backdrop-blur-sm border-none shadow-sm">
              <Award className="h-5 w-5 text-purple-500" />
              <span className="font-bold text-slate-700">{xp} XP</span>
            </Card>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {actionCards.map((card, index) => (
            <Card 
              key={index} 
              className={cn(
                "group relative overflow-hidden border-2 border-transparent transition-all duration-300 cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-none",
                card.color
              )}
              onClick={card.action}
            >
              <CardHeader className="pb-2">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <CardTitle className="text-2xl font-black">{card.title}</CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Button className={cn("w-full font-bold rounded-xl", card.buttonClass)}>
                  {card.buttonText}
                </Button>
              </CardContent>
              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 opacity-5 transform rotate-12 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(card.icon as React.ReactElement, { size: 120 })}
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" /> Your Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-600">
                <span>Level {Math.floor(xp / 500) + 1}</span>
                <span>{xp % 500} / 500 XP</span>
              </div>
              <Progress value={(xp % 500) / 5} className="h-3 rounded-full" />
            </div>
          </Card>
          
          <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Daily Streak</h3>
              <p className="text-sm text-slate-500 font-medium">Keep learning to grow your streak!</p>
            </div>
            <div className="text-3xl font-black text-orange-500 flex items-center gap-2">
              🔥 1
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;