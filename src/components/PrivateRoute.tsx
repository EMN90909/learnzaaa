import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute: React.FC = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRoute;