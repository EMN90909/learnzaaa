import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LearnerProfile {
  id: string;
  username: string;
  name: string;
  org_id: string;
  // Add other learner specific fields as needed
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
}

const LearnerDashboardPage: React.FC = () => {
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [assignedLessons, setAssignedLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLearnerData = async () => {
      setLoading(true);
      const learnerId = localStorage.getItem('learner_id');

      if (!learnerId) {
        showError('No learner session found. Please log in.');
        navigate('/learner-login');
        setLoading(false);
        return;
      }

      // Fetch learner profile
      const { data: profileData, error: profileError } = await supabase
        .from('learners')
        .select('*')
        .eq('id', learnerId)
        .single();

      if (profileError || !profileData) {
        showError('Failed to fetch learner profile: ' + (profileError?.message || 'Unknown error'));
        console.error('Error fetching learner profile:', profileError);
        localStorage.removeItem('learner_id'); // Clear invalid session
        navigate('/learner-login');
        setLoading(false);
        return;
      }
      setLearnerProfile(profileData);
      showSuccess(`Welcome, ${profileData.name || profileData.username}!`);

      // Fetch lessons (for now, all lessons, later can be filtered by org/assigned)
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, description, category, level');

      if (lessonsError) {
        showError('Failed to fetch lessons: ' + lessonsError.message);
        console.error('Error fetching lessons:', lessonsError);
      } else {
        setAssignedLessons(lessonsData || []);
      }

      setLoading(false);
    };

    fetchLearnerData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('learner_id');
    showSuccess('You have been logged out.');
    navigate('/learner-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!learnerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to access the learner dashboard.</p>
            <Button asChild className="mt-4">
              <Link to="/learner-login">Go to Learner Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Learning Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome, {learnerProfile.name || learnerProfile.username}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here you can see your progress and assigned lessons.</p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Your Lessons</h2>
      {assignedLessons.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No lessons assigned yet. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assignedLessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
                <CardContent className="p-0 pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{lesson.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Category: {lesson.category} | Level: {lesson.level}</p>
                  <Button asChild size="sm" className="mt-4 w-full">
                    <Link to={`/lessons/${lesson.id}`}>Start Lesson</Link>
                  </Button>
                </CardContent>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearnerDashboardPage;