"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Star, Award, Loader2 } from 'lucide-react';
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

interface LeaderboardEntry {
  learner: Learner;
  points: number;
  xp: number;
  level: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'month' | 'all-time'>('month');
  const [currentLearnerId, setCurrentLearnerId] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Get current learner ID if logged in
      const learnerData = localStorage.getItem('learnerData');
      const currentLearner = learnerData ? JSON.parse(learnerData) : null;
      setCurrentLearnerId(currentLearner?.id || null);

      // Get organization ID from current learner
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
      const combinedData: LeaderboardEntry[] = learnersData.map((learner, index) => {
        const pointsBalance = pointsData.find(p => p.learner_id === learner.id);
        const xpBalance = xpData.find(x => x.learner_id === learner.id);

        // Calculate level from XP
        const level = calculateLevel(xpBalance?.xp || 0);

        return {
          learner,
          points: pointsBalance?.points || 0,
          xp: xpBalance?.xp || 0,
          level,
          rank: index + 1
        };
      });

      // Sort by points (descending)
      combinedData.sort((a, b) => b.points - a.points);

      // Update ranks
      const rankedData = combinedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setLeaderboard(rankedData);
    } catch (error: any) {
      showError('Failed to fetch leaderboard: ' + error.message);
      console.error('Error fetching leaderboard:', error);
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

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Star className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-orange-500" />;
      default: return <span className="text-gray-500">{rank}</span>;
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timePeriod]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" /> Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
        </CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimePeriod('month')}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              timePeriod === 'month' ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            This Month
          </button>
          <button
            onClick={() => setTimePeriod('all-time')}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              timePeriod === 'all-time' ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            All Time
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No learners found</p>
              <p className="text-sm mt-2">Complete lessons and quizzes to appear on the leaderboard!</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div className="flex justify-center items-end gap-4 mb-6">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.learner.id}
                    className={cn(
                      "flex flex-col items-center text-center",
                      index === 1 ? "translate-y-4" : "",
                      index === 2 ? "translate-y-8" : ""
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {entry.learner.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                          <Trophy className="h-4 w-4 text-yellow-800" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 font-bold text-lg">
                      {entry.learner.name.split(' ')[0]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.points} 💎
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Leaderboard */}
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.learner.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      entry.learner.id === currentLearnerId
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center font-bold">
                        {getMedal(entry.rank)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {entry.learner.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{entry.learner.name}</div>
                          <div className="text-xs text-gray-500">
                            {getLevelName(entry.level)} {getLevelEmoji(entry.level)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">{entry.points} 💎</div>
                        <div className="text-xs text-gray-500">{entry.xp} ⚡</div>
                      </div>
                      {entry.learner.id === currentLearnerId && (
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;