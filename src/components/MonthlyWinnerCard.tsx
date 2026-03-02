"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Loader2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface MonthlyWinner {
  learner: { name: string; id: string };
  points: number;
  xp: number;
  level: number;
  month: string;
}

const MonthlyWinnerCard: React.FC = () => {
  const [winner, setWinner] = useState<MonthlyWinner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinner = async () => {
      try {
        const learnerData = localStorage.getItem('learnerData');
        const currentLearner = learnerData ? JSON.parse(learnerData) : null;
        if (!currentLearner?.org_id) return;

        const { data: learners } = await supabase.from('learners').select('id, name').eq('org_id', currentLearner.org_id);
        if (!learners) return;

        const { data: points } = await supabase.from('points_balance').select('*').in('learner_id', learners.map(l => l.id));
        if (!points) return;

        const sorted = points.sort((a, b) => b.points - a.points);
        if (sorted.length > 0) {
          const top = sorted[0];
          const learner = learners.find(l => l.id === top.learner_id);
          setWinner({
            learner: learner!,
            points: top.points,
            xp: 0,
            level: 1,
            month: new Date().toLocaleString('default', { month: 'long' })
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWinner();
  }, []);

  if (loading) return <Card className="p-4 flex justify-center"><Loader2 className="animate-spin" /></Card>;
  if (!winner) return null;

  return (
    <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 overflow-hidden">
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-bold text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
          <Trophy className="h-4 w-4" /> {winner.month} Winner
        </CardTitle>
        <Calendar className="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent className="p-3 pt-0 text-center">
        <div className="flex items-center justify-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-yellow-400">
            <AvatarFallback className="bg-yellow-500 text-white text-xs">
              {winner.learner.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <h2 className="text-sm font-bold text-yellow-900 dark:text-white">{winner.learner.name}</h2>
            <p className="text-xs text-yellow-700 dark:text-yellow-500">{winner.points} 💎 Points</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyWinnerCard;