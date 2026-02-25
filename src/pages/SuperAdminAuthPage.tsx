"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, LogIn, Key, Lock } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const SuperAdminAuthPage: React.FC = () => {
  const [step, setStep] = useState<'key' | 'auth'>('key');
  const [keyInput, setKeyInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAIL = 'nasongoemmanuel8@gmail.com';
  const ADMIN_KEY = '1415';

  useEffect(() => {
    const blockedUntil = localStorage.getItem('admin_blocked_until');
    if (blockedUntil && new Date().getTime() < parseInt(blockedUntil)) {
      setIsBlocked(true);
    }
  }, []);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      showError('Access blocked due to too many failed attempts.');
      return;
    }

    if (keyInput === ADMIN_KEY) {
      showSuccess('Key accepted. Please provide credentials.');
      setStep('auth');
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        const blockTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('admin_blocked_until', blockTime.toString());
        setIsBlocked(true);
        showError('Too many attempts. Your IP access is restricted.');
      } else {
        showError(`Invalid key. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email !== ADMIN_EMAIL) {
        showError('Unauthorized email address.');
        setLoading(false);
        return;
      }

      if (pin !== ADMIN_KEY) {
        showError('Invalid Admin PIN.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user?.email === ADMIN_EMAIL) {
        showSuccess('Welcome back, Super Admin!');
        // Store a session flag for the PIN verification
        sessionStorage.setItem('super_admin_verified', 'true');
        navigate('/super-admin-dashboard');
      } else {
        showError('Access denied.');
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      showError('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Access Restricted</CardTitle>
            <CardDescription>
              Too many failed attempts. This device has been restricted from accessing the Super Admin portal.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-white/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Learnzaa Super Admin</CardTitle>
          <CardDescription className="text-slate-500">
            {step === 'key' ? 'Enter Security Key' : 'Verify Credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'key' ? (
            <form onSubmit={handleKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">4-Digit Security Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="key"
                    type="password"
                    placeholder="****"
                    maxLength={4}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="pl-10 text-center text-2xl tracking-widest"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Verify Key
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nasongoemmanuel8@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Admin PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="1415"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login to Dashboard
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-slate-500 text-xs"
                onClick={() => setStep('key')}
              >
                Back to Key Entry
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default SuperAdminAuthPage;