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
import { Loader2, Users, BookOpen, FileText, Plus, Edit, Trash2, LogOut, ShieldCheck, GraduationCap, Lock, Unlock, Key, Database, Settings, AlertTriangle, CheckCircle, Image as ImageIcon, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import LessonCardWithImage from '@/components/LessonCardWithImage';
import LessonPartsManager from '@/components/LessonPartsManager';

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

interface Organization {
  id: string;
  tier: string;
  stripe_customer_id?: string;
  subscription_status?: string;
}

interface SecurityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

const SuperAdminDashboard: React.FC = () => {
  const { user, session } = useSession();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [isPartsManagerOpen, setIsPartsManagerOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    subject: '',
    age_range: '',
    md_content: '',
    image_url: '',
    parts: 1,
    is_premium: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    requireStrongPasswords: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipRestrictions: false
  });

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

    // Check for the PIN verification flag
    if (!sessionStorage.getItem('super_admin_verified')) {
      navigate('/super-admin-auth');
      return;
    }

    fetchData();
  }, [session, navigate, isAuthorized]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: usersData } = await supabase.from('profiles').select('*');
      setUsers(usersData || []);

      // Fetch all learners
      const { data: learnersData } = await supabase.from('learners').select('*');
      setLearners(learnersData || []);

      // Fetch all lessons - handle missing age_range column
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (lessonsError) {
        // If age_range is missing, try fetching without it
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

      // Fetch all organizations
      const { data: orgsData } = await supabase.from('organizations').select('*');
      setOrganizations(orgsData || []);

      // Fetch security logs - handle missing table
      try {
        const { data: logsData, error: logsError } = await supabase
          .from('security_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (!logsError) {
          setSecurityLogs(logsData || []);
        }
      } catch (e) {
        console.warn('Security logs table not available');
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

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.subject || !newLesson.md_content) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      // Prepare payload, omitting age_range if it's causing issues
      const payload: any = {
        title: newLesson.title,
        subject: newLesson.subject,
        md_content: newLesson.md_content,
        image_url: newLesson.image_url,
        parts: newLesson.parts,
        is_premium: newLesson.is_premium
      };

      const { data, error } = await supabase
        .from('lessons')
        .insert(payload)
        .select()
        .single();

      if (error) {
        // If age_range is required but missing in schema, this might fail
        // We try to include it if the schema supports it
        if (error.message.includes('age_range')) {
          delete payload.age_range;
          const { data: retryData, error: retryError } = await supabase
            .from('lessons')
            .insert(payload)
            .select()
            .single();
          if (retryError) throw retryError;
          setLessons(prev => [retryData, ...prev]);
        } else {
          throw error;
        }
      } else {
        setLessons(prev => [data, ...prev]);
      }

      showSuccess('Lesson added successfully!');
      setIsAddLessonModalOpen(false);
      setNewLesson({ title: '', subject: '', age_range: '', md_content: '', image_url: '', parts: 1, is_premium: false });
    } catch (error: any) {
      showError('Failed to add lesson: ' + error.message);
    }
  };

  const handleEditLesson = async () => {
    if (!editingLesson) return;

    try {
      const payload: any = {
        title: editingLesson.title,
        subject: editingLesson.subject,
        md_content: editingLesson.md_content,
        image_url: editingLesson.image_url,
        parts: editingLesson.parts,
        is_premium: editingLesson.is_premium
      };

      const { data, error } = await supabase
        .from('lessons')
        .update(payload)
        .eq('id', editingLesson.id)
        .select()
        .single();

      if (error) throw error;

      showSuccess('Lesson updated successfully!');
      setLessons(prev => prev.map(l => l.id === data.id ? data : l));
      setIsEditLessonModalOpen(false);
      setEditingLesson(null);
    } catch (error: any) {
      showError('Failed to update lesson: ' + error.message);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure?')) return;
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
            <TabsTrigger value="security">Security</TabsTrigger>
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
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded border">
                  <span className="text-sm font-medium">Age Range Column</span>
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Missing Column</Badge>
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

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Logs</CardTitle>
                <CardDescription>Recent administrative actions</CardDescription>
              </CardHeader>
              <CardContent>
                {securityLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No security logs found. Table may be missing.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {securityLogs.map((log) => (
                      <div key={log.id} className="p-3 border rounded bg-white flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm">{log.action}</p>
                          <p className="text-xs text-slate-500">{log.details}</p>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Lesson Modal */}
      <Dialog open={isAddLessonModalOpen} onOpenChange={setIsAddLessonModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={newLesson.subject} onChange={(e) => setNewLesson({...newLesson, subject: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={newLesson.image_url} onChange={(e) => setNewLesson({...newLesson, image_url: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <Textarea className="min-h-[200px]" value={newLesson.md_content} onChange={(e) => setNewLesson({...newLesson, md_content: e.target.value})} />
            </div>
            <Button onClick={handleAddLesson} className="w-full bg-blue-600">Create Lesson</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Modal */}
      <Dialog open={isEditLessonModalOpen} onOpenChange={setIsEditLessonModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editingLesson.title} onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={editingLesson.subject} onChange={(e) => setEditingLesson({...editingLesson, subject: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content (Markdown)</Label>
                <Textarea className="min-h-[200px]" value={editingLesson.md_content} onChange={(e) => setEditingLesson({...editingLesson, md_content: e.target.value})} />
              </div>
              <Button onClick={handleEditLesson} className="w-full bg-blue-600">Update Lesson</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;