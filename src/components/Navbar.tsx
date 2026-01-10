import React from 'react';
import { Link } from 'react-router-dom';
import SafeButton from '@/components/SafeButton';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Home, BookOpen } from 'lucide-react';
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
        E-Learning
      </Link>
      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <SafeButton variant="ghost" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SafeButton>
            <SafeButton variant="ghost" asChild>
              <Link to="/lessons" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Lessons</span>
              </Link>
            </SafeButton>
            <SafeButton variant="ghost" onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SafeButton>
          </>
        ) : (
          <SafeButton asChild>
            <Link to="/auth">Login / Signup</Link>
          </SafeButton>
        )}
      </div>
    </nav>
  );
};

export default Navbar;