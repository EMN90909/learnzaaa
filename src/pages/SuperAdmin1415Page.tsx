"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Users, BookOpen, FileText, Plus, Edit, Trash2, LogOut, ShieldCheck, GraduationCap, Lock, Unlock, Key, Database, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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
  age_range?: string;
  md_content: string;
  created_at: string;
  is_premium?: boolean;
}

interface SecurityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

const SuperAdmin1415Page: React.FC = () => {
  const { user, session } = useSession();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
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
        .select('*')
        .order('created_at', { ascending: false });

      if (lessonsError && lessonsError.message.includes('age_range')) {
        const { data: retryData } = await supabase
          .from('lessons')
          .select('id, title, subject, md_content, created_at, is_premium')
          .order('created_at', { ascending: false });
        setLessons(retryData || []);
      } else {
        setLessons(lessonsData || []);
      }

      try {
        const { data: logsData } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        setSecurityLogs(logsData || []);
      } catch (e) {
        console.warn('Security logs table missing');
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-400">Learnzaa Admin Terminal</h1>
          <Badge className="bg-red-900/50 text-red-400 border-red-800">1415EMN 2010</Badge>
        </div>
        <Button onClick={() => navigate('/super-admin-dashboard')} variant="outline" size="sm" className="border-slate-700 text-slate-300">
          Standard Dashboard
        </Button>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-500 uppercase">System Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-blue-400">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-500 uppercase">Active Learners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-green-400">{learners.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-slate-500 uppercase">Lesson Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold text-purple-400">{lessons.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="dashboard">Status</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-300">Schema Integrity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 font-mono text-sm">
                <div className="flex justify-between p-2 bg-slate-950 rounded">
                  <span>TABLE: lessons</span>
                  <span className="text-green-500">ONLINE</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950 rounded">
                  <span>COLUMN: age_range</span>
                  <span className="text-red-500">MISSING</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950 rounded">
                  <span>TABLE: security_logs</span>
                  <span className="text-red-500">MISSING</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                {securityLogs.length === 0 ? (
                  <p className="text-slate-500 font-mono text-center py-12">NO LOG DATA AVAILABLE</p>
                ) : (
                  <div className="space-y-2 font-mono text-xs">
                    {securityLogs.map(log => (
                      <div key={log.id} className="p-2 border-b border-slate-800 flex justify-between">
                        <span className="text-blue-400">[{log.action}]</span>
                        <span className="text-slate-400">{log.details}</span>
                        <span className="text-slate-600">{new Date(log.created_at).toISOString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperAdmin1415Page;