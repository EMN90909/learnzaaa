import React from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import AddLearnerForm from '@/components/AddLearnerForm';
import { showSuccess } from '@/utils/toast';

const AddLearnerPage: React.FC = () => {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const handleLearnerAdded = () => {
    showSuccess('Learner added successfully!');
    navigate('/learners');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to add learners.</p>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add New Learner</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fill in the details below to add a new learner to your organization.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto border-none shadow-lg">
            <CardHeader>
              <CardTitle>Learner Information</CardTitle>
              <CardDescription>
                Enter the learner's details to create their account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddLearnerForm
                orgId={user.id} // Using user ID as org_id for now
                onLearnerAdded={handleLearnerAdded}
                onClose={() => navigate('/learners')}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddLearnerPage;