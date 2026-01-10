import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Users, BarChart2, Clock, CheckCircle, User as UserIcon } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
  category: string;
  level: string;
}

interface ProgressData {
  id: string;
  learner_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  updated_at: string;
}

const LearnersDashboard: React.FC = () => {
  const { user } = useSession();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Fetch profile to get org_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const orgId = profileData?.org_id;
      if (!orgId) {
        showError('Organization ID not found for this user');
        setLoading(false);
        return;
      }

      // Fetch learners
      const { data: learnersData, error: learnersError } = await supabase
        .from('learners')
        .select('*')
        .eq('org_id', orgId);

      if (learnersError) throw learnersError;
      setLearners(learnersData || []);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch progress data
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .in('learner_id', learnersData?.map(l => l.id) || []);

      if (progressError) throw progressError;
      setProgressData(progressData || []);

      showSuccess('Dashboard data loaded successfully!');
    } catch (error: any) {
      showError('Failed to load dashboard data: ' + error.message);
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Calculate statistics
  const totalLearners = learners.length;
  const totalLessons = lessons.length;

  const completedLessons = progressData.filter(p => p.completed).length;
  const completionRate = totalLessons > 0 ? (completedLessons / (totalLessons * totalLearners)) * 100 : 0;

  const averageScore = progressData.length > 0
    ? (progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <CollapsibleSidebar />
      <main className="flex-1 p-4 overflow-auto">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Learners Dashboard</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalLearners}</div>
                    <p className="text-xs text-muted-foreground">Active learners in your organization</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalLessons}</div>
                    <p className="text-xs text-muted-foreground">Available learning materials</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                    <Progress value={completionRate} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">Overall lesson completion</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{averageScore}%</div>
                    <p className="text-xs text-muted-foreground">Average learner performance</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {progressData.length === 0 ? (
                      <p className="text-center text-gray-500">No recent activity</p>
                    ) : (
                      <div className="space-y-4">
                        {progressData.slice(0, 5).map((progress) => {
                          const learner = learners.find(l => l.id === progress.learner_id);
                          const lesson = lessons.find(l => l.id === progress.lesson_id);
                          return (
                            <div key={progress.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                                </div>
                                <div>
                                  <p className="font-medium">{learner?.name}</p>
                                  <p className="text-sm text-muted-foreground">{lesson?.title}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={progress.completed ? "default" : "secondary"}>
                                  {progress.completed ? "Completed" : "In Progress"}
                                </Badge>
                                {progress.score && (
                                  <p className="text-sm mt-1">{progress.score}%</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Learner Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {learners.length === 0 ? (
                        <p className="text-center text-gray-500">No learners found</p>
                      ) : (
                        learners.map((learner) => (
                          <div key={learner.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-green-600 dark:text-green-300" />
                              </div>
                              <div>
                                <p className="font-medium">{learner.name}</p>
                                <p className="text-sm text-muted-foreground">{learner.grade}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">Joined: {new Date(learner.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  {learners.length === 0 ? (
                    <p className="text-center text-gray-500">No learners to display</p>
                  ) : (
                    <div className="space-y-6">
                      {learners.map((learner) => {
                        const learnerProgress = progressData.filter(p => p.learner_id === learner.id);
                        const completedCount = learnerProgress.filter(p => p.completed).length;
                        const learnerCompletionRate = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

                        return (
                          <div key={learner.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <h3 className="font-semibold">{learner.name}</h3>
                                <p className="text-sm text-muted-foreground">{learner.grade}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">Completed: {completedCount}/{totalLessons}</p>
                                <p className="text-sm">{learnerCompletionRate.toFixed(1)}%</p>
                              </div>
                            </div>
                            <Progress value={learnerCompletionRate} className="mb-3" />
                            <div className="flex flex-wrap gap-2">
                              {learnerProgress.slice(0, 3).map((progress) => {
                                const lesson = lessons.find(l => l.id === progress.lesson_id);
                                return (
                                  <Badge key={progress.id} variant={progress.completed ? "default" : "outline"}>
                                    {lesson?.title || 'Unknown Lesson'}
                                  </Badge>
                                );
                              })}
                              {learnerProgress.length > 3 && (
                                <Badge variant="secondary">+{learnerProgress.length - 3} more</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {progressData.length === 0 ? (
                    <p className="text-center text-gray-500">No performance data available</p>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-4">Top Performers</h3>
                      <div className="space-y-3">
                        {[...progressData]
                          .sort((a, b) => (b.score || 0) - (a.score || 0))
                          .slice(0, 5)
                          .map((progress, index) => {
                            const learner = learners.find(l => l.id === progress.learner_id);
                            const lesson = lessons.find(l => l.id === progress.lesson_id);
                            return (
                              <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">{index + 1}</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{learner?.name}</p>
                                    <p className="text-sm text-muted-foreground">{lesson?.title}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold">{progress.score}%</p>
                                  <Badge variant={progress.score && progress.score >= 80 ? "default" : "secondary"}>
                                    {progress.score && progress.score >= 80 ? "Excellent" : "Good"}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Learning Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {progressData.length === 0 ? (
                    <p className="text-center text-gray-500">No recent activity to display</p>
                  ) : (
                    <div className="space-y-4">
                      {[...progressData]
                        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                        .map((progress) => {
                          const learner = learners.find(l => l.id === progress.learner_id);
                          const lesson = lessons.find(l => l.id === progress.lesson_id);
                          return (
                            <div key={progress.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{learner?.name}</p>
                                    <p className="text-sm text-muted-foreground">{lesson?.title}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant={progress.completed ? "default" : "outline"}>
                                      {progress.completed ? "Completed" : "In Progress"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(progress.updated_at).toLocaleString()}
                                    </span>
                                  </div>
                                  {progress.score && (
                                    <div className="flex items-center space-x-2">
                                      <BarChart2 className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs font-medium">{progress.score}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default LearnersDashboard;