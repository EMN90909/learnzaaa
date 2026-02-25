"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Save, Send, ArrowLeft, Share2, Github, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { showSuccess } from '@/utils/toast';

interface BuilderHeaderProps {
  projectName: string;
  onBack: () => void;
}

const BuilderHeader: React.FC<BuilderHeaderProps> = ({ projectName, onBack }) => {
  const handlePublish = () => {
    showSuccess("Project Published to Vercel!");
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="font-black text-xl text-blue-600">Learnzaa-Builder</h1>
          <div className="h-4 w-[1px] bg-slate-200" />
          <span className="text-sm font-bold text-slate-600">{projectName}</span>
          <Badge variant="outline" className="text-[10px] text-green-600 border-green-100 bg-green-50">Auto-saved</Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-slate-500 font-bold">
          <Eye className="h-4 w-4 mr-2" /> Preview
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="font-bold">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Progress</DialogTitle>
              <DialogDescription>Commit your changes to GitHub and Vercel.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Commit Message</Label>
                <Input placeholder="e.g. Added hero section" />
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <Github size={16} />
                <span className="text-xs font-bold">Push to: main branch</span>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full bg-slate-900" onClick={() => showSuccess("Changes saved and pushed!")}>Save & Commit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-200">
              <Send className="h-4 w-4 mr-2" /> Publish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ready to go live?</DialogTitle>
              <DialogDescription>Your site will be deployed to a custom learnzaa.top subdomain.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="text-blue-600" />
                  <div className="text-xs font-bold text-blue-900">{projectName.toLowerCase().replace(/\s+/g, '-')}.learnzaa.top</div>
                </div>
                <Badge className="bg-blue-600">Primary</Badge>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">List on Marketplace?</Label>
                  <Badge variant="outline" className="text-purple-600 border-purple-100">Earn Gems 💎</Badge>
                </div>
                <Input placeholder="Short description for buyers..." />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="Price (Gems)" />
                  <Button variant="outline" className="w-full">Mark as Free</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full bg-blue-600" onClick={handlePublish}>Publish Site</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default BuilderHeader;