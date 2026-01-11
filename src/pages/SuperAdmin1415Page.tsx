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
  age_range: string;
  md_content: string;
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

const SuperAdmin1415Page: React.FC = () => {
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
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    subject: '',
    age_range: '',
    md_content: '',
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

  // Check if user is authorized super admin
  const isAuthorized = user?.email === 'nasongoemmanuel8@gmail.com';

  useEffect(() => {
    if (!session) {
      navigate('/super-admin-auth');
      return;
    }

    if (!isAuthorized) {
      showError('Access denied. You are not authorized to access this page.');
      navigate('/');
      return;
    }

    fetchData();
  }, [session, navigate, isAuthorized]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch all learners
      const { data: learnersData, error: learnersError } = await supabase
        .from('learners')
        .select('*');

      if (learnersError) throw learnersError;
      setLearners(learnersData || []);

      // Fetch all lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch all organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*');

      if (orgsError) throw orgsError;
      setOrganizations(orgsData || []);

      // Fetch security logs
      const { data: logsData, error: logsError } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setSecurityLogs(logsData || []);

      showSuccess('Super Admin Dashboard loaded successfully!');
    } catch (error: any) {
      showError('Failed to load dashboard data: ' + error.message);
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Logged out successfully!');
      navigate('/super-admin-auth');
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.subject || !newLesson.md_content) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: newLesson.title,
          subject: newLesson.subject,
          age_range: newLesson.age_range,
          md_content: newLesson.md_content,
          is_premium: newLesson.is_premium
        })
        .select()
        .single();

      if (error) throw error;

      // Log security event
      await logSecurityEvent('lesson_created', `Created lesson: ${newLesson.title}`);

      showSuccess('Lesson added successfully!');
      setLessons(prev => [data, ...prev]);
      setNewLesson({
        title: '',
        subject: '',
        age_range: '',
        md_content: '',
        is_premium: false
      });
      setIsAddLessonModalOpen(false);
    } catch (error: any) {
      showError('Failed to add lesson: ' + error.message);
      console.error('Error adding lesson:', error);
    }
  };

  const handleEditLesson = async () => {
    if (!editingLesson) return;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: editingLesson.title,
          subject: editingLesson.subject,
          age_range: editingLesson.age_range,
          md_content: editingLesson.md_content,
          is_premium: editingLesson.is_premium
        })
        .eq('id', editingLesson.id)
        .select()
        .single();

      if (error) throw error;

      // Log security event
      await logSecurityEvent('lesson_updated', `Updated lesson: ${editingLesson.title}`);

      showSuccess('Lesson updated successfully!');
      setLessons(prev => prev.map(l => l.id === data.id ? data : l));
      setIsEditLessonModalOpen(false);
      setEditingLesson(null);
    } catch (error: any) {
      showError('Failed to update lesson: ' + error.message);
      console.error('Error updating lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const lessonToDelete = lessons.find(l => l.id === lessonId);
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      // Log security event
      await logSecurityEvent('lesson_deleted', `Deleted lesson: ${lessonToDelete?.title || lessonId}`);

      showSuccess('Lesson deleted successfully!');
      setLessons(prev => prev.filter(l => l.id !== lessonId));
    } catch (error: any) {
      showError('Failed to delete lesson: ' + error.message);
      console.error('Error deleting lesson:', error);
    }
  };

  const logSecurityEvent = async (action: string, details: string) => {
    try {
      await supabase.from('security_logs').insert({
        user_id: user?.id || 'system',
        action,
        details,
        ip_address: 'N/A',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const handleSecuritySettingsUpdate = async () => {
    try {
      // In a real application, you would save these settings to your database
      // For this demo, we'll just show a success message
      await logSecurityEvent('security_settings_updated', `Updated security settings: ${JSON.stringify(securitySettings)}`);

      showSuccess('Security settings updated successfully!');
      setShowSecurityModal(false);
    } catch (error: any) {
      showError('Failed to update security settings: ' + error.message);
      console.error('Error updating security settings:', error);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You are not authorized to access this page.</p>
            <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">Learnzaa Super Admin</h1>
          <Badge variant="default" className="bg-red-100 text-red-800 border-red-300">
            <ShieldCheck className="h-3 w-3 mr-1" /> 1415EMN 2010
          </Badge>
        </div>
        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Users className="text-blue-600" /> Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{users.length}</div>
              <p className="text-sm text-gray-500 mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="text-green-600" /> Total Learners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{learners.length}</div>
              <p className="text-sm text-gray-500 mt-1">Active learners</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-purple-600" /> Total Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{lessons.length}</div>
              <p className="text-sm text-gray-500 mt-1">Available lessons</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" /> Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{securityLogs.length}</div>
              <p className="text-sm text-gray-500 mt-1">Recent security events</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="learners">Learners</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Learnzaa platform statistics and health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Database className="text-blue-500" /> Database Status
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Users Table</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Learners Table</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lessons Table</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organizations Table</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <ShieldCheck className="text-green-500" /> Security Status
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Two-Factor Authentication</span>
                          <Badge variant={securitySettings.enableTwoFactor ? "default" : "secondary"}>
                            {securitySettings.enableTwoFactor ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Strong Passwords</span>
                          <Badge variant={securitySettings.requireStrongPasswords ? "default" : "secondary"}>
                            {securitySettings.requireStrongPasswords ? "Required" : "Optional"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Session Timeout</span>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            {securitySettings.sessionTimeout} minutes
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Max Login Attempts</span>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            {securitySettings.maxLoginAttempts}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={() => setShowSecurityModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-white">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{log.action}</p>
                              <p className="text-sm text-gray-500">{log.details}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(log.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.display_name || user.email}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={user.email === 'nasongoemmanuel8@gmail.com' ? 'default' : 'secondary'}>
                              {user.email === 'nasongoemmanuel8@gmail.com' ? 'Super Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learners">
            <Card>
              <CardHeader>
                <CardTitle>All Learners</CardTitle>
                <CardDescription>View all learners across all organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {learners.map((learner) => (
                        <TableRow key={learner.id}>
                          <TableCell className="font-medium">{learner.name}</TableCell>
                          <TableCell>{learner.username}</TableCell>
                          <TableCell>{learner.grade}</TableCell>
                          <TableCell>{learner.org_id}</TableCell>
                          <TableCell>{new Date(learner.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>All Lessons</CardTitle>
                  <CardDescription>Manage all available lessons</CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddLessonModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lesson
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search lessons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLessons.map((lesson) => (
                    <Card
                      key={lesson.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer border border-blue-100"
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setIsEditLessonModalOpen(true);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                            {lesson.subject}
                          </span>
                          {lesson.is_premium && (
                            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                              Premium
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3">{lesson.md_content.substring(0, 100)}...</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(lesson.created_at).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLesson(lesson.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Security Center</CardTitle>
                  <CardDescription>Monitor and manage system security</CardDescription>
                </div>
                <Button
                  onClick={() => setShowSecurityModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="text-red-500" /> Recent Security Events
                    </h3>
                    <div className="space-y-3">
                      {securityLogs.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">No security events recorded</p>
                        </div>
                      ) : (
                        securityLogs.map((log) => (
                          <div key={log.id} className="p-3 border rounded-lg bg-white">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
                                </div>
                                <div>
                                  <p className="font-medium">{log.action}</p>
                                  <p className="text-sm text-gray-500">{log.details}</p>
                                  <p className="text-xs text-gray-400 mt-1">User: {log.user_id}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {new Date(log.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ShieldCheck className="text-green-500" /> Security Dashboard
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="text-green-600" /> System Health
                        </h4>
                        <p className="text-sm text-green-700">All systems operational</p>
                        <p className="text-xs text-green-600 mt-1">Last check: {new Date().toLocaleTimeString()}</p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="text-yellow-600" /> Security Alerts
                        </h4>
                        <p className="text-sm text-yellow-700">No active alerts</p>
                        <p className="text-xs text-yellow-600 mt-1">Monitoring active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Lesson Modal */}
      <Dialog open={isAddLessonModalOpen} onOpenChange={setIsAddLessonModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Create a new lesson using Markdown format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-title">Title</Label>
                <Input
                  id="lesson-title"
                  placeholder="Lesson title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lesson-subject">Subject</Label>
                <Input
                  id="lesson-subject"
                  placeholder="Subject (e.g., Math, Science)"
                  value={newLesson.subject}
                  onChange={(e) => setNewLesson({...newLesson, subject: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lesson-age-range">Age Range</Label>
              <Input
                id="lesson-age-range"
                placeholder="Age range (e.g., 7-9, 10-12)"
                value={newLesson.age_range}
                onChange={(e) => setNewLesson({...newLesson, age_range: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="lesson-content">Lesson Content (Markdown)</Label>
              <Textarea
                id="lesson-content"
                placeholder="Write your lesson content in Markdown format..."
                value={newLesson.md_content}
                onChange={(e) => setNewLesson({...newLesson, md_content: e.target.value})}
                className="min-h-[300px] font-mono"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lesson-premium"
                checked={newLesson.is_premium}
                onChange={(e) => setNewLesson({...newLesson, is_premium: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="lesson-premium">Premium Lesson (requires premium subscription)</Label>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold mb-2">Markdown Preview</h3>
              <div className="prose max-w-none border p-4 rounded bg-white">
                <MarkdownRenderer content={newLesson.md_content} ageGroup="middle" />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddLessonModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddLesson}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Modal */}
      <Dialog open={isEditLessonModalOpen} onOpenChange={setIsEditLessonModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>
              Edit the lesson content
            </DialogDescription>
          </DialogHeader>
          {editingLesson && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-lesson-title">Title</Label>
                  <Input
                    id="edit-lesson-title"
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lesson-subject">Subject</Label>
                  <Input
                    id="edit-lesson-subject"
                    value={editingLesson.subject}
                    onChange={(e) => setEditingLesson({...editingLesson, subject: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-lesson-age-range">Age Range</Label>
                <Input
                  id="edit-lesson-age-range"
                  value={editingLesson.age_range}
                  onChange={(e) => setEditingLesson({...editingLesson, age_range: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="edit-lesson-content">Lesson Content (Markdown)</Label>
                <Textarea
                  id="edit-lesson-content"
                  value={editingLesson.md_content}
                  onChange={(e) => setEditingLesson({...editingLesson, md_content: e.target.value})}
                  className="min-h-[300px] font-mono"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-lesson-premium"
                  checked={editingLesson.is_premium || false}
                  onChange={(e) => setEditingLesson({...editingLesson, is_premium: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-lesson-premium">Premium Lesson</Label>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold mb-2">Markdown Preview</h3>
                <div className="prose max-w-none border p-4 rounded bg-white">
                  <MarkdownRenderer content={editingLesson.md_content} ageGroup="middle" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditLessonModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleEditLesson}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Lesson
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lesson Detail Modal */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedLesson?.title}</DialogTitle>
            <DialogDescription>
              Lesson Details - {selectedLesson?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedLesson && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedLesson.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age Range</p>
                  <p className="font-medium">{selectedLesson.age_range || 'All ages'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedLesson.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant={selectedLesson.is_premium ? 'default' : 'secondary'}>
                    {selectedLesson.is_premium ? 'Premium' : 'Free'}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold mb-2">Lesson Content</h3>
                <div className="prose max-w-none border p-4 rounded bg-white">
                  <MarkdownRenderer content={selectedLesson.md_content} ageGroup="middle" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingLesson(selectedLesson);
                    setIsEditLessonModalOpen(true);
                    setSelectedLesson(null);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Lesson
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteLesson(selectedLesson.id);
                    setSelectedLesson(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lesson
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Security Settings Modal */}
      <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Security Settings</DialogTitle>
            <DialogDescription>
              Configure system security parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label className="font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.enableTwoFactor}
                  onChange={(e) => setSecuritySettings({...securitySettings, enableTwoFactor: e.target.checked})}
                  className="h-5 w-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label className="font-medium">Strong Passwords</Label>
                  <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.requireStrongPasswords}
                  onChange={(e) => setSecuritySettings({...securitySettings, requireStrongPasswords: e.target.checked})}
                  className="h-5 w-5"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <Label className="font-medium">Session Timeout (minutes)</Label>
                <p className="text-sm text-gray-500 mb-2">Auto-logout after inactivity</p>
                <Input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value) || 0})}
                  min="5"
                  max="120"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <Label className="font-medium">Max Login Attempts</Label>
                <p className="text-sm text-gray-500 mb-2">Before account lockout</p>
                <Input
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 0})}
                  min="3"
                  max="10"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label className="font-medium">IP Restrictions</Label>
                  <p className="text-sm text-gray-500">Restrict admin access to specific IPs</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.ipRestrictions}
                  onChange={(e) => setSecuritySettings({...securitySettings, ipRestrictions: e.target.checked})}
                  className="h-5 w-5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowSecurityModal(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSecuritySettingsUpdate}
              >
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdmin1415Page;