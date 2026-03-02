"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, ChevronLeft, ChevronRight, Plus, LogOut, Menu, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { showSuccess } from '@/utils/toast';

const CollapsibleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSession();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('learnerData');
      await supabase.auth.signOut();
      showSuccess('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/auth');
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Button 
        asChild 
        variant="ghost" 
        className={cn(
          "w-full justify-start transition-all duration-200",
          isActive ? "bg-sidebar-accent text-sidebar-primary font-semibold" : "text-sidebar-foreground hover:bg-sidebar-accent/50",
          !isOpen && !isMobile && "px-2"
        )}
      >
        <Link to={to} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
          <Icon className={cn("h-5 w-5", isOpen || isMobile ? "mr-3" : "mx-auto")} />
          {(isOpen || isMobile) && <span>{label}</span>}
        </Link>
      </Button>
    );
  };

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-sm border"
        >
          <Menu className="h-5 w-5 text-blue-600" />
        </Button>

        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={toggleMobileMenu}
        >
          <div
            className={cn(
              "fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-blue-600">Learnzaa</h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <NavItem to="/dashboard" icon={Home} label="Dashboard" />
              <NavItem to="/learners" icon={Users} label="Learners" />
              <NavItem to="/learners/add" icon={Plus} label="Add Learner" />
              <NavItem to="/settings" icon={Settings} label="Settings" />
            </nav>

            <div className="p-6 border-t bg-slate-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-blue-100">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-bold truncate max-w-[120px]">{user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">Admin</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500">
                  <LogOut className="h-5 w-5" />
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
        "flex flex-col h-screen sticky top-0 bg-white dark:bg-gray-900 border-r transition-all duration-300 ease-in-out z-40",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {isOpen && (
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-blue-600">Learnzaa</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Admin Portal</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className={cn("text-slate-400 hover:text-blue-600", !isOpen && "mx-auto")}
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        <NavItem to="/dashboard" icon={Home} label="Dashboard" />
        <NavItem to="/learners" icon={Users} label="Learners" />
        <NavItem to="/learners/add" icon={Plus} label="Add Learner" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="p-4 border-t bg-slate-50/50 dark:bg-gray-800/50">
        <div className={cn("flex items-center", isOpen ? "justify-between" : "justify-center")}>
          {isOpen ? (
            <>
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 border border-blue-100">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <p className="font-bold truncate max-w-[100px]">{user?.email?.split('@')[0]}</p>
                  <p className="text-muted-foreground">Admin</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;