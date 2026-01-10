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
            <SafeButton to="/dashboard" variant="ghost">
              <Home className="h-4 w-4 inline-block mr-2" />
              <span>Dashboard</span>
            </SafeButton>
            <SafeButton to="/lessons" variant="ghost">
              <BookOpen className="h-4 w-4 inline-block mr-2" />
              <span>Lessons</span>
            </SafeButton>
            <SafeButton variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600">
              <LogOut className="h-4 w-4 inline-block mr-2" />
              <span>Logout</span>
            </SafeButton>
          </>
        ) : (
          <SafeButton to="/auth">Login / Signup</SafeButton>
        )}
      </div>
    </nav>
  );
};

export default Navbar;