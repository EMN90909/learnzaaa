import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  org_id?: string;
}

interface Organization {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  max_learners: number;
}

const ParentDashboardPage: React.FC = () => {
  const { user, profile: userProfile } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          showError('Failed to fetch profile: ' + profileError.message);
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
          showSuccess('Profile loaded successfully!');

          // Fetch organization if profile has an org_id
          if (profileData?.org_id) {
            const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', profileData.org_id)
              .single();

            if (orgError) {
              showError('Failed to fetch organization: ' + orgError.message);
              console.error('Error fetching organization:', orgError);
            } else {
              setOrganization(orgData);
              showSuccess('Organization loaded successfully!');
            }
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page. Please log in as a parent/admin.</p>
            <Button asChild className="mt-4">
              <Link to="/auth">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Parent Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile.display_name || profile.email}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg capitalize">Role: {profile.role}</p>
            <p className="text-lg">Email: {profile.email}</p>
          </CardContent>
        </Card>

        {organization ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">Name: {organization.name}</p>
              <p className="text-lg">Plan: {organization.plan}</p>
              <p className="text-lg">Max Learners: {organization.max_learners}</p>
              <Button asChild className="mt-4 w-full">
                <Link to="/manage-learners">Manage Learners</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Organization Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>It seems your organization hasn't been set up yet. This should happen automatically.</p>
              <p>Please contact support if this issue persists.</p>
            </CardContent>
          </Card>
        )}

        <Card className="flex flex-col items-center justify-center p-6">
          <PlusCircle className="h-12 w-12 text-blue-500 mb-4" />
          <CardTitle className="mb-2">Add New Learner</CardTitle>
          <CardContent className="text-center p-0">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Expand your learning family.</p>
            <Button asChild>
              <Link to="/manage-learners">Add Learner</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Add more parent dashboard widgets here */}
      </div>
    </div>
  );
};

export default ParentDashboardPage;