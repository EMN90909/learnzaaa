import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Learner {
  id: string;
  org_id: string;
  name: string;
  dob: string;
  grade: string;
  username: string;
  email?: string;
  pin_hash: string; // Storing plain PIN for demo, should be hashed in production
  created_at: string;
}

const ManageLearnersPage: React.FC = () => {
  const { user, profile } = useSession();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddLearnerModalOpen, setIsAddLearnerModalOpen] = useState(false);
  const [isEditLearnerModalOpen, setIsEditLearnerModalOpen] = useState(false);
  const [currentLearner, setCurrentLearner] = useState<Learner | null>(null);
  const [newLearnerName, setNewLearnerName] = useState('');
  const [newLearnerDob, setNewLearnerDob] = useState('');
  const [newLearnerGrade, setNewLearnerGrade] = useState('');
  const [newLearnerUsername, setNewLearnerUsername] = useState('');
  const [newLearnerPin, setNewLearnerPin] = useState('');
  const [newLearnerEmail, setNewLearnerEmail] = useState('');

  const fetchLearners = async () => {
    if (profile?.org_id) {
      setLoading(true);
      const { data, error } = await supabase
        .from('learners')
        .select('*')
        .eq('org_id', profile.org_id);

      if (error) {
        showError('Failed to fetch learners: ' + error.message);
        console.error('Error fetching learners:', error);
      } else {
        setLearners(data || []);
        showSuccess('Learners loaded successfully!');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.org_id) {
      fetchLearners();
    } else if (!loading) {
      showError('Organization ID not found for your profile.');
    }
  }, [profile?.org_id]);

  const handleAddLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.org_id) {
      showError('Cannot add learner: Organization ID is missing.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('learners')
      .insert({
        org_id: profile.org_id,
        name: newLearnerName,
        dob: newLearnerDob,
        grade: newLearnerGrade,
        username: newLearnerUsername,
        email: newLearnerEmail,
        pin_hash: newLearnerPin, // IMPORTANT: In production, hash this PIN securely on the server!
      })
      .select()
      .single();

    if (error) {
      showError('Failed to add learner: ' + error.message);
      console.error('Error adding learner:', error);
    } else {
      showSuccess('Learner added successfully!');
      setLearners([...learners, data]);
      setIsAddLearnerModalOpen(false);
      resetFormFields();
    }
    setLoading(false);
  };

  const handleEditLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLearner) return;

    setLoading(true);
    const { error } = await supabase
      .from('learners')
      .update({
        name: newLearnerName,
        dob: newLearnerDob,
        grade: newLearnerGrade,
        username: newLearnerUsername,
        email: newLearnerEmail,
        pin_hash: newLearnerPin, // IMPORTANT: In production, hash this PIN securely on the server!
      })
      .eq('id', currentLearner.id);

    if (error) {
      showError('Failed to update learner: ' + error.message);
      console.error('Error updating learner:', error);
    } else {
      showSuccess('Learner updated successfully!');
      setLearners(learners.map(l => l.id === currentLearner.id ? { ...l, name: newLearnerName, dob: newLearnerDob, grade: newLearnerGrade, username: newLearnerUsername, email: newLearnerEmail, pin_hash: newLearnerPin } : l));
      setIsEditLearnerModalOpen(false);
      resetFormFields();
    }
    setLoading(false);
  };

  const handleDeleteLearner = async (learnerId: string) => {
    if (!window.confirm('Are you sure you want to delete this learner?')) return;

    setLoading(true);
    const { error } = await supabase
      .from('learners')
      .delete()
      .eq('id', learnerId);

    if (error) {
      showError('Failed to delete learner: ' + error.message);
      console.error('Error deleting learner:', error);
    } else {
      showSuccess('Learner deleted successfully!');
      setLearners(learners.filter(l => l.id !== learnerId));
    }
    setLoading(false);
  };

  const openAddLearnerModal = () => {
    resetFormFields();
    setIsAddLearnerModalOpen(true);
  };

  const openEditLearnerModal = (learner: Learner) => {
    setCurrentLearner(learner);
    setNewLearnerName(learner.name);
    setNewLearnerDob(learner.dob);
    setNewLearnerGrade(learner.grade);
    setNewLearnerUsername(learner.username);
    setNewLearnerPin(learner.pin_hash);
    setNewLearnerEmail(learner.email || '');
    setIsEditLearnerModalOpen(true);
  };

  const resetFormFields = () => {
    setNewLearnerName('');
    setNewLearnerDob('');
    setNewLearnerGrade('');
    setNewLearnerUsername('');
    setNewLearnerPin('');
    setNewLearnerEmail('');
    setCurrentLearner(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profile?.role !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to manage learners. Please log in as a parent/admin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Learners</h1>
        <Button onClick={openAddLearnerModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Learner
        </Button>
      </div>

      {learners.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No learners added yet. Click "Add New Learner" to get started!</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>PIN (Demo)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell className="font-medium">{learner.name}</TableCell>
                    <TableCell>{learner.username}</TableCell>
                    <TableCell>{learner.grade}</TableCell>
                    <TableCell>{learner.pin_hash}</TableCell> {/* Displaying plain PIN for demo */}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditLearnerModal(learner)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteLearner(learner.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Learner Modal */}
      <Dialog open={isAddLearnerModalOpen} onOpenChange={setIsAddLearnerModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Learner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLearner} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newLearnerName} onChange={(e) => setNewLearnerName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="text-right">Date of Birth</Label>
              <Input id="dob" type="date" value={newLearnerDob} onChange={(e) => setNewLearnerDob(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">Grade</Label>
              <Input id="grade" value={newLearnerGrade} onChange={(e) => setNewLearnerGrade(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">Username</Label>
              <Input id="username" value={newLearnerUsername} onChange={(e) => setNewLearnerUsername(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email (Optional)</Label>
              <Input id="email" type="email" value={newLearnerEmail} onChange={(e) => setNewLearnerEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pin" className="text-right">PIN</Label>
              <Input id="pin" type="password" value={newLearnerPin} onChange={(e) => setNewLearnerPin(e.target.value)} maxLength={4} className="col-span-3" required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Learner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Learner Modal */}
      <Dialog open={isEditLearnerModalOpen} onOpenChange={setIsEditLearnerModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Learner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditLearner} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" value={newLearnerName} onChange={(e) => setNewLearnerName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dob" className="text-right">Date of Birth</Label>
              <Input id="edit-dob" type="date" value={newLearnerDob} onChange={(e) => setNewLearnerDob(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-grade" className="text-right">Grade</Label>
              <Input id="edit-grade" value={newLearnerGrade} onChange={(e) => setNewLearnerGrade(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">Username</Label>
              <Input id="edit-username" value={newLearnerUsername} onChange={(e) => setNewLearnerUsername(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email (Optional)</Label>
              <Input id="edit-email" type="email" value={newLearnerEmail} onChange={(e) => setNewLearnerEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-pin" className="text-right">PIN</Label>
              <Input id="edit-pin" type="password" value={newLearnerPin} onChange={(e) => setNewLearnerPin(e.target.value)} maxLength={4} className="col-span-3" required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageLearnersPage;