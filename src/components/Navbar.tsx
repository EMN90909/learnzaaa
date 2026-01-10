import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Home, BookOpen, Users, GraduationCap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Navbar: React.FC = () => {
  const { session, user, loading, profile } = useSession();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Logged out successfully!');
    }
  };

  if (loading) {
    return null; // Don't render navbar while session is loading
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        LearnZaa
      </Link>
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            {profile?.role === 'parent' && (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/parent-dashboard" className="flex items-center gap-2">
                    <Home className="h-4 w-4" /> Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/manage-learners" className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Manage Learners
                  </Link>
                </Button>
              </>
            )}
            {profile?.role === 'learner' && (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/learner-dashboard" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> My Learning
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/lessons" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Lessons
                  </Link>
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost">
              <Link to="/auth">Parent/Admin Login</Link>
            </Button>
            <Button asChild>
              <Link to="/learner-login">Learner Login</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;