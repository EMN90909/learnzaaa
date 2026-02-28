"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Plus, BookOpen, Star, FileInput, Users } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  org_id?: string;
}

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    if (user) {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        showError('Failed to fetch profile');
      } else {
        setProfile(data);
        if (!data.org_id) {
          await createOrganization(data.id, data.display_name || data.email);
        }
      }
    }
    setLoading(false);
  };

  const fetchLessons = async () => {
    if (!profile?.org_id) return;
    
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, completed, progress')
      .eq('org_id', profile.org_id);

    if (error) {
      showError('Failed to fetch lessons');
    } else {
      setLessons(data || []);
    }
  };

  const createOrganization = async (userId: string, userName: string) => {
    setCreatingOrg(true);
    try {
      const orgName = `${userName}'s Organization`;
      const { error: orgError } = await supabase
        .from('organizations')
        .insert({ id: userId, name: orgName, tier: 'free' });

      if (orgError && !orgError.message.includes('duplicate')) throw orgError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ org_id: userId })
        .eq('id', userId);

      if (profileError) throw profileError;

      setProfile(prev => prev ? { ...prev, org_id: userId } : null);
      showSuccess('Organization ready!');
    } catch (error: any) {
      console.error('Org creation error:', error);
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile || !profile?.org_id) return;
    
    setUploading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').slice(1); // Skip header
      const learners = [];

      for (const line of lines) {
        if (!line.trim()) continue;
        const [name, username, age, classLevel] = line.split(',');
        if (name && username) {
          learners.push({
            name: name.trim(),
            username: username.trim(),
            age: parseInt(age.trim()) || 0,
            class: classLevel?.trim() || '',
            org_id: profile.org_id
          });
        }
      }

      if (learners.length > 0) {
        const { error } = await supabase
          .from('learners')
          .insert(learners);

        if (error) throw error;
        
        showSuccess(`Successfully added ${learners.length} learners!`);
        setCsvFile(null);
      }
    } catch (error: any) {
      showError('Failed to upload learners: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.org_id) {
      fetchLessons();
    }
  }, [profile]);

  const filteredLessons = lessons.filter(lesson => {
    if (filter === 'completed') return lesson.completed;
    if (filter === 'incomplete') return !lesson.completed;
    return true;
  });

  if (loading || creatingOrg) {
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
            <h1 className="text-2xl sm:text-3xl font-bold">
              Lessons Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Track and manage your lessons and learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Lessons Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {lessons.filter(l => l.completed).length}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  of {lessons.length} total
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Lessons Incomplete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {lessons.filter(l => !l.completed).length}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  of {lessons.length} total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold mb-4 sm:mb-0">All Lessons</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                >
                  <option value="all">See All</option>
                  <option value="completed">Completed Only</option>
                  <option value="incomplete">Incomplete Only</option>
                </select>
                <Button asChild>
                  <Link to="/lessons" className="flex items-center gap-2">
                    View All Lessons
                  </Link>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson) => (
                      <tr 
                        key={lesson.id} 
                        className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="py-3 px-4">{lesson.title}</td>
                        <td className="py-3 px-4">
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${lesson.progress}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            lesson.completed 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {lesson.completed ? 'Completed' : 'Incomplete'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        No lessons found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center gap-4">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle>Add Learners in Bulk</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Upload a CSV file with columns: Name, Username, Age, Class
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  disabled={uploading}
                />
                <Button 
                  onClick={handleCsvUpload} 
                  disabled={!csvFile || uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Upload CSV
                    </>
                  )}
                </Button>
              </div>
              {csvFile && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Selected: {csvFile.name}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;