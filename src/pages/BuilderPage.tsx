"use client";

import React, { useState } from 'react';
import BuilderDashboard from '../components/builder/BuilderDashboard';
import BuilderHeader from '../components/builder/BuilderHeader';
import LeftPane from '../components/builder/LeftPane';
import MiddlePane from '../components/builder/MiddlePane';
import RightPane from '../components/builder/RightPane';

const BuilderPage: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activeProject, setActiveProject] = useState<string | null>(null);

  const handleCreateProject = (name: string) => {
    setActiveProject(name);
    setView('editor');
  };

  const handleOpenProject = (id: string) => {
    setActiveProject("Existing Project");
    setView('editor');
  };

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <BuilderDashboard 
          onCreateProject={handleCreateProject} 
          onOpenProject={handleOpenProject} 
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">
      <BuilderHeader 
        projectName={activeProject || "Untitled Project"} 
        onBack={() => setView('dashboard')} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftPane />
        <MiddlePane />
        <RightPane />
      </div>
    </div>
  );
};

export default BuilderPage;