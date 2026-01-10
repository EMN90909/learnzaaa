import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  org_id?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          showError('Failed to fetch profile: ' + error.message);
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
          showSuccess('Profile loaded successfully!');
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an issue loading your profile. Please try logging in again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile.display_name || profile.email}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg capitalize">{profile.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{profile.email}</p>
          </CardContent>
        </Card>
        {profile.org_id && (
          <Card>
            <CardHeader>
              <CardTitle>Organization ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{profile.org_id}</p>
            </CardContent>
          </Card>
        )}
        {/* Add more dashboard widgets here based on user role */}
      </div>
    </div>
  );
};

export default DashboardPage;