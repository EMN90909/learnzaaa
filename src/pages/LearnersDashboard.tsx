"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Plus } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LearnersTable from '@/components/LearnersTable';
import AddLearnerForm from '@/components/AddLearnerForm';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const LearnersDashboard: React.FC = () => {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
      setOrgId(data?.org_id || user.id);
      setLoading(false);
    };
    fetchOrg();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-black"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black">
      <CollapsibleSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Learners Management</h1>
              <p className="text-slate-500 dark:text-gray-400">Add and manage your students here.</p>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add New Learner
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-900 dark:border-gray-800 dark:text-white">
                <DialogHeader><DialogTitle>Add Learner</DialogTitle></DialogHeader>
                <AddLearnerForm orgId={orgId!} onLearnerAdded={() => { setIsAddModalOpen(false); window.location.reload(); }} onClose={() => setIsAddModalOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              {orgId && <LearnersTable orgId={orgId} />}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LearnersDashboard;