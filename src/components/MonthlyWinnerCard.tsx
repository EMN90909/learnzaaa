"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Award, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface Learner {
  id: string;
  name: string;
  username: string;
  grade: string;
  org_id: string;
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

interface MonthlyWinner {
  learner: Learner;
  points: number;
  xp: number;
  level: number;
  month: string;
}

const MonthlyWinnerCard: React.FC = () => {
  const [winner, setWinner] = useState<MonthlyWinner | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');

  const fetchMonthlyWinner = async () => {
    setLoading(true);
    try {
      // Get current month
      const now = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December"];
      const currentMonthName = monthNames[now.getMonth()];
      setCurrentMonth(currentMonthName);

      // Get organization ID from current learner
      const learnerData = localStorage.getItem('learnerData');
      const currentLearner = learnerData ? JSON.parse(learnerData) : null;
      const orgId = currentLearner?.org_id;

      if (!orgId) {
        showError('No organization found');
        return;
      }

      // Fetch all learners in the organization
      const { data: learnersData, error: learnersError } = await supabase
        .from('learners')
        .select('*')
        .eq('org_id', orgId);

      if (learnersError) throw learnersError;

      // Fetch points and XP for all learners
      const learnerIds = learnersData.map(l => l.id);

      const { data: pointsData, error: pointsError } = await supabase
        .from('points_balance')
        .select('*')
        .in('learner_id', learnerIds);

      if (pointsError) throw pointsError;

      const { data: xpData, error: xpError } = await supabase
        .from('xp_balance')
        .select('*')
        .in('learner_id', learnerIds);

      if (xpError) throw xpError;

      // Combine data and calculate levels
      const combinedData = learnersData.map((learner) => {
        const pointsBalance = pointsData.find(p => p.learner_id === learner.id);
        const xpBalance = xpData.find(x => x.learner_id === learner.id);

        // Calculate level from XP
        const level = calculateLevel(xpBalance?.xp || 0);

        return {
          learner,
          points: pointsBalance?.points || 0,
          xp: xpBalance?.xp || 0,
          level
        };
      });

      // Sort by points (descending) to find the winner
      combinedData.sort((a, b) => b.points - a.points);

      if (combinedData.length > 0) {
        setWinner({
          ...combinedData[0],
          month: currentMonthName
        });
      }
    } catch (error: any) {
      showError('Failed to fetch monthly winner: ' + error.message);
      console.error('Error fetching monthly winner:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (xp: number) => {
    if (xp >= 3000) return 4;
    if (xp >= 1500) return 3;
    if (xp >= 500) return 2;
    return 1;
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Learner';
      case 3: return 'Explorer';
      case 4: return 'Master';
      default: return 'Beginner';
    }
  };

  const getLevelEmoji = (level: number) => {
    switch (level) {
      case 1: return '🐣';
      case 2: return '📚';
      case 3: return '🌟';
      case 4: return '🏆';
      default: return '🐣';
    }
  };

  useEffect(() => {
    fetchMonthlyWinner();
  }, []);

  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" /> Monthly Winner
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
        </CardContent>
      </Card>
    );
  }

  if (!winner) {
    return (
      <Card className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" /> Monthly Winner
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-4">
            <Trophy className="h-16 w-16 text-yellow-300 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Winner Yet</h3>
          <p className="text-gray-600">Complete lessons and earn points to become the monthly winner!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 overflow-hidden">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 bg-yellow-100 p-2 rounded-full">
          <Calendar className="h-5 w-5 text-yellow-600" />
        </div>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Trophy className="h-6 w-6 text-yellow-600" /> {currentMonth} Winner
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {/* Trophy and Winner Info */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-20"></div>
          </div>
          <div className="relative z-10">
            <div className="mb-4">
              <svg
                className="icon trophy mx-auto"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
              >
                <path
                  d="M469.333333 682.666667h85.333334v128h-85.333334zM435.2 810.666667h153.6c4.693333 0 8.533333 3.84 8.533333 8.533333v34.133333h-170.666666v-34.133333c0-4.693333 3.84-8.533333 8.533333-8.533333z"
                  fill="#ea9518"
                ></path>
                <path
                  d="M384 853.333333h256a42.666667 42.666667 0 0 1 42.666667 42.666667v42.666667H341.333333v-42.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z"
                  fill="#6e4a32"
                ></path>
                <path
                  d="M213.333333 256v85.333333a42.666667 42.666667 0 0 0 85.333334 0V256H213.333333zM170.666667 213.333333h170.666666v128a85.333333 85.333333 0 1 1-170.666666 0V213.333333zM725.333333 256v85.333333a42.666667 42.666667 0 0 0 85.333334 0V256h-85.333334z m-42.666666-42.666667h170.666666v128a85.333333 85.333333 0 1 1-170.666666 0V213.333333z"
                  fill="#f4ea2a"
                ></path>
                <path
                  d="M298.666667 85.333333h426.666666a42.666667 42.666667 0 0 1 42.666667 42.666667v341.333333a256 256 0 1 1-512 0V128a42.666667 42.666667 0 0 1 42.666667-42.666667z"
                  fill="#f2be45"
                ></path>
                <path
                  d="M512 469.333333l-100.309333 52.736 19.157333-111.701333-81.152-79.104 112.128-16.298667L512 213.333333l50.176 101.632 112.128 16.298667-81.152 79.104 19.157333 111.701333z"
                  fill="#FFF2A0"
                ></path>
              </svg>
            </div>

            <div className="relative inline-block">
              <Avatar className="h-20 w-20 border-4 border-yellow-200 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white text-xl">
                  {winner.learner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1 border-2 border-white">
                <Trophy className="h-5 w-5 text-yellow-800" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-yellow-800 mt-4">
              {winner.learner.name}
            </h2>
            <p className="text-yellow-600">
              {getLevelName(winner.level)} {getLevelEmoji(winner.level)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{winner.points}</div>
            <div className="text-xs text-gray-500 mt-1">Points</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{winner.xp}</div>
            <div className="text-xs text-gray-500 mt-1">XP</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{winner.level}</div>
            <div className="text-xs text-gray-500 mt-1">Level</div>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">🏆 Monthly Champion</h3>
          <p className="text-sm text-yellow-700">
            {winner.learner.name} has earned the most points this month!
          </p>
          <p className="text-xs text-yellow-600 mt-2">
            Keep up the great work and aim for the top spot next month!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyWinnerCard;