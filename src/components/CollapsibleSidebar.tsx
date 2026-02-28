"use client";

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CollapsibleSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/lessons', label: 'Lessons', icon: <BookOpen className="h-5 w-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Portal</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          <span className="sr-only">Toggle sidebar</span>
          {isCollapsed ? (
            <span className="text-sm">›</span>
          ) : (
            <span className="text-sm">‹</span>
          )}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
              U
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Admin User</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Admin</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CollapsibleSidebar;