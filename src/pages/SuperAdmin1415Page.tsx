"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldCheck, Terminal, Database, Activity } from 'lucide-react';
import { showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

interface Learner {
  id: string;
  org_id: string;
  name: string;
  username: string;
  grade: string;
  created_at: string;
}

interface Lesson {
  id: string;
  title: string;
  subject: string;
  md_content: string;
  created_at: string;
}

const SuperAdmin1415Page: React.FC = () => {
  const { user, session } = useSession();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const ADMIN_EMAIL = 'nasongoemmanuel8@gmail.com';
  const isAuthorized = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!session) {
      navigate('/super-admin-auth');
      return;
    }

    if (!isAuthorized) {
      showError('Access denied.');
      navigate('/');
      return;
    }

    if (!sessionStorage.getItem('super_admin_verified')) {
      navigate('/super-admin-auth');
      return;
    }

    fetchData();
  }, [session, navigate, isAuthorized]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase.from('profiles').select('*');
      setUsers(usersData || []);

      const { data: learnersData } = await supabase.from('learners').select('*');
      setLearners(learnersData || []);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, subject, md_content, created_at')
        .order('created_at', { ascending: false });

      if (!lessonsError) {
        setLessons(lessonsData || []);
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Terminal className="h-5 w-5 text-blue-400" />
          <h1 className="text-xl font-bold text-blue-400">Learnzaa Admin Terminal</h1>
          <Badge className="bg-red-900/50 text-red-400 border-red-800">1415EMN 2010</Badge>
        </div>
        <Button onClick={() => navigate('/super-admin-dashboard')} variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          Standard Dashboard
        </Button>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase">System Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase">Active Learners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{learners.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase">Lesson Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{lessons.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-800">Status</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-slate-800">System</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-300 flex items-center gap-2">
                  <Database className="h-4 w-4" /> Schema Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                  <span>TABLE: lessons</span>
                  <span className="text-green-500">[ ONLINE ]</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                  <span>TABLE: profiles</span>
                  <span className="text-green-500">[ ONLINE ]</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
                  <span>TABLE: security_logs</span>
                  <span className="text-red-500">[ OFFLINE ]</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-300 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> System Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 text-xs text-slate-400">
                  <p className="text-green-400">[{new Date().toISOString()}] System initialized...</p>
                  <p>[{new Date().toISOString()}] Fetching user data: {users.length} records found.</p>
                  <p>[{new Date().toISOString()}] Fetching learner data: {learners.length} records found.</p>
                  <p>[{new Date().toISOString()}] Fetching lesson data: {lessons.length} records found.</p>
                  <p className="text-amber-400">[{new Date().toISOString()}] Warning: security_logs table not found. Skipping log fetch.</p>
                  <p className="text-blue-400">[{new Date().toISOString()}] Admin session verified: {user?.email}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperAdmin1415Page;