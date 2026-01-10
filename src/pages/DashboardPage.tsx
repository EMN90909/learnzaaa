import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddLearnerForm from '@/components/AddLearnerForm'; // Import the new form component

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
  const [isAddLearnerModalOpen, setIsAddLearnerModalOpen] = useState(false);
  const [learnersCount, setLearnersCount] = useState(0); // State to track learners count

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

  const fetchLearnersCount = async (orgId: string) => {
    const { count, error } = await supabase
      .from('learners')
      .select('id', { count: 'exact' })
      .eq('org_id', orgId);

    if (error) {
      showError('Failed to fetch learners count: ' + error.message);
      console.error('Error fetching learners count:', error);
      setLearnersCount(0);
    } else {
      setLearnersCount(count || 0);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.org_id) {
      fetchLearnersCount(profile.org_id);
    }
  }, [profile?.org_id, isAddLearnerModalOpen]); // Refetch count when modal closes

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
    <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-64px)] w-full"> {/* Adjust min-h to account for Navbar */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="p-4 border-r">
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
          {profile.role === 'admin' && profile.org_id && (
            <Button onClick={() => setIsAddLearnerModalOpen(true)} className="w-full flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Learner
            </Button>
          )}
          {/* Add other admin tools here */}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80} className="p-4">
        <div className="container mx-auto">
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
            {profile.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Total Learners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{learnersCount}</p>
                </CardContent>
              </Card>
            )}
            {/* Add more dashboard widgets here based on user role */}
          </div>
        </div>
      </ResizablePanel>

      <Dialog open={isAddLearnerModalOpen} onOpenChange={setIsAddLearnerModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Learner</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new learner to your organization.
            </DialogDescription>
          </DialogHeader>
          {profile.org_id ? (
            <AddLearnerForm
              orgId={profile.org_id}
              onLearnerAdded={() => fetchLearnersCount(profile.org_id!)}
              onClose={() => setIsAddLearnerModalOpen(false)}
            />
          ) : (
            <p className="text-red-500">Error: Organization ID not found for this user.</p>
          )}
        </DialogContent>
      </Dialog>
    </ResizablePanelGroup>
  );
};

export default DashboardPage;