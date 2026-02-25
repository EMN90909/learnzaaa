"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Layout, Clock, Star, MoreVertical, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface BuilderDashboardProps {
  onCreateProject: (name: string) => void;
  onOpenProject: (id: string) => void;
}

const BuilderDashboard: React.FC<BuilderDashboardProps> = ({ onCreateProject, onOpenProject }) => {
  const popularTemplates = [
    { id: 't1', name: 'SaaS Landing Page', category: 'Business', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop' },
    { id: 't2', name: 'Portfolio Pro', category: 'Creative', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=250&fit=crop' },
    { id: 't3', name: 'E-commerce Starter', category: 'Shop', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=250&fit=crop' },
  ];

  const userProjects = [
    { id: 'p1', name: 'My Awesome App', lastEdited: '2 hours ago', status: 'Draft' },
    { id: 'p2', name: 'Client Website', lastEdited: 'Yesterday', status: 'Published' },
  ];

  const handleNewProject = () => {
    const name = prompt("Enter project name:");
    if (name) onCreateProject(name);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Learnzaa Builder</h1>
          <p className="text-slate-500 font-medium">AI-powered web creation for the next generation.</p>
        </div>
        <Button onClick={handleNewProject} size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 shadow-xl shadow-blue-200">
          <Plus className="mr-2 h-5 w-5" /> New Project
        </Button>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Star className="text-yellow-500 h-5 w-5" />
          <h2 className="text-xl font-bold">Popular Projects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularTemplates.map(template => (
            <Card key={template.id} className="group cursor-pointer overflow-hidden border-2 hover:border-blue-500 transition-all" onClick={() => onOpenProject(template.id)}>
              <div className="h-40 overflow-hidden relative">
                <img src={template.image} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <Badge className="absolute top-3 right-3 bg-white/90 text-blue-600">{template.category}</Badge>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Layout className="text-blue-600 h-5 w-5" />
            <h2 className="text-xl font-bold">All Projects</h2>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search projects..." className="pl-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {userProjects.map(project => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onOpenProject(project.id)}>
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-100 p-3 rounded-xl mb-3">
                    <Layout className="h-6 w-6 text-slate-600" />
                  </div>
                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </div>
                <CardTitle className="text-base">{project.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3" /> {project.lastEdited}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Badge variant={project.status === 'Published' ? 'default' : 'secondary'} className="text-[10px]">
                  {project.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BuilderDashboard;