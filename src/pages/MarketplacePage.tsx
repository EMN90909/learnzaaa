"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingBag, Plus, Star, Search, Filter, ArrowLeft, Image as ImageIcon, Share2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Project {
  id: string;
  title: string;
  creator: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', title: 'Space Explorer Site', creator: 'Alex', description: 'A cool website about planets!', price: 50, image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop', category: 'Website' },
    { id: '2', title: 'Dino Facts App', creator: 'Sarah', description: 'Learn everything about T-Rex.', price: 30, image: 'https://images.unsplash.com/photo-1569391849107-dee33542b8a8?w=400&h=250&fit=crop', category: 'App' },
    { id: '3', title: 'Robot Avatar Pack', creator: 'Leo', description: '10 custom robot icons.', price: 20, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop', category: 'Graphics' },
  ]);

  const [newProject, setNewProject] = useState({ title: '', description: '', price: 0, category: 'Website' });

  const handleAddProject = () => {
    if (!newProject.title) return showError('Please add a title!');
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: newProject.title,
      creator: 'Me',
      description: newProject.description,
      price: Number(newProject.price),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      category: newProject.category
    };
    setProjects([project, ...projects]);
    showSuccess('Project listed in Marketplace!');
    setNewProject({ title: '', description: '', price: 0, category: 'Website' });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/learner-dashboard')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="text-purple-600" /> Marketplace
              </h1>
              <p className="text-slate-500 font-medium">Share and trade your amazing creations!</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 bg-white dark:bg-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" /> Sell Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>List Your Creation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Project Title</Label>
                    <Input placeholder="e.g. My Awesome Game" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="What did you build?" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price (💎 Gems)</Label>
                      <Input type="number" value={newProject.price} onChange={e => setNewProject({...newProject, price: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select 
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newProject.category}
                        onChange={e => setNewProject({...newProject, category: e.target.value})}
                      >
                        <option>Website</option>
                        <option>App</option>
                        <option>Graphics</option>
                        <option>Game</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600" onClick={handleAddProject}>Post to Marketplace</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/50">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-3 right-3 bg-white/90 text-purple-600 backdrop-blur-sm">
                  {project.category}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      by <span className="font-bold text-slate-700 dark:text-slate-300">{project.creator}</span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-purple-600">{project.price} 💎</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 line-clamp-2">{project.description}</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700">
                  Get Project
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;