"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Users, ChevronLeft, ChevronRight, Plus, LogOut, CreditCard, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess } from '@/utils/toast';
import { useIsMobile } from '@/hooks/use-mobile';

const CollapsibleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, session } = useSession();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        // Don't show error to user, just redirect
      }
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Redirect to home page even if there's an error
      window.location.href = '/';
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <Menu className="h-5 w-5 text-blue-600" />
        </Button>

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out",
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={toggleMobileMenu}
        >
          <div
            className={cn(
              "fixed left-0 top-0 h-full w-64 bg-sidebar-background shadow-lg transform transition-transform duration-300 ease-in-out z-50",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
              <h2 className="text-xl font-semibold text-sidebar-foreground">
                <span className="text-blue-600 dark:text-blue-400">Learnzaa</span> Admin
              </h2>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-sidebar-foreground">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
                <Link to="/dashboard" onClick={toggleMobileMenu}>
                  <Home className="h-5 w-5 inline-block mr-2" />
                  Dashboard
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
                <Link to="/learners" onClick={toggleMobileMenu}>
                  <Users className="h-5 w-5 inline-block mr-2" />
                  Learners
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
                <Link to="/learners/add" onClick={toggleMobileMenu}>
                  <Plus className="h-5 w-5 inline-block mr-2" />
                  Add Learner
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
                <Link to="/billing" onClick={toggleMobileMenu}>
                  <CreditCard className="h-5 w-5 inline-block mr-2" />
                  Billing
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
                  <div className="text-sm">
                    <p className="font-medium text-sidebar-foreground truncate max-w-[120px]">
                      {user?.user_metadata?.full_name || user?.email || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.email}
                    </p>
                  </div>
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
        </div>
      </>
    );
  }

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