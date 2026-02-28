"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Search, Plus } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Lesson {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  created_at: string;
}

const LessonsPage: React.FC = () => {
  const { user } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLessons = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('org_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showError('Failed to fetch lessons');
    } else {
      setLessons(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLessons();
  }, [user]);

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <CollapsibleSidebar />
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Lessons Library</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Browse and manage all available lessons
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 w-full"
              />
            </div>
            <Button asChild>
              <Link to="/lessons/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Lesson
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => (
                <Card 
                  key={lesson.id} 
                  className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{lesson.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                      {lesson.description}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        lesson.completed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {lesson.completed ? 'Completed' : 'Incomplete'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {Math.round(lesson.progress)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No lessons found. Create your first lesson!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonsPage;