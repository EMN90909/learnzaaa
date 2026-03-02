"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, CheckCircle, LogOut, Home } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import LessonCard from '@/components/LessonCard';
import AdUnit from '@/components/AdUnit';

const LearnerDashboard: React.FC = () => {
  const [learner, setLearner] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const learnerData = localStorage.getItem('learnerData');
    if (!learnerData) { navigate('/learner-auth'); return; }
    const parsed = JSON.parse(learnerData);
    setLearner(parsed);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('lessons').select('*');
      setLessons(data || []);
    } catch (e) { showError('Error loading lessons'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-black"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Learnzaaac</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/learner-page')} className="bg-green-600 hover:bg-green-700 text-white">
              <BookOpen className="h-4 w-4 mr-2" /> Start Learning
            </Button>
            <Button variant="ghost" onClick={() => { localStorage.removeItem('learnerData'); navigate('/learner-auth'); }} className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome back, {learner?.name}!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader className="p-4"><CardTitle className="text-sm text-gray-500">Grade</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{learner?.grade}</p></CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          {Array.from({ length: Math.ceil(lessons.length / 6) }).map((_, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.slice(groupIndex * 6, (groupIndex + 1) * 6).map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} onViewDetails={() => navigate('/learner-page')} />
                ))}
              </div>
              <AdUnit type="banner" className="my-8" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;