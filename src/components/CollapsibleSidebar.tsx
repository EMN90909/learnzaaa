"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Users, BookOpen, User, ChevronLeft, ChevronRight } from 'lucide-react';
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
        {isOpen && <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">LearnZaa Admin</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link to="/dashboard">
            <Home className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link to="/lessons">
            <BookOpen className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Lessons</span>}
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link to="/learners">
            <Users className="h-5 w-5 inline-block mr-2" />
            {isOpen && <span>Learners</span>}
          </Link>
        </Button>
      </nav>
    </div>
  );
};

export default CollapsibleSidebar;