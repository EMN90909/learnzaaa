import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: 'parent' | 'learner';
  org_id?: string;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        showError('Failed to load user profile.');
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);

        if (event === 'SIGNED_IN') {
          showSuccess('Welcome back!');
          // Redirect based on role after profile is fetched
          // This will be handled by the PrivateRoute or a subsequent effect
        } else if (event === 'SIGNED_OUT') {
          showSuccess('You have been signed out.');
          navigate('/auth'); // Redirect to parent/admin auth page on sign-out
        } else if (event === 'INITIAL_SESSION' && !currentSession) {
          // If no initial session, redirect to the main visit page or auth
          navigate('/');
        }
      }
    );

    // Fetch initial session and profile
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id);
      }
      setLoading(false);
      if (!initialSession) {
        navigate('/'); // Redirect to main visit page if no initial session
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Effect to handle redirection after profile is loaded
  useEffect(() => {
    if (!loading && session && profile) {
      if (profile.role === 'parent') {
        navigate('/parent-dashboard');
      } else if (profile.role === 'learner') {
        // For learners, the main auth flow is not used, so this path might not be hit.
        // If a learner somehow signs in via the main auth, they'd go to their dashboard.
        navigate('/learner-dashboard');
      }
    }
  }, [loading, session, profile, navigate]);


  return (
    <SessionContext.Provider value={{ session, user, profile, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};