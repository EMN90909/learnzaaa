"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Users, ChevronLeft, ChevronRight, Plus, LogOut, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess } from '@/utils/toast';

const CollapsibleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, session } = useSession();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      showSuccess('Logged out successfully!');
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar-background shadow-md transition-all duration-300 ease-in-out border-r border-sidebar-border",
        isOpen ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="p-4 flex items-center justify-between">
        {isOpen && (
          <h2 className="text-xl font-semibold text-sidebar-foreground">
            <span className="text-blue-600 dark:text-blue-400">Learnzaa</span> Admin
          </h2>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto text-sidebar-foreground hover:text-sidebar-primary">
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
          <Link to="/dashboard">
            <Home className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </Button>

        <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
          <Link to="/learners">
            <Users className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Learners</span>}
          </Link>
        </Button>

        <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
          <Link to="/learners/add">
            <Plus className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Add Learner</span>}
          </Link>
        </Button>

        <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
          <Link to="/billing">
            <CreditCard className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Billing</span>}
          </Link>
        </Button>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isOpen && (
              <div className="text-sm">
                <p className="font-medium text-sidebar-foreground truncate max-w-[120px]">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;