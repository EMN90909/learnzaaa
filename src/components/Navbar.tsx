import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Home, BookOpen, User, GraduationCap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Navbar: React.FC = () => {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on learners dashboard
  if (location.pathname === '/learners') {
    return null;
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError(error.message);
      } else {
        showSuccess('Logged out successfully!');
      }
    } catch (error) {
      showError('An error occurred during logout');
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-background shadow-none p-4 flex justify-between items-center">
      <button
        onClick={handleLogoClick}
        className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
      >
        Learnzaa
      </button>
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <Button asChild variant="ghost" className="text-foreground hover:text-primary">
              <Link to="/dashboard">
                <Home className="h-4 w-4 inline-block mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-foreground hover:text-primary">
              <Link to="/learners">
                <User className="h-4 w-4 inline-block mr-2" />
                Learners
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600">
              <LogOut className="h-4 w-4 inline-block mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="text-foreground hover:text-primary">
              <Link to="/auth">Admin Login</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link to="/learner-auth">
                <GraduationCap className="h-4 w-4 inline-block mr-2" />
                Learner Login
              </Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;