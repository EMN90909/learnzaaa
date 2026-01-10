import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
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
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        // Only show success message if this is the first load
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

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          owner_id: userId
        })
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      // Update profile with org_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ org_id: orgData.id })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      setProfile(prev => prev ? { ...prev, org_id: orgData.id } : null);
      showSuccess('Organization created successfully!');
    } catch (error: any) {
      showError('Failed to create organization');
      console.error('Error creating organization:', error);
    } finally {
      setCreatingOrg(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading || creatingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an issue loading your profile. Please try logging in again.</p>
            <Button asChild className="mt-4">
              <Link to="/auth">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <CollapsibleSidebar />
      <main className="flex-1 p-4 overflow-auto">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome, {profile.display_name || profile.email}!
            </h1>
            {!profile.org_id && (
              <Button onClick={() => createOrganization(user?.id || '', profile.display_name || profile.email)} disabled={creatingOrg}>
                <Plus className="h-4 w-4 mr-2" />
                {creatingOrg ? 'Creating...' : 'Create Organization'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 dark:text-gray-300">{profile.email}</p>
              </CardContent>
            </Card>
            {profile.org_id && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Organization ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-mono">{profile.org_id}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {profile.org_id ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Learners</h2>
                {/* Removed the duplicate Add Learner button from here */}
              </div>
              <LearnersTable orgId={profile.org_id} />
            </div>
          ) : (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <CardTitle>Organization Setup Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You need to create an organization to manage learners. Click the button below to set up your organization.
                </p>
                <Button onClick={() => createOrganization(user?.id || '', profile.display_name || profile.email)} disabled={creatingOrg}>
                  <Plus className="h-4 w-4 mr-2" />
                  {creatingOrg ? 'Creating Organization...' : 'Create Organization'}
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