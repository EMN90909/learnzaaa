"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeButton from '@/components/SafeButton';
import { Home, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const CollapsibleSidebar: React.FC = () => {
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
        <SafeButton variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </SafeButton>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <SafeButton variant="ghost" className="w-full justify-start" asChild>
          <Link to="/dashboard">
            <Home className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </SafeButton>
        <SafeButton variant="ghost" className="w-full justify-start" asChild>
          <Link to="/lessons">
            <BookOpen className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Lessons</span>}
          </Link>
        </SafeButton>
      </nav>
    </div>
  );
};

export default CollapsibleSidebar;