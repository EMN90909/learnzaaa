"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  MousePointer2, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  ArrowLeft,
  Settings2,
  Palette
} from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Block {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button';
  content: string;
  style?: {
    color?: string;
    fontSize?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'heading', content: 'Welcome to My Website!', style: { textAlign: 'center', fontSize: '2.5rem' } },
    { id: '2', type: 'text', content: 'I built this using the Learnzaa Block Builder. It is super easy and fun!', style: { textAlign: 'center' } }
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'image' ? 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800' : `New ${type} block`,
      style: { textAlign: 'left' }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Toolbar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/learner-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-black text-xl text-blue-600">Block Builder</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
            {isPreview ? <Settings2 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isPreview ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => showSuccess('Website Saved!')}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Blocks */}
        {!isPreview && (
          <aside className="w-64 bg-white dark:bg-slate-900 border-r p-4 flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Add Blocks</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="flex-col h-20 gap-2" onClick={() => addBlock('heading')}>
                  <Type className="h-5 w-5" /> <span className="text-xs">Heading</span>
                </Button>
                <Button variant="outline" className="flex-col h-20 gap-2" onClick={() => addBlock('text')}>
                  <Layout className="h-5 w-5" /> <span className="text-xs">Text</span>
                </Button>
                <Button variant="outline" className="flex-col h-20 gap-2" onClick={() => addBlock('image')}>
                  <ImageIcon className="h-5 w-5" /> <span className="text-xs">Image</span>
                </Button>
                <Button variant="outline" className="flex-col h-20 gap-2" onClick={() => addBlock('button')}>
                  <MousePointer2 className="h-5 w-5" /> <span className="text-xs">Button</span>
                </Button>
              </div>
            </div>

            {selectedBlock && (
              <div className="border-t pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Properties</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Content</Label>
                    <Input 
                      value={selectedBlock.content} 
                      onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Alignment</Label>
                    <div className="flex gap-1">
                      {['left', 'center', 'right'].map(align => (
                        <Button 
                          key={align}
                          variant={selectedBlock.style?.textAlign === align ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-[10px] capitalize"
                          onClick={() => updateBlock(selectedBlock.id, { style: { ...selectedBlock.style, textAlign: align as any } })}
                        >
                          {align}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full" onClick={() => deleteBlock(selectedBlock.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Block
                  </Button>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Canvas */}
        <main className="flex-1 overflow-auto p-8 bg-slate-100 dark:bg-slate-950">
          <div className={cn(
            "mx-auto bg-white dark:bg-slate-900 shadow-2xl min-h-full transition-all duration-500",
            isPreview ? "max-w-5xl rounded-none" : "max-w-3xl rounded-xl p-8"
          )}>
            <div className={cn("space-y-4", isPreview && "p-12")}>
              {blocks.map((block) => (
                <div 
                  key={block.id}
                  onClick={() => !isPreview && setSelectedBlockId(block.id)}
                  className={cn(
                    "relative group cursor-pointer transition-all",
                    !isPreview && selectedBlockId === block.id && "ring-2 ring-blue-500 ring-offset-4 rounded",
                    !isPreview && "hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded"
                  )}
                >
                  {block.type === 'heading' && (
                    <h2 style={{ textAlign: block.style?.textAlign, fontSize: block.style?.fontSize }} className="text-4xl font-black">
                      {block.content}
                    </h2>
                  )}
                  {block.type === 'text' && (
                    <p style={{ textAlign: block.style?.textAlign }} className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                      {block.content}
                    </p>
                  )}
                  {block.type === 'image' && (
                    <img src={block.content} alt="User content" className="w-full rounded-lg shadow-md" />
                  )}
                  {block.type === 'button' && (
                    <div style={{ textAlign: block.style?.textAlign }}>
                      <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg rounded-xl">
                        {block.content}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {blocks.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-slate-400">
                  <Plus className="h-12 w-12 mb-2 opacity-20" />
                  <p>Add your first block from the sidebar!</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BuilderPage;