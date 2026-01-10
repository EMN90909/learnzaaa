import React, { useState, useEffect } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, AlertTriangle, DollarSign, Users, Calendar, Clock } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  tier: string;
  credits: number;
  org_id?: string;
  stripe_account_id?: string;
  stripe_onboarded?: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string;
  created_at: string;
}

interface PaymentIntent {
  id: string;
  service_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  platform_fee: number;
  status: string;
  created_at: string;
}

interface Learner {
  id: string;
  name: string;
  grade: string;
}

const BillingPage: React.FC = () => {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscription');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState('');
  const [isOnboardingDialogOpen, setIsOnboardingDialogOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.warn('No subscription found');
      } else {
        setSubscription(subscriptionData);
      }

      // Fetch payment intents
      const { data: paymentIntentsData, error: paymentIntentsError } = await supabase
        .from('stripe_payment_intents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (paymentIntentsError) throw paymentIntentsError;
      setPaymentIntents(paymentIntentsData || []);

      // Fetch learners if org_id exists
      if (profileData.org_id) {
        const { data: learnersData, error: learnersError } = await supabase
          .from('learners')
          .select('*')
          .eq('org_id', profileData.org_id);

        if (learnersError) throw learnersError;
        setLearners(learnersData || []);
      }

      showSuccess('Billing data loaded successfully!');
    } catch (error: any) {
      showError('Failed to load billing data: ' + error.message);
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      // In a real implementation, this would call a server-side function
      // to create a Stripe checkout session and redirect to Stripe
      showSuccess('Upgrade initiated! Redirecting to Stripe...');

      // For now, we'll simulate the upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user?.id,
          plan: selectedPlan,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      // Update profile tier
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tier: selectedPlan })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      showSuccess('Upgrade successful! Your plan has been updated.');
      setIsUpgradeDialogOpen(false);
      fetchData();
    } catch (error: any) {
      showError('Failed to upgrade: ' + error.message);
      console.error('Upgrade error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeOnboarding = async () => {
    setIsProcessing(true);
    try {
      // In a real implementation, this would call a server-side function
      // to create a Stripe account link
      showSuccess('Creating Stripe onboarding link...');

      // For now, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set a mock onboarding URL
      setStripeOnboardingUrl('https://connect.stripe.com/setup/e/acct_123/test');
      setIsOnboardingDialogOpen(true);

      // Update profile to mark as onboarded
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_onboarded: true,
          stripe_account_id: 'acct_123'
        })
        .eq('id', user?.id);

      if (error) throw error;

      showSuccess('Stripe onboarding link created!');
    } catch (error: any) {
      showError('Failed to create Stripe onboarding link: ' + error.message);
      console.error('Stripe onboarding error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'free':
        return {
          name: 'Free Plan',
          price: '$0/month',
          features: [
            '5 learners max',
            'Limited lessons',
            'Basic progress tracking',
            'Community support'
          ],
          color: 'bg-gray-100',
          textColor: 'text-gray-700'
        };
      case 'premium':
        return {
          name: 'Premium Plan',
          price: '$12/month per learner',
          features: [
            'Unlimited learners',
            'All lessons & content',
            'Advanced progress tracking',
            'Priority support',
            '10% discount for 2+ learners'
          ],
          color: 'bg-blue-100',
          textColor: 'text-blue-700'
        };
      default:
        return {
          name: 'Unknown Plan',
          price: 'N/A',
          features: [],
          color: 'bg-gray-100',
          textColor: 'text-gray-700'
        };
    }
  };

  const currentPlan = profile ? getPlanDetails(profile.tier) : null;
  const premiumPlan = getPlanDetails('premium');

  const totalEarnings = paymentIntents.reduce((sum, intent) => sum + (intent.amount || 0), 0);
  const platformFees = paymentIntents.reduce((sum, intent) => sum + (intent.platform_fee || 0), 0);
  const netEarnings = totalEarnings - platformFees;

  const daysUntilRenewal = subscription
    ? Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <CollapsibleSidebar />
      <main className="flex-1 p-4 overflow-auto">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Billing & Subscriptions</h1>
            {!profile?.stripe_onboarded && (
              <Button
                onClick={handleStripeOnboarding}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Setup Payouts
                  </>
                )}
              </Button>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 max-w-md">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>

            <TabsContent value="subscription">
              <div className="space-y-6">
                {/* Current Plan Card */}
                <Card className="border-2 border-blue-100">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="text-blue-600" /> Current Plan
                    </CardTitle>
                    <CardDescription>Your current subscription details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-bold">{currentPlan?.name}</h3>
                          <p className="text-lg text-gray-600 dark:text-gray-400">{currentPlan?.price}</p>
                        </div>
                        <Badge variant={profile?.tier === 'premium' ? 'default' : 'secondary'}>
                          {profile?.tier === 'premium' ? 'Active' : 'Free'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Features:</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                          {currentPlan?.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>

                      {subscription && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Next billing date:</span>
                            <span className="font-medium">
                              {new Date(subscription.current_period_end).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Days until renewal:</span>
                            <span className="font-medium">
                              {daysUntilRenewal} days
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        {profile?.tier === 'free' && (
                          <Button
                            onClick={() => setIsUpgradeDialogOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learners Summary */}
                <Card className="border-2 border-green-100">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="text-green-600" /> Learners Summary
                    </CardTitle>
                    <CardDescription>Your current learners and usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Learners</p>
                          <p className="text-2xl font-bold">{learners.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Plan Limit</p>
                          <p className="text-2xl font-bold">
                            {profile?.tier === 'premium' ? 'Unlimited' : '5'}
                          </p>
                        </div>
                      </div>

                      <Progress
                        value={profile?.tier === 'premium' ? 100 : Math.min(100, (learners.length / 5) * 100)}
                        className="h-3"
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {learners.filter(l => l).length}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Grades</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {Array.from(new Set(learners.map(l => l.grade))).length}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Age</p>
                          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            10-12
                          </p>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Usage</p>
                          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                            {profile?.tier === 'premium' ? 'Unlimited' : `${learners.length}/5`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="space-y-6">
                {/* Payment History */}
                <Card className="border-2 border-purple-100">
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="text-purple-600" /> Payment History
                    </CardTitle>
                    <CardDescription>Recent transactions and payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentIntents.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No payment history yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Payments will appear here once you start receiving payments from learners.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paymentIntents.map((intent) => (
                          <div key={intent.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
                                </div>
                                <div>
                                  <p className="font-medium">Payment #{intent.id.slice(0, 8)}...</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(intent.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={intent.status === 'succeeded' ? 'default' : 'secondary'}>
                                  {intent.status}
                                </Badge>
                                <p className="text-lg font-bold mt-1">
                                  ${(intent.amount / 100).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Fee: ${(intent.platform_fee / 100).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  {paymentIntents.length > 0 && (
                    <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
                      <div className="flex justify-between items-center w-full">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            ${(totalEarnings / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Platform Fees</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">
                            ${(platformFees / 100).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Net Earnings</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            ${(netEarnings / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="payouts">
              <div className="space-y-6">
                {/* Payout Setup */}
                <Card className="border-2 border-yellow-100">
                  <CardHeader className="bg-yellow-50">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="text-yellow-600" /> Payout Setup
                    </CardTitle>
                    <CardDescription>Connect your bank account to receive payouts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile?.stripe_onboarded ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-300">Stripe Connected</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Your account is ready to receive payouts
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                              <span className="text-gray-600 dark:text-gray-400">Account ID</span>
                              <span className="font-mono text-sm">{profile.stripe_account_id}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                              <span className="text-gray-600 dark:text-gray-400">Status</span>
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Active
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                              <span className="text-gray-600 dark:text-gray-400">Next Payout</span>
                              <span className="font-medium">Pending</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                              <span className="text-gray-600 dark:text-gray-400">Payout Schedule</span>
                              <span className="font-medium">Daily</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="text-blue-600 dark:text-blue-400" />
                            Important Information
                          </h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>Payouts are processed daily</li>
                            <li>First payout may take 7-10 days for verification</li>
                            <li>Minimum payout amount is $50</li>
                            <li>Payouts are sent to your connected bank account</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <CreditCard className="h-12 w-12 text-yellow-500 mx-auto" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Connect your Stripe account to receive payouts
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Learnzaa uses Stripe to securely process payments and payouts.
                        </p>
                        <Button
                          onClick={handleStripeOnboarding}
                          disabled={isProcessing}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Connect Stripe Account
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payout History */}
                <Card className="border-2 border-indigo-100">
                  <CardHeader className="bg-indigo-50">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="text-indigo-600" /> Payout History
                    </CardTitle>
                    <CardDescription>Your payout history and schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">No payouts yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Payouts will appear here once you've earned enough and your account is verified.
                      </p>
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Next Payout Eligibility</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${Math.max(0, (5000 - netEarnings) / 100).toFixed(2)} more needed
                        </p>
                        <Progress
                          value={Math.min(100, (netEarnings / 5000) * 100)}
                          className="mt-2 h-2"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Minimum payout amount: $50.00
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Choose a plan that works best for your needs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Free Plan */}
              <Card className={cn(
                "border-2",
                profile?.tier === 'free' ? "border-blue-500" : "border-gray-200"
              )}>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Free Plan</CardTitle>
                  <CardDescription>$0/month</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="list-disc list-inside space-y-2 text-sm text-left">
                    <li>5 learners max</li>
                    <li>Limited lessons</li>
                    <li>Basic progress tracking</li>
                    <li>Community support</li>
                  </ul>
                </CardContent>
                <CardFooter className="text-center">
                  {profile?.tier === 'free' ? (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Current Plan
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Current Plan
                    </Button>
                  )}
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className={cn(
                "border-2",
                profile?.tier === 'premium' ? "border-green-500" : "border-green-200"
              )}>
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Premium Plan</CardTitle>
                  <CardDescription>$12/month per learner</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="list-disc list-inside space-y-2 text-sm text-left">
                    <li>Unlimited learners</li>
                    <li>All lessons & content</li>
                    <li>Advanced progress tracking</li>
                    <li>Priority support</li>
                    <li>10% discount for 2+ learners</li>
                  </ul>
                </CardContent>
                <CardFooter className="text-center">
                  {profile?.tier === 'premium' ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Current Plan
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleUpgrade}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Upgrade Now'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> This is a demo. In a real application, clicking "Upgrade Now" would redirect you to Stripe's secure checkout page.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Onboarding Dialog */}
      <Dialog open={isOnboardingDialogOpen} onOpenChange={setIsOnboardingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Stripe Onboarding</DialogTitle>
            <DialogDescription>
              Complete your Stripe account setup to receive payouts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Click the button below to complete your Stripe account setup.
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <a href={stripeOnboardingUrl} target="_blank" rel="noopener noreferrer">
                <CreditCard className="h-4 w-4 mr-2" />
                Complete Stripe Setup
              </a>
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You will be redirected to Stripe's secure website to complete the onboarding process.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingPage;