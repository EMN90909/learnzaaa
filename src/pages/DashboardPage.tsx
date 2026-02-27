import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Plus, Users, BookOpen, Star } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import LearnersTable from '@/components/LearnersTable';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  org_id?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingOrg, setCreatingOrg] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading || creatingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CollapsibleSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {profile?.display_name || 'Admin'}
            </h1>
            <p className="text-slate-500 mt-1">Here's what's happening with your learners today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Total Learners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Manage below</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Active Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Explore library</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Avg. Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Tracking active</div>
              </CardContent>
            </Card>
          </div>

          {profile?.org_id ? (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <LearnersTable orgId={profile.org_id} />
            </div>
          ) : (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <CardTitle>Organization Setup Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Click below to finalize your organization setup.
                </p>
                <Button onClick={() => createOrganization(user?.id || '', profile?.display_name || '')}>
                  <Plus className="h-4 w-4 mr-2" /> Create Organization
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;