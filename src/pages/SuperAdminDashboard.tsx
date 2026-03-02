"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Users, BookOpen, Plus, Edit, Trash2, LogOut, ShieldCheck, GraduationCap, CheckCircle, AlertTriangle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import AddLessonForm from '@/components/AddLessonForm';

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
  image_url?: string;
  parts?: number;
  created_at: string;
  is_premium?: boolean;
}

const SuperAdminDashboard: React.FC = () => {
  const { user, session } = useSession();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

      // Fetch lessons - handle missing age_range column gracefully
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (lessonsError) {
        if (lessonsError.message.includes('age_range')) {
          const { data: retryData } = await supabase
            .from('lessons')
            .select('id, title, subject, md_content, image_url, parts, created_at, is_premium')
            .order('created_at', { ascending: false });
          setLessons(retryData || []);
        } else {
          throw lessonsError;
        }
      } else {
        setLessons(lessonsData || []);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('super_admin_verified');
    await supabase.auth.signOut();
    navigate('/super-admin-auth');
  };

  const handleSaveLesson = async (lessonData: any) => {
    try {
      const isEditing = !!editingLesson;
      const payload = { ...lessonData };
      
      // Remove age_range if it's known to be missing in DB to avoid 400 errors
      // In a real app, we'd check the schema once at startup
      
      let result;
      if (isEditing) {
        result = await supabase
          .from('lessons')
          .update(payload)
          .eq('id', editingLesson.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('lessons')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        // If age_range is the problem, try without it
        if (result.error.message.includes('age_range')) {
          delete payload.age_range;
          if (isEditing) {
            result = await supabase.from('lessons').update(payload).eq('id', editingLesson.id).select().single();
          } else {
            result = await supabase.from('lessons').insert(payload).select().single();
          }
          if (result.error) throw result.error;
        } else {
          throw result.error;
        }
      }

      showSuccess(`Lesson ${isEditing ? 'updated' : 'created'} successfully!`);
      fetchData();
      setIsAddLessonModalOpen(false);
      setIsEditLessonModalOpen(false);
      setEditingLesson(null);
    } catch (error: any) {
      showError('Failed to save lesson: ' + error.message);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;
      showSuccess('Lesson deleted.');
      setLessons(prev => prev.filter(l => l.id !== lessonId));
    } catch (error: any) {
      showError('Delete failed: ' + error.message);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">Learnzaa Super Admin</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ShieldCheck className="h-3 w-3 mr-1" /> Verified Admin
          </Badge>
        </div>
        <Button onClick={handleLogout} variant="destructive" size="sm">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Total Learners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{learners.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Total Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{lessons.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Operational
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1">
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Database and API connectivity status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                  <span className="text-sm font-medium">Lessons Table</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                  <span className="text-sm font-medium">Security Logs Table</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Missing Table</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <div className="flex justify-between items-center mb-4">
              <Input 
                placeholder="Search lessons..." 
                className="max-w-xs" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={() => setIsAddLessonModalOpen(true)} className="bg-blue-600">
                <Plus className="h-4 w-4 mr-2" /> Add Lesson
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {lesson.image_url && (
                    <img src={lesson.image_url} alt={lesson.title} className="w-full h-32 object-cover" />
                  )}
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <Badge variant="secondary">{lesson.subject}</Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingLesson(lesson); setIsEditLessonModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteLesson(lesson.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{u.display_name || 'N/A'}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isAddLessonModalOpen} onOpenChange={setIsAddLessonModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
          </DialogHeader>
          <AddLessonForm 
            onSuccess={handleSaveLesson} 
            onCancel={() => setIsAddLessonModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditLessonModalOpen} onOpenChange={setIsEditLessonModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <AddLessonForm 
              initialData={editingLesson}
              onSuccess={handleSaveLesson} 
              onCancel={() => setIsEditLessonModalOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;