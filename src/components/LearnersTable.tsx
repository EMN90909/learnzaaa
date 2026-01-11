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
import { Plus, Edit, Trash2, Loader2, CalendarIcon, Crown, Star, CheckCircle, Lock, Unlock } from 'lucide-react';
import AddLearnerForm from './AddLearnerForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Declare the Stripe buy button element type
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'buy-button-id': string;
        'publishable-key': string;
      };
    }
  }
}

interface Learner {
  id: string;
  org_id: string;
  name: string;
  username: string;
  pin_hash: string;
  dob: string;
  grade: string;
  created_at: string;
  is_premium?: boolean;
}

interface Organization {
  id: string;
  tier: string;
  stripe_customer_id?: string;
  subscription_status?: string;
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('learners');

  const fetchLearners = async () => {
    setLoading(true);
    try {
      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (orgError) {
        console.warn('Could not fetch organization data:', orgError);
        setOrganization({ id: orgId, tier: 'free' });
      } else {
        setOrganization(orgData);
      }

      // Fetch learners
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

  const handleAddLearnerClick = () => {
    if (organization?.tier === 'free' && learners.length >= 1) {
      setShowUpgradeModal(true);
    } else if (organization?.tier === 'premium' && learners.length >= 5) {
      showError('You have reached the maximum of 5 learners for the premium plan.');
    } else {
      setIsAddLearnerModalOpen(true);
    }
  };

  // Load Stripe script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getPlanFeatures = (tier: string) => {
    switch (tier) {
      case 'premium':
        return [
          'Up to 5 learners',
          'All lessons & content',
          'Advanced progress tracking',
          'Priority support',
          'Premium badges for learners',
          'No ads'
        ];
      case 'free':
      default:
        return [
          '1 learner max',
          'Limited lessons',
          'Basic progress tracking',
          'Community support'
        ];
    }
  };

  const getPlanLimit = (tier: string) => {
    return tier === 'premium' ? 5 : 1;
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h2 className="text-2xl font-bold">Your Learners</h2>
          <Badge variant={organization?.tier === 'premium' ? 'default' : 'secondary'} className="text-sm">
            {learners.length} / {getPlanLimit(organization?.tier || 'free')} learners
          </Badge>
          {organization?.tier === 'premium' && (
            <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
          )}
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
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddLearnerClick}>
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
              <AddLearnerForm
                orgId={orgId}
                onLearnerAdded={handleLearnerAdded}
                onClose={() => setIsAddLearnerModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plan Info Card */}
      <Card className={cn(
        "mb-4",
        organization?.tier === 'premium' ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"
      )}>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
               style={{
                 background: organization?.tier === 'premium'
                   ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                   : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
               }}>
            {organization?.tier === 'premium' ? (
              <Crown className="h-6 w-6 text-yellow-800" />
            ) : (
              <Star className="h-6 w-6 text-blue-800" />
            )}
          </div>
          <div>
            <CardTitle>{organization?.tier === 'premium' ? 'Premium Plan' : 'Free Plan'}</CardTitle>
            <CardDescription>
              {organization?.tier === 'premium' ? 'Enjoy all premium features!' : 'Upgrade to unlock more features'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                {organization?.tier === 'premium' ? (
                  <>
                    <Unlock className="text-green-600" /> All Features Unlocked
                  </>
                ) : (
                  <>
                    <Lock className="text-blue-600" /> Current Features
                  </>
                )}
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {getPlanFeatures(organization?.tier || 'free').map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            {organization?.tier === 'free' && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Star className="text-yellow-600" /> Premium Features
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {getPlanFeatures('premium').map((feature, index) => (
                    <li key={index} className="text-yellow-700">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {organization?.tier === 'free' && (
            <Button
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => setShowUpgradeModal(true)}
            >
              <Crown className="mr-2 h-4 w-4" /> Upgrade to Premium
            </Button>
          )}
        </CardContent>
      </Card>

      {learners.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No learners added yet.</p>
            <Button onClick={handleAddLearnerClick} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4 inline-block" />
              Add First Learner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="learners">Learners List</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="learners">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="font-medium flex items-center gap-2">
                        {learner.name}
                        {organization?.tier === 'premium' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </TableCell>
                      <TableCell>{learner.username}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{learner.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={organization?.tier === 'premium' ? 'default' : 'secondary'}>
                          {organization?.tier === 'premium' ? 'Premium' : 'Free'}
                        </Badge>
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
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Learner Statistics</CardTitle>
                <CardDescription>Overview of your learners' progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500">Total Learners</p>
                    <p className="text-2xl font-bold text-blue-600">{learners.length}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500">Plan Limit</p>
                    <p className="text-2xl font-bold text-green-600">{getPlanLimit(organization?.tier || 'free')}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500">Available Slots</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {Math.max(0, getPlanLimit(organization?.tier || 'free') - learners.length)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500">Plan Status</p>
                    <p className="text-2xl font-bold">
                      {organization?.tier === 'premium' ? (
                        <span className="text-yellow-600">Premium ✨</span>
                      ) : (
                        <span className="text-blue-600">Free</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {selectedLearner && (
        <Dialog open={!!selectedLearner} onOpenChange={() => setSelectedLearner(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLearner.name}
                {organization?.tier === 'premium' && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </DialogTitle>
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
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={organization?.tier === 'premium' ? 'default' : 'secondary'}>
                  {organization?.tier === 'premium' ? 'Premium Learner' : 'Free Learner'}
                </Badge>
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

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="text-yellow-500" /> Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Unlock all features for only Ksh 1,071.73/month
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Plan */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Free Plan</CardTitle>
                  <CardDescription>Ksh 0/month</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="list-disc list-inside space-y-2 text-sm text-left">
                    {getPlanFeatures('free').map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="text-center">
                  <Badge variant="default" className="bg-gray-100 text-gray-800">
                    Current Plan
                  </Badge>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg flex items-center justify-center gap-2">
                    <Crown className="text-yellow-600" /> Premium Plan
                  </CardTitle>
                  <CardDescription>Ksh 1,071.73/month</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="list-disc list-inside space-y-2 text-sm text-left">
                    {getPlanFeatures('premium').map((feature, index) => (
                      <li key={index} className="text-yellow-700">{feature}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="text-center">
                  <div className="stripe-buy-button-container w-full">
                    <stripe-buy-button
                      buy-button-id="buy_btn_1SoB1qBpNVQg8dwhvgOJ3H5Z"
                      publishable-key="pk_test_51SUQLlBpNVQg8dwh5nhv9iJVOQFa3MnZUsOqGZVF9CsgzUHG7QBp2jvIKDdS1mW8mh3Nq2zdjPacu4jyJyObX9L2008Lf5ovPK"
                    />
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Contact support@learnzaa.com if you have any questions about upgrading.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add CSS for mobile-friendly Stripe button */}
      <style>
        {`
          .stripe-buy-button-container {
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
          }

          @media (max-width: 768px) {
            .stripe-buy-button-container {
              max-width: 100%;
            }

            stripe-buy-button {
              width: 100% !important;
            }
          }
        `}
      </style>
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