import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, CheckCircle, Clock, BarChart2, LogOut } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LessonCard from '@/components/LessonCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Learner {
  id: string;
  name: string;
  username: string;
  grade: string;
  org_id: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  level: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ProgressData {
  id: string;
  learner_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  updated_at: string;
}

const LearnerDashboard: React.FC = () => {
  const [learner, setLearner] = useState<Learner | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if learner is logged in
    const learnerData = localStorage.getItem('learnerData');
    if (!learnerData) {
      showError('Please login first');
      navigate('/learner-auth');
      return;
    }

    const parsedLearner = JSON.parse(learnerData);
    setLearner(parsedLearner);
    fetchData(parsedLearner.id);
  }, [navigate]);

  const fetchData = async (learnerId: string) => {
    setLoading(true);
    try {
      // Fetch all lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Fetch progress for this learner
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('learner_id', learnerId);

      if (progressError) throw progressError;
      setProgressData(progressData || []);

      showSuccess('Dashboard loaded successfully!');
    } catch (error: any) {
      showError('Failed to load dashboard: ' + error.message);
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('learnerData');
    showSuccess('Logged out successfully!');
    navigate('/learner-auth');
  };

  const handleViewDetails = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setIsModalOpen(true);
    }
  };

  const getLessonProgress = (lessonId: string) => {
    return progressData.find(p => p.lesson_id === lessonId);
  };

  const completedLessons = progressData.filter(p => p.completed).length;
  const totalLessons = lessons.length;
  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

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

  if (!learner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-600">Please login to access your dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">LearnZaa</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              Welcome, {learner.name} ({learner.grade})
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-red-500 hover:text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedLessons}</div>
              <Progress value={completionRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">{completionRate.toFixed(1)}% completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">Your average performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="lessons">My Lessons</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Available Lessons</h2>

              {lessons.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No lessons available yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons.map((lesson) => {
                    const progress = getLessonProgress(lesson.id);
                    return (
                      <div key={lesson.id} className="space-y-2">
                        <LessonCard lesson={lesson} onViewDetails={handleViewDetails} />
                        {progress && (
                          <div className="flex items-center gap-2">
                            <Badge variant={progress.completed ? "default" : "secondary"}>
                              {progress.completed ? "Completed" : "In Progress"}
                            </Badge>
                            {progress.score && (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Score: {progress.score}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">My Learning Progress</h2>

              {progressData.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">
                  You haven't started any lessons yet. Explore lessons to begin your learning journey!
                </p>
              ) : (
                <div className="space-y-4">
                  {progressData.map((progress) => {
                    const lesson = lessons.find(l => l.id === progress.lesson_id);
                    if (!lesson) return null;

                    return (
                      <Card key={progress.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          <CardDescription>{lesson.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge variant={progress.completed ? "default" : "secondary"} className="mt-1">
                                {progress.completed ? "Completed" : "In Progress"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Score</p>
                              <p className="text-2xl font-bold mt-1">{progress.score}%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Last Updated</p>
                              <p className="text-sm mt-1">
                                {new Date(progress.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Progress
                            value={progress.completed ? 100 : (progress.score || 0)}
                            className="mt-4"
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Recent Activity</h2>

              {progressData.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">
                  No recent activity. Start learning to see your progress here!
                </p>
              ) : (
                <div className="space-y-4">
                  {[...progressData]
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .map((progress) => {
                      const lesson = lessons.find(l => l.id === progress.lesson_id);
                      if (!lesson) return null;

                      return (
                        <Card key={progress.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{lesson.title}</h3>
                                    <p className="text-sm text-muted-foreground">{lesson.category}</p>
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
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Lesson Detail Modal */}
        {selectedLesson && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{selectedLesson.title}</DialogTitle>
                <DialogDescription>{selectedLesson.description}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-grow pr-4">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{selectedLesson.content}</p>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;