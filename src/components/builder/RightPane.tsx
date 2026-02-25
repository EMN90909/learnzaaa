"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MousePointer2, Maximize2 } from 'lucide-react';

const RightPane: React.FC = () => {
  return (
    <main className="flex-1 bg-slate-200 dark:bg-black p-8 overflow-auto flex flex-col items-center">
      {/* Canvas Header */}
      <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white dark:bg-slate-900">Desktop 1440px</Badge>
          <Badge variant="outline" className="bg-white dark:bg-slate-900">Responsive: ON</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Sparkles className="h-4 w-4 text-purple-500" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* The Stage */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl min-h-[800px] rounded-t-2xl border-x border-t relative overflow-hidden">
        {/* AI Suggestion Overlay */}
        <div className="absolute top-12 right-12 z-10 animate-bounce">
          <div className="bg-purple-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
            <Sparkles size={14} />
            <span className="text-[10px] font-bold">AI: Suggest Layout?</span>
          </div>
        </div>

        {/* Mock Content */}
        <div className="p-12 space-y-12">
          <header className="flex justify-between items-center">
            <div className="font-black text-xl">LOGO</div>
            <nav className="flex gap-6 text-sm font-bold text-slate-400">
              <span>Features</span>
              <span>Pricing</span>
              <span>About</span>
            </nav>
          </header>

          <div className="text-center space-y-6 py-20">
            <h1 className="text-6xl font-black tracking-tighter leading-none">
              Build the future <br /> <span className="text-blue-600">with AI.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto font-medium">
              The no-nonsense, AI-powered web builder that mirrors your exact vision.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-8 h-14 text-lg font-bold">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-lg font-bold">
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-3xl space-y-4 hover:border-blue-500 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold">Feature {i}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">AI-generated description for this amazing feature block.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selection Indicator */}
        <div className="absolute top-[340px] left-[380px] w-[200px] h-[60px] border-2 border-blue-500 rounded pointer-events-none">
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">Button</div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize" />
        </div>
      </div>
    </main>
  );
};

export default RightPane;