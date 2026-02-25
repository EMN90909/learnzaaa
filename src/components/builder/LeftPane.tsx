"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Box, 
  ShoppingBag, 
  Layers, 
  Zap, 
  Type, 
  Image as ImageIcon, 
  MousePointer2, 
  ToggleLeft,
  Search,
  Database,
  BrainCircuit,
  Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const LeftPane: React.FC = () => {
  const primitives = [
    { icon: <Type size={18} />, label: 'Heading' },
    { icon: <Layers size={18} />, label: 'Text Block' },
    { icon: <ImageIcon size={18} />, label: 'Image' },
    { icon: <MousePointer2 size={18} />, label: 'Button' },
    { icon: <ToggleLeft size={18} />, label: 'Switch' },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r flex flex-col h-full">
      <Tabs defaultValue="components" className="flex flex-col h-full">
        <TabsList className="grid grid-cols-4 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-none border-b">
          <TabsTrigger value="components" title="Components"><Box size={18} /></TabsTrigger>
          <TabsTrigger value="store" title="Store"><ShoppingBag size={18} /></TabsTrigger>
          <TabsTrigger value="items" title="Items"><Layers size={18} /></TabsTrigger>
          <TabsTrigger value="apis" title="APIs"><Zap size={18} /></TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="components" className="p-4 m-0 space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">UI Primitives</h3>
              <div className="grid grid-cols-2 gap-2">
                {primitives.map((p, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50/50 cursor-grab transition-all group">
                    <div className="text-slate-400 group-hover:text-blue-600 mb-2">{p.icon}</div>
                    <span className="text-[10px] font-bold text-slate-600">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="store" className="p-4 m-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search Unsplash..." className="pl-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-slate-100 rounded-lg overflow-hidden cursor-grab">
                  <img src={`https://picsum.photos/seed/${i}/200/200`} className="w-full h-full object-cover" alt="Stock" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="items" className="p-4 m-0 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready Patterns</h3>
            <div className="space-y-2">
              {['Auth Flow', 'Checkout', 'Contact Form', 'Pricing Table'].map(item => (
                <div key={item} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-bold flex items-center gap-2">
                  <Layers size={14} className="text-blue-500" /> {item}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="apis" className="p-4 m-0 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connections</h3>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                <BrainCircuit size={16} className="text-purple-500" />
                <div className="text-[10px] font-bold">Gemini AI</div>
              </div>
              <div className="p-3 border rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                <Database size={16} className="text-green-500" />
                <div className="text-[10px] font-bold">Supabase DB</div>
              </div>
              <div className="p-3 border rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                <Lock size={16} className="text-blue-500" />
                <div className="text-[10px] font-bold">Clerk Auth</div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
};

export default LeftPane;