"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, CalendarIcon } from 'lucide-react';
import AddLearnerForm from './AddLearnerForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Learner {
  id: string;
  org_id: string;
  name: string;
  username: string;
  pin_hash: string;
  dob: string;
  grade: string;
  created_at: string;
}

interface LearnersTableProps {
  orgId: string;
}

const LearnersTable: React.FC<LearnersTableProps> = ({ orgId }) => {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddLearnerModalOpen, setIsAddLearnerModalOpen] = useState(false);
  const [isEditLearnerModalOpen, setIsEditLearnerModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<Learner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [organizationTier, setOrganizationTier] = useState<string>('free');

  const fetchLearners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learners')
        .select('*')
        .eq('org_id', orgId);

      if (error) {
        if (error.code === '42501') {
          showError('You do not have permission to view learners. Please contact support.');
        } else {
          throw error;
        }
        return;
      }

      setLearners(data || []);

      // Fetch organization tier - handle case where tier column might not exist
      try {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();

        if (orgError) {
          // If there's an error, assume free tier
          setOrganizationTier('free');
        } else {
          // Check if tier exists, otherwise default to free
          setOrganizationTier(orgData?.tier || 'free');
        }
      } catch (orgError) {
        console.warn('Could not fetch organization tier, defaulting to free:', orgError);
        setOrganizationTier('free');
      }

    } catch (error: any) {
      showError('Failed to fetch learners: ' + error.message);
      console.error('Error fetching learners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchLearners();
    }
  }, [orgId]);

  const handleLearnerAdded = () => {
    fetchLearners();
    setIsAddLearnerModalOpen(false);
  };

  const handleEditClick = (learner: Learner) => {
    setEditingLearner(learner);
    setIsEditLearnerModalOpen(true);
  };

  const handleUpdateLearner = async (updatedValues: Partial<Learner>) => {
    if (!editingLearner) return;

    try {
      const { error } = await supabase
        .from('learners')
        .update(updatedValues)
        .eq('id', editingLearner.id);

      if (error) {
        if (error.code === '42501') {
          showError('You do not have permission to update learners. Please contact support.');
        } else if (error.code === '23505') {
          showError('Username already exists. Please choose a different one.');
        } else {
          throw error;
        }
        return;
      }

      showSuccess('Learner updated successfully!');
      fetchLearners();
      setIsEditLearnerModalOpen(false);
      setEditingLearner(null);
    } catch (error: any) {
      showError('Failed to update learner: ' + error.message);
      console.error('Error updating learner:', error);
    }
  };

  const handleDeleteLearner = async (learnerId: string) => {
    if (!window.confirm('Are you sure you want to delete this learner?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('learners')
        .delete()
        .eq('id', learnerId);

      if (error) {
        if (error.code === '42501') {
          showError('You do not have permission to delete learners. Please contact support.');
        } else {
          throw error;
        }
        return;
      }

      showSuccess('Learner deleted successfully!');
      fetchLearners();
    } catch (error: any) {
      showError('Failed to delete learner: ' + error.message);
      console.error('Error deleting learner:', error);
    }
  };

  const filteredLearners = learners.filter(learner =>
    learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learner.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h2 className="text-2xl font-bold">Your Learners</h2>
          <Badge variant="secondary" className="text-sm">
            {learners.length} total learners
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Search learners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Dialog open={isAddLearnerModalOpen} onOpenChange={setIsAddLearnerModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="mr-2 h-4 w-4 inline-block" />
                Add New Learner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Learner</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new learner to your organization.
                </DialogDescription>
              </DialogHeader>
              <AddLearnerForm orgId={orgId} onLearnerAdded={handleLearnerAdded} onClose={() => setIsAddLearnerModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Ads for Free Accounts */}
      {organizationTier === 'free' && (
        <Card className="border-yellow-200 bg-yellow-50 mb-4">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">💡</span>
            </div>
            <div>
              <CardTitle>Upgrade to Premium</CardTitle>
              <CardDescription>Unlock all features and remove ads for only Ksh 1,071.73/month</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Free Plan Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Limited lessons</li>
                  <li>Basic progress tracking</li>
                  <li>Community support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Premium Plan Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Unlimited learners</li>
                  <li>All lessons & content</li>
                  <li>Advanced progress tracking</li>
                  <li>Priority support</li>
                  <li>No ads</li>
                </ul>
              </div>
            </div>
            <Button
              className="mt-4 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => showSuccess('Redirecting to billing page...')}
            >
              <Link to="/billing">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {learners.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No learners added yet.</p>
            <Button onClick={() => setIsAddLearnerModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4 inline-block" />
              Add First Learner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Class/Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLearners.map((learner) => (
                <TableRow
                  key={learner.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => setSelectedLearner(learner)}
                >
                  <TableCell className="font-medium">{learner.name}</TableCell>
                  <TableCell>{learner.username}</TableCell>
                  <TableCell>{format(new Date(learner.dob), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{learner.grade}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleEditClick(learner)}} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleDeleteLearner(learner.id)}}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedLearner && (
        <Dialog open={!!selectedLearner} onOpenChange={() => setSelectedLearner(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedLearner.name}</DialogTitle>
              <DialogDescription>Learner Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{selectedLearner.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-medium">{selectedLearner.grade}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{format(new Date(selectedLearner.dob), 'PPPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{new Date(selectedLearner.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isEditLearnerModalOpen} onOpenChange={setIsEditLearnerModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Learner</DialogTitle>
            <DialogDescription>
              Update the details for {editingLearner?.name}.
            </DialogDescription>
          </DialogHeader>
          {editingLearner && (
            <EditLearnerForm
              learner={editingLearner}
              onUpdate={handleUpdateLearner}
              onClose={() => setIsEditLearnerModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface EditLearnerFormProps {
  learner: Learner;
  onUpdate: (values: Partial<Learner>) => void;
  onClose: () => void;
}

const EditLearnerForm: React.FC<EditLearnerFormProps> = ({ learner, onUpdate, onClose }) => {
  const [name, setName] = useState(learner.name);
  const [username, setUsername] = useState(learner.username);
  const [pin, setPin] = useState(learner.pin_hash);
  const [dob, setDob] = useState<Date>(new Date(learner.dob));
  const [grade, setGrade] = useState(learner.grade);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name,
      username,
      pin_hash: pin,
      dob: dob.toISOString().split('T')[0],
      grade,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Name</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="edit-username">Username</Label>
        <Input id="edit-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="edit-pin">PIN</Label>
        <Input id="edit-pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} required />
      </div>
      <div className="flex flex-col">
        <Label htmlFor="edit-dob">Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal flex justify-between items-center",
                !dob && "text-muted-foreground"
              )}
            >
              <span className="flex items-center justify-between w-full">
                {dob ? (
                  format(dob, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dob}
              onSelect={(date) => date && setDob(date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="edit-grade">Class/Grade</Label>
        <Input id="edit-grade" value={grade} onChange={(e) => setGrade(e.target.value)} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default LearnersTable;