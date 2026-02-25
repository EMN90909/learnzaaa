"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Settings2, Palette, Zap } from 'lucide-react';

const MiddlePane: React.FC = () => {
  return (
    <aside className="w-80 bg-slate-50 dark:bg-slate-950 border-r flex flex-col h-full">
      <div className="p-4 border-b bg-white dark:bg-slate-900 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Inspector</h2>
        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100">Selected: Button</Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Properties */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Settings2 size={14} />
              <h3 className="text-xs font-bold">Properties</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-slate-500">Label Text</Label>
                <Input defaultValue="Get Started" className="h-8 text-xs" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-slate-500">Full Width</Label>
                <Switch />
              </div>
            </div>
          </section>

          {/* Visual Logic */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600">
              <BrainCircuit size={14} />
              <h3 className="text-xs font-bold">Visual Logic</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl space-y-3">
              <div className="text-[10px] font-medium text-purple-700 dark:text-purple-300">
                IF <span className="font-black">Clicked</span> THEN
              </div>
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-purple-500" />
                <span className="text-[10px] font-bold">Call Gemini AI</span>
              </div>
              <div className="text-[10px] text-slate-400 italic">"Generate welcome message"</div>
            </div>
          </section>

          {/* Styling */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Palette size={14} />
              <h3 className="text-xs font-bold">Appearance</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Background</Label>
                <div className="h-8 w-full rounded border bg-blue-600 cursor-pointer" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Radius</Label>
                <Input defaultValue="12px" className="h-8 text-xs" />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </aside>
  );
};

export default MiddlePane;