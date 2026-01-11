import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Users, BarChart2, Clock, CheckCircle, User as UserIcon } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Learner {
  id: string;
  org_id: string;
  name: string;
  username: string;
  grade: string;
  dob: string;
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
  const [ageGroup, setAgeGroup] = useState<'young' | 'middle' | 'older'>('middle');

  const calculateAgeGroup = (dob: string): 'young' | 'middle' | 'older' => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 7 && age <= 9) return 'young';
    if (age >= 10 && age <= 12) return 'middle';
    return 'older';
  };

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

      // Determine age group from first learner if available
      if (learnersData && learnersData.length > 0) {
        const group = calculateAgeGroup(learnersData[0].dob);
        setAgeGroup(group);
      }

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

  // Get age group specific styles
  const getAgeGroupStyles = () => {
    switch (ageGroup) {
      case 'young':
        return {
          primaryColor: 'bg-yellow-400',
          secondaryColor: 'bg-orange-400',
          accentColor: 'bg-pink-400',
          textColor: 'text-yellow-600',
          cardBg: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          fontFamily: 'font-sans',
          buttonStyle: 'btn-31',
          loadingAnimation: 'hamster'
        };
      case 'middle':
        return {
          primaryColor: 'bg-blue-400',
          secondaryColor: 'bg-green-400',
          accentColor: 'bg-purple-400',
          textColor: 'text-blue-600',
          cardBg: 'bg-blue-50',
          borderColor: 'border-blue-200',
          fontFamily: 'font-sans',
          buttonStyle: 'btn-31',
          loadingAnimation: 'car'
        };
      case 'older':
        return {
          primaryColor: 'bg-indigo-400',
          secondaryColor: 'bg-teal-400',
          accentColor: 'bg-pink-400',
          textColor: 'text-indigo-600',
          cardBg: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          fontFamily: 'font-sans',
          buttonStyle: 'btn-31',
          loadingAnimation: 'spinner'
        };
    }
  };

  const styles = getAgeGroupStyles();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {ageGroup === 'young' && (
          <div className="wheel-and-hamster">
            <div className="wheel"></div>
            <div className="hamster">
              <div className="hamster__body">
                <div className="hamster__head">
                  <div className="hamster__ear"></div>
                  <div className="hamster__eye"></div>
                  <div className="hamster__nose"></div>
                </div>
                <div className="hamster__limb hamster__limb--fr"></div>
                <div className="hamster__limb hamster__limb--fl"></div>
                <div className="hamster__limb hamster__limb--br"></div>
                <div className="hamster__limb hamster__limb--bl"></div>
                <div className="hamster__tail"></div>
              </div>
            </div>
            <div className="spoke"></div>
          </div>
        )}

        {ageGroup === 'middle' && (
          <div className="loader">
            <span><span></span><span></span><span></span><span></span></span>
            <div className="base">
              <span></span>
              <div className="face"></div>
            </div>
          </div>
        )}

        {ageGroup === 'older' && (
          <div className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Custom Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Learnzaa</h1>
            <span className="text-sm bg-white text-blue-600 px-2 py-1 rounded-full">Admin Dashboard</span>
          </div>
          <div className="flex space-x-4">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Admin Login
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">
              Learner Login
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Learners Dashboard
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 max-w-md bg-white/50 backdrop-blur-sm rounded-full">
            <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-full">Progress</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-full">Performance</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-full">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLearners}</div>
                  <p className="text-xs text-muted-foreground">Active learners in your organization</p>
                </CardContent>
              </Card>

              <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLessons}</div>
                  <p className="text-xs text-muted-foreground">Available learning materials</p>
                </CardContent>
              </Card>

              <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
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

              <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
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
              <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
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

              <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
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
            <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
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
                        <div key={learner.id} className="border rounded-lg p-4 bg-white/50 backdrop-blur-sm">
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
            <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
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
                            <div key={progress.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/50 backdrop-blur-sm">
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
            <Card className={`border-2 ${styles.borderColor} ${styles.cardBg}`}>
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
                          <div key={progress.id} className="flex items-start space-x-4 p-3 border rounded-lg bg-white/50 backdrop-blur-sm">
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
      </main>

      {/* Add CSS for loading animations */}
      <style>{`
        /* Hamster Loading Animation for Young (7-9) */
        .wheel-and-hamster {
          --dur: 1s;
          position: relative;
          width: 12em;
          height: 12em;
          font-size: 14px;
        }

        .wheel,
        .hamster,
        .hamster div,
        .spoke {
          position: absolute;
        }

        .wheel,
        .spoke {
          border-radius: 50%;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .wheel {
          background: radial-gradient(100% 100% at center,hsla(0,0%,60%,0) 47.8%,hsl(0,0%,60%) 48%);
          z-index: 2;
        }

        .hamster {
          animation: hamster var(--dur) ease-in-out infinite;
          top: 50%;
          left: calc(50% - 3.5em);
          width: 7em;
          height: 3.75em;
          transform: rotate(4deg) translate(-0.8em,1.85em);
          transform-origin: 50% 0;
          z-index: 1;
        }

        .hamster__head {
          animation: hamsterHead var(--dur) ease-in-out infinite;
          background: hsl(30,90%,55%);
          border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
          box-shadow: 0 -0.25em 0 hsl(30,90%,80%) inset,
                      0.75em -1.55em 0 hsl(30,90%,90%) inset;
          top: 0;
          left: -2em;
          width: 2.75em;
          height: 2.5em;
          transform-origin: 100% 50%;
        }

        .hamster__ear {
          animation: hamsterEar var(--dur) ease-in-out infinite;
          background: hsl(0,90%,85%);
          border-radius: 50%;
          box-shadow: -0.25em 0 hsl(30,90%,55%) inset;
          top: -0.25em;
          right: -0.25em;
          width: 0.75em;
          height: 0.75em;
          transform-origin: 50% 75%;
        }

        .hamster__eye {
          animation: hamsterEye var(--dur) linear infinite;
          background-color: hsl(0,0%,0%);
          border-radius: 50%;
          top: 0.375em;
          left: 1.25em;
          width: 0.5em;
          height: 0.5em;
        }

        .hamster__nose {
          background: hsl(0,90%,75%);
          border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
          top: 0.75em;
          left: 0;
          width: 0.2em;
          height: 0.25em;
        }

        .hamster__body {
          animation: hamsterBody var(--dur) ease-in-out infinite;
          background: hsl(30,90%,90%);
          border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
          box-shadow: 0.1em 0.75em 0 hsl(30,90%,55%) inset,
                      0.15em -0.5em 0 hsl(30,90%,80%) inset;
          top: 0.25em;
          left: 2em;
          width: 4.5em;
          height: 3em;
          transform-origin: 17% 50%;
          transform-style: preserve-3d;
        }

        .hamster__limb--fr,
        .hamster__limb--fl {
          clip-path: polygon(0 0,100% 0,70% 80%,60% 100%,0% 100%,40% 80%);
          top: 2em;
          left: 0.5em;
          width: 1em;
          height: 1.5em;
          transform-origin: 50% 0;
        }

        .hamster__limb--fr {
          animation: hamsterFRLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,80%) 80%,hsl(0,90%,75%) 80%);
          transform: rotate(15deg) translateZ(-1px);
        }

        .hamster__limb--fl {
          animation: hamsterFLLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,90%) 80%,hsl(0,90%,85%) 80%);
          transform: rotate(15deg);
        }

        .hamster__limb--br,
        .hamster__limb--bl {
          border-radius: 0.75em 0.75em 0 0;
          clip-path: polygon(0 0,100% 0,100% 30%,70% 90%,70% 100%,30% 100%,40% 90%,0% 30%);
          top: 1em;
          left: 2.8em;
          width: 1.5em;
          height: 2.5em;
          transform-origin: 50% 30%;
        }

        .hamster__limb--br {
          animation: hamsterBRLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,80%) 90%,hsl(0,90%,75%) 90%);
          transform: rotate(-25deg) translateZ(-1px);
        }

        .hamster__limb--bl {
          animation: hamsterBLLimb var(--dur) linear infinite;
          background: linear-gradient(hsl(30,90%,90%) 90%,hsl(0,90%,85%) 90%);
          transform: rotate(-25deg);
        }

        .hamster__tail {
          animation: hamsterTail var(--dur) linear infinite;
          background: hsl(0,90%,85%);
          border-radius: 0.25em 50% 50% 0.25em;
          box-shadow: 0 -0.2em 0 hsl(0,90%,75%) inset;
          top: 1.5em;
          right: -0.5em;
          width: 1em;
          height: 0.5em;
          transform: rotate(30deg) translateZ(-1px);
          transform-origin: 0.25em 0.25em;
        }

        .spoke {
          animation: spoke var(--dur) linear infinite;
          background: radial-gradient(100% 100% at center,hsl(0,0%,60%) 4.8%,hsla(0,0%,60%,0) 5%),
                      linear-gradient(hsla(0,0%,55%,0) 46.9%,hsl(0,0%,65%) 47% 52.9%,hsla(0,0%,65%,0) 53%) 50% 50% / 99% 99% no-repeat;
        }

        /* Animations */
        @keyframes hamster {
          from, to {
            transform: rotate(4deg) translate(-0.8em,1.85em);
          }

          50% {
            transform: rotate(0) translate(-0.8em,1.85em);
          }
        }

        @keyframes hamsterHead {
          from, 25%, 50%, 75%, to {
            transform: rotate(0);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(8deg);
          }
        }

        @keyframes hamsterEye {
          from, 90%, to {
            transform: scaleY(1);
          }

          95% {
            transform: scaleY(0);
          }
        }

        @keyframes hamsterEar {
          from, 25%, 50%, 75%, to {
            transform: rotate(0);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(12deg);
          }
        }

        @keyframes hamsterBody {
          from, 25%, 50%, 75%, to {
            transform: rotate(0);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(-2deg);
          }
        }

        @keyframes hamsterFRLimb {
          from, 25%, 50%, 75%, to {
            transform: rotate(50deg) translateZ(-1px);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(-30deg) translateZ(-1px);
          }
        }

        @keyframes hamsterFLLimb {
          from, 25%, 50%, 75%, to {
            transform: rotate(-30deg);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(50deg);
          }
        }

        @keyframes hamsterBRLimb {
          from, 25%, 50%, 75%, to {
            transform: rotate(-60deg) translateZ(-1px);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(20deg) translateZ(-1px);
          }
        }

        @keyframes hamsterBLLimb {
          from, 25%, 50%, 75%, to {
            transform: rotate(20deg);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(-60deg);
          }
        }

        @keyframes hamsterTail {
          from, 25%, 50%, 75%, to {
            transform: rotate(30deg) translateZ(-1px);
          }

          12.5%, 37.5%, 62.5%, 87.5% {
            transform: rotate(10deg) translateZ(-1px);
          }
        }

        @keyframes spoke {
          from {
            transform: rotate(0);
          }

          to {
            transform: rotate(-1turn);
          }
        }

        /* Car Loading Animation for Middle (10-12) */
        .loader {
          position: relative;
          width: 100px;
          height: 50px;
        }

        .loader > span {
          height: 5px;
          width: 35px;
          background: #000;
          position: absolute;
          top: -19px;
          left: 60px;
          border-radius: 2px 10px 1px 0;
        }

        .base span {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-right: 100px solid #000;
          border-bottom: 6px solid transparent;
        }

        .base span:before {
          content: "";
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #000;
          position: absolute;
          right: -110px;
          top: -16px;
        }

        .base span:after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-top: 0 solid transparent;
          border-right: 55px solid #000;
          border-bottom: 16px solid transparent;
          top: -16px;
          right: -98px;
        }

        .face {
          position: absolute;
          height: 12px;
          width: 20px;
          background: #000;
          border-radius: 20px 20px 0 0;
          transform: rotate(-40deg);
          right: -125px;
          top: -15px;
        }

        .face:after {
          content: "";
          height: 12px;
          width: 12px;
          background: #000;
          right: 4px;
          top: 7px;
          position: absolute;
          transform: rotate(40deg);
          transform-origin: 50% 50%;
          border-radius: 0 0 0 2px;
        }

        .loader > span > span:nth-child(1),
        .loader > span > span:nth-child(2),
        .loader > span > span:nth-child(3),
        .loader > span > span:nth-child(4) {
          width: 30px;
          height: 1px;
          background: #000;
          position: absolute;
          animation: fazer1 0.2s linear infinite;
        }

        .loader > span > span:nth-child(2) {
          top: 3px;
          animation: fazer2 0.4s linear infinite;
        }

        .loader > span > span:nth-child(3) {
          top: 1px;
          animation: fazer3 0.4s linear infinite;
          animation-delay: -1s;
        }

        .loader > span > span:nth-child(4) {
          top: 4px;
          animation: fazer4 1s linear infinite;
          animation-delay: -1s;
        }

        @keyframes fazer1 {
          0% {
            left: 0;
          }
          100% {
            left: -80px;
            opacity: 0;
          }
        }

        @keyframes fazer2 {
          0% {
            left: 0;
          }
          100% {
            left: -100px;
            opacity: 0;
          }
        }

        @keyframes fazer3 {
          0% {
            left: 0;
          }
          100% {
            left: -50px;
            opacity: 0;
          }
        }

        @keyframes fazer4 {
          0% {
            left: 0;
          }
          100% {
            left: -150px;
            opacity: 0;
          }
        }

        @keyframes speeder {
          0% {
            transform: translate(2px, 1px) rotate(0deg);
          }
          10% {
            transform: translate(-1px, -3px) rotate(-1deg);
          }
          20% {
            transform: translate(-2px, 0px) rotate(1deg);
          }
          30% {
            transform: translate(1px, 2px) rotate(0deg);
          }
          40% {
            transform: translate(1px, -1px) rotate(1deg);
          }
          50% {
            transform: translate(-1px, 3px) rotate(-1deg);
          }
          60% {
            transform: translate(-1px, 1px) rotate(0deg);
          }
          70% {
            transform: translate(3px, 1px) rotate(-1deg);
          }
          80% {
            transform: translate(-2px, -1px) rotate(1deg);
          }
          90% {
            transform: translate(2px, 1px) rotate(0deg);
          }
          100% {
            transform: translate(1px, -2px) rotate(-1deg);
          }
        }

        /* Spinner Loading Animation for Older (13-15) */
        .spinner {
          position: relative;
          width: 9px;
          height: 9px;
        }

        .spinner div {
          position: absolute;
          width: 50%;
          height: 150%;
          background: #000000;
          transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%));
          animation: spinner-fzua35 1s calc(var(--delay) * 1s) infinite ease;
        }

        .spinner div:nth-child(1) {
          --delay: 0.1;
          --rotation: 36;
          --translation: 150;
        }

        .spinner div:nth-child(2) {
          --delay: 0.2;
          --rotation: 72;
          --translation: 150;
        }

        .spinner div:nth-child(3) {
          --delay: 0.3;
          --rotation: 108;
          --translation: 150;
        }

        .spinner div:nth-child(4) {
          --delay: 0.4;
          --rotation: 144;
          --translation: 150;
        }

        .spinner div:nth-child(5) {
          --delay: 0.5;
          --rotation: 180;
          --translation: 150;
        }

        .spinner div:nth-child(6) {
          --delay: 0.6;
          --rotation: 216;
          --translation: 150;
        }

        .spinner div:nth-child(7) {
          --delay: 0.7;
          --rotation: 252;
          --translation: 150;
        }

        .spinner div:nth-child(8) {
          --delay: 0.8;
          --rotation: 288;
          --translation: 150;
        }

        .spinner div:nth-child(9) {
          --delay: 0.9;
          --rotation: 324;
          --translation: 150;
        }

        .spinner div:nth-child(10) {
          --delay: 1;
          --rotation: 360;
          --translation: 150;
        }

        @keyframes spinner-fzua35 {
          0%, 10%, 20%, 30%, 50%, 60%, 70%, 80%, 90%, 100% {
            transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%));
          }

          50% {
            transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1.5%));
          }
        }

        /* Button Styles */
        .btn-31,
        .btn-31 *,
        .btn-31 :after,
        .btn-31 :before,
        .btn-31:after,
        .btn-31:before {
          border: 0 solid;
          box-sizing: border-box;
        }

        .btn-31 {
          -webkit-tap-highlight-color: transparent;
          -webkit-appearance: button;
          background-color: #000;
          background-image: none;
          color: #fff;
          cursor: pointer;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,
            Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
          font-size: 100%;
          font-weight: 900;
          line-height: 1.5;
          margin: 0;
          -webkit-mask-image: -webkit-radial-gradient(#000, #fff);
          padding: 0;
        }

        .btn-31:disabled {
          cursor: default;
        }

        .btn-31:-moz-focusring {
          outline: auto;
        }

        .btn-31 svg {
          display: block;
          vertical-align: middle;
        }

        .btn-31 [hidden] {
          display: none;
        }

        .btn-31 {
          border-width: 1px;
          padding: 1rem 2rem;
          position: relative;
          text-transform: uppercase;
        }

        .btn-31:before {
          --progress: 100%;
          background: #fff;
          -webkit-clip-path: polygon(
            100% 0,
            var(--progress) var(--progress),
            0 100%,
            100% 100%
          );
          clip-path: polygon(
            100% 0,
            var(--progress) var(--progress),
            0 100%,
            100% 100%
          );
          content: "";
          inset: 0;
          position: absolute;
          transition: -webkit-clip-path 0.2s ease;
          transition: clip-path 0.2s ease;
          transition: clip-path 0.2s ease, -webkit-clip-path 0.2s ease;
        }

        .btn-31:hover:before {
          --progress: 0%;
        }

        .btn-31 .text-container {
          display: block;
          overflow: hidden;
          position: relative;
        }

        .btn-31 .text {
          display: block;
          font-weight: 900;
          mix-blend-mode: difference;
          position: relative;
        }

        .btn-31:hover .text {
          -webkit-animation: move-up-alternate 0.3s ease forwards;
          animation: move-up-alternate 0.3s ease forwards;
        }

        @-webkit-keyframes move-up-alternate {
          0% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(80%);
          }

          51% {
            transform: translateY(-80%);
          }

          to {
            transform: translateY(0);
          }
        }

        @keyframes move-up-alternate {
          0% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(80%);
          }

          51% {
            transform: translateY(-80%);
          }

          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LearnersDashboard;