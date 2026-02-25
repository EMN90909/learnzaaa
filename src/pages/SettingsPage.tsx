"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, User, Shield, Moon, Sun, Monitor } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import { useTheme } from 'next-themes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const SettingsPage: React.FC = () => {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        
        if (data) setDisplayName(data.display_name || '');
      };
      fetchProfile();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id);

      if (error) throw error;
      showSuccess('Profile updated successfully!');
    } catch (error: any) {
      showError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950">
      <CollapsibleSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">Settings</h1>

          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" /> Appearance
                </CardTitle>
                <CardDescription>Customize how Learnzaa looks for you.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={theme} 
                  onValueChange={(val) => setTheme(val)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                    <Label
                      htmlFor="light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      Light
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                    <Label
                      htmlFor="dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      Dark
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="system" id="system" className="peer sr-only" />
                    <Label
                      htmlFor="system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                    >
                      <Monitor className="mb-3 h-6 w-6" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
                <p className="mt-4 text-sm text-muted-foreground">
                  Currently using <span className="font-bold text-primary">{resolvedTheme}</span> mode.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Profile Settings
                </CardTitle>
                <CardDescription>Manage your public profile information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ''} disabled className="bg-slate-100 dark:bg-slate-900" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Name"
                      className="dark:bg-slate-900"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Security
                </CardTitle>
                <CardDescription>Manage your account security and password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => showSuccess('Password reset email sent!')} className="w-full md:w-auto">
                  Reset Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;