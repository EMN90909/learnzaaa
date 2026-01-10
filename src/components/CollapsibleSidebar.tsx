"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSidebarProps {
  children?: React.ReactNode;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin Tools</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/lessons" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {isOpen && <span>Lessons</span>}
          </Link>
        </Button>
      </nav>
      {children && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSidebar;