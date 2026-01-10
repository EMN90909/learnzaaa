import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Home, BookOpen, User, GraduationCap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Navbar: React.FC = () => {
  const { session, loading } = useSession();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Logged out successfully!');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        LearnZaa
      </Link>
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <Button asChild variant="ghost">
              <Link to="/dashboard">
                <Home className="h-4 w-4 inline-block mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/lessons">
                <BookOpen className="h-4 w-4 inline-block mr-2" />
                Lessons
              </Link>
            </Button>
            <Button asChild variant="ghost">
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
            <Button asChild variant="ghost">
              <Link to="/auth">Admin Login</Link>
            </Button>
            <Button asChild>
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