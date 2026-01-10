import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LearnerLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLearnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // In a real application, you would hash the PIN on the server and compare.
    // For this example, we'll simulate a lookup.
    const { data: learnerData, error: learnerError } = await supabase
      .from('learners')
      .select('id, pin_hash')
      .eq('username', username)
      .single();

    if (learnerError || !learnerData) {
      showError('Invalid username or PIN.');
      setLoading(false);
      return;
    }

    // This is a simplified PIN check. In production, use a secure hashing library
    // on the server to compare the provided PIN with the stored pin_hash.
    // For now, we'll assume pin_hash stores the plain PIN for demonstration.
    // IMPORTANT: NEVER store plain PINs/passwords in production.
    if (learnerData.pin_hash === pin) {
      // Simulate setting a session for the learner.
      // In a real scenario, you might use a custom auth flow or a JWT for learners.
      // For simplicity, we'll store learner ID in local storage and redirect.
      localStorage.setItem('learner_id', learnerData.id);
      showSuccess('Learner logged in successfully!');
      navigate('/learner-dashboard');
    } else {
      showError('Invalid username or PIN.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Learner Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLearnerLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login as Learner
            </Button>
          </form>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default LearnerLoginPage;