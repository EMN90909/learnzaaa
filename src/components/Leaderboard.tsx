"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: learners } = await supabase.from('learners').select('id, name');
        const { data: points } = await supabase.from('points_balance').select('*');
        if (!learners || !points) return;

        const combined = learners.map(l => ({
          id: l.id,
          name: l.name,
          points: points.find(p => p.learner_id === l.id)?.points || 0
        })).sort((a, b) => b.points - a.points).map((e, i) => ({ ...e, rank: i + 1 }));

        setLeaderboard(combined.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 dark:bg-black rounded-xl p-4 shadow-lg border border-slate-800">
      <h3 className="text-center text-white font-bold mb-3 text-sm">🏆 Top Learners</h3>
      <div className="space-y-2">
        {leaderboard.map((player) => (
          <div key={player.id} className={cn(
            "flex items-center justify-between p-2 rounded-lg text-xs",
            player.rank === 1 ? "bg-yellow-500/20 text-yellow-500" : "bg-slate-800 text-slate-300"
          )}>
            <div className="flex items-center gap-2">
              <span className="font-bold w-4">{player.rank}</span>
              <span className="truncate max-w-[100px]">{player.name}</span>
            </div>
            <span className="font-bold">{player.points} 💎</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;