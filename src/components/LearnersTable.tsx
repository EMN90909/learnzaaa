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

interface Learner {
  id: string;
  org_id: string;
  name: string;
  username: string;
  pin_hash: string; // Storing as plain text for now, needs server-side hashing
  dob: string; // YYYY-MM-DD format
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

  const fetchLearners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('learners')
      .select('*')
      .eq('org_id', orgId);

    if (error) {
      showError('Failed to fetch learners: ' + error.message);
      console.error('Error fetching learners:', error);
    } else {
      setLearners(data || []);
      showSuccess('Learners loaded successfully!');
    }
    setLoading(false);
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
        throw error;
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
        throw error;
      }

      showSuccess('Learner deleted successfully!');
      fetchLearners();
    } catch (error: any) {
      showError('Failed to delete learner: ' + error.message);
      console.error('Error deleting learner:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Learners</h2>
        <Dialog open={isAddLearnerModalOpen} onOpenChange={setIsAddLearnerModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Learner
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

      {learners.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No learners added yet. Click "Add New Learner" to get started!</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Class/Grade</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {learners.map((learner) => (
                <TableRow key={learner.id}>
                  <TableCell className="font-medium">{learner.name}</TableCell>
                  <TableCell>{learner.username}</TableCell>
                  <TableCell>{format(new Date(learner.dob), 'PPP')}</TableCell>
                  <TableCell>{learner.grade}</TableCell>
                  <TableCell>{learner.pin_hash}</TableCell> {/* Displaying PIN for now, but should be handled securely */}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(learner)} className="mr-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLearner(learner.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Learner Dialog */}
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

// A simple form for editing learner details
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
                "w-full pl-3 text-left font-normal flex justify-between items-center", // Added flex and justify-between
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