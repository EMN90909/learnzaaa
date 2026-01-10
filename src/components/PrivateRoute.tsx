import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PrivateRouteProps {
  allowedRoles: ('parent' | 'learner')[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { session, profile, loading } = useSession();
  const learnerId = localStorage.getItem('learner_id');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Handle Supabase authenticated users (parents/admins)
  if (session && profile) {
    if (allowedRoles.includes(profile.role)) {
      return <Outlet />;
    } else {
      // User is logged in but doesn't have the required role
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You do not have the necessary permissions to view this page.</p>
              <Button asChild className="mt-4">
                <Link to={profile.role === 'parent' ? '/parent-dashboard' : '/'}>Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Handle Learner authenticated users (using local storage)
  if (allowedRoles.includes('learner') && learnerId) {
    // For learner routes, we assume if learnerId exists, they are authenticated.
    // More robust checks would involve verifying the learnerId with the backend.
    return <Outlet />;
  }

  // If not authenticated by Supabase or as a learner, redirect to appropriate login
  if (allowedRoles.includes('learner')) {
    return <Navigate to="/learner-login" replace />;
  } else {
    return <Navigate to="/auth" replace />;
  }
};

export default PrivateRoute;