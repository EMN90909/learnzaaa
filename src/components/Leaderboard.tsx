"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  xp: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all learners
      const { data: learners, error: learnersError } = await supabase
        .from('learners')
        .select('id, name');

      if (learnersError) throw learnersError;

      // Fetch points and XP
      const { data: pointsData } = await supabase.from('points_balance').select('*');
      const { data: xpData } = await supabase.from('xp_balance').select('*');

      // Combine data
      const combined = learners.map(learner => {
        const points = pointsData?.find(p => p.learner_id === learner.id)?.points || 0;
        const xp = xpData?.find(x => x.learner_id === learner.id)?.xp || 0;
        return {
          id: learner.id,
          name: learner.name,
          points,
          xp
        };
      });

      // Sort by points descending
      combined.sort((a, b) => b.points - a.points);

      // Add rank
      const ranked = combined.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setLeaderboard(ranked);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Real-time subscription for points updates
    const pointsSubscription = supabase
      .channel('points-updates')
      .on('postgres_changes' as any, { event: '*', table: 'points_balance' }, () => {
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pointsSubscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8">
      <div className="leaderboard-container">
        <div className="leaderboard">
          <h1>🏆 Leaderboard</h1>

          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No learners yet!</p>
          ) : (
            leaderboard.map((player) => (
              <div
                key={player.id}
                className={cn(
                  "player",
                  player.rank === 1 && "gold",
                  player.rank === 2 && "silver",
                  player.rank === 3 && "bronze"
                )}
              >
                <div className="rank">{player.rank}</div>
                <div className="name">{player.name}</div>
                <div className="score-container text-right">
                  <div className="score">{player.points} 💎</div>
                  <div className="text-[10px] opacity-70">{player.xp} XP</div>
                </div>
              </div>
            ))
          )}
        </div>

        <style>{`
          .leaderboard-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
          }

          .leaderboard {
            width: 360px;
            background: #1b2735;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            padding: 20px;
          }

          .leaderboard h1 {
            text-align: center;
            margin-bottom: 20px;
            letter-spacing: 1px;
            font-size: 24px;
            font-weight: bold;
          }

          .player {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 14px;
            margin: 8px 0;
            background: #243447;
            border-radius: 10px;
            transition: 0.2s;
          }

          .player:hover {
            background: #2f4b63;
            transform: scale(1.02);
          }

          .rank {
            font-weight: bold;
            width: 30px;
          }

          .name {
            flex: 1;
            margin-left: 10px;
            font-weight: 500;
          }

          .score {
            font-weight: bold;
            color: #00e5ff;
          }

          .gold { background: linear-gradient(90deg, #ffd700, #ffb300); color: #000; }
          .gold .score { color: #000; }
          
          .silver { background: linear-gradient(90deg, #c0c0c0, #9e9e9e); color: #000; }
          .silver .score { color: #000; }
          
          .bronze { background: linear-gradient(90deg, #cd7f32, #a05a2c); color: #000; }
          .bronze .score { color: #000; }
        `}</style>
      </div>
    </div>
  );
};

export default Leaderboard;