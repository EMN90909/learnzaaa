"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Block {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button';
  content: string;
  style?: {
    color?: string;
    fontSize?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  // For drag-and-drop
  isDragging?: boolean;
}

const Canvas: React.FC<{
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
  selectedBlockId: string | null;
  onBlockSelect: (id: string) => void;
  isPreview: boolean;
}> = ({ blocks, setBlocks, selectedBlockId, onBlockSelect, isPreview }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('id', id);
    setDraggedId(id);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('id');
    if (sourceId !== targetId) {
      const sourceIndex = blocks.findIndex(b => b.id === sourceId);
      const targetIndex = blocks.findIndex(b => b.id === targetId);
      const newBlocks = [...blocks];
      const [moved] = newBlocks.splice(sourceIndex, 1);
      newBlocks.splice(targetIndex, 0, moved);
      setBlocks(newBlocks);
    }
  };

  // Handle drag enter/leave to highlight drop target
  const handleDragEnter = (e: React.DragEvent, id: string) => {
    if (e.currentTarget.id !== targetId) {
      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  // Render a draggable block
  const renderDraggableBlock = (block: Block) => {
    const isDragging = block.id === draggedId;
    return (
      <div
        key={block.id}
        ref={el => {
          if (el) el.id = `block-${block.id}`;
        }}
        draggable
        onDragStart={e => handleDragStart(e, block.id)}
        onDragEnter={e => handleDragEnter(e, block.id)}
        onDragLeave={e => handleDragLeave(e, block.id)}
        className={cn(
          'p-4 border rounded-lg cursor-move group relative',
          isDragging && 'border-blue-500 bg-blue-50',
          !isPreview && 'group-hover:scale-105 transition-transform'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            {['heading', 'text', 'image', 'button'].includes(block.type) && (
              <div className="text-xs font-bold text-slate-500">
                {block.type === 'heading' ? 'H' : block.type === 'text' ? 'T' : block.type === 'image' ? 'I' : 'B'}
              </div>
            )}
            {block.type === 'image' && (
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <div className="text-blue-600">🖼️</div>
              </div>
            )}
          </div>
          <div className="flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
            {block.content}
          </div>
        </div>
        {isDragging && <div className="absolute -top-4 -right-4 transform rotate-45 text-xs text-white bg-blue-600 px-2 py-1 rounded">Move</div>}
      </div>
    );
  };

  // Render the canvas area
  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 overflow-auto bg-white dark:bg-slate-900 p-6 rounded-t-2xl border-x border-t border-slate-200 dark:border-slate-800 min-h-[800px]",
        isPreview && 'max-w-5xl'
      )}
    >
      {/* AI Suggestion Overlay */}
      {isPreview && (
        <div className="absolute top-12 right-12 z-10 animate-bounce">
          <div className="bg-purple-600 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
            <span className="text-[10px] font-bold">AI: Suggest Layout?</span>
          </div>
        </div>
      )}

      {/* Mock Content */}
      <div className="p-12 space-y-12">
        {blocks.map((block, index) => (
          <div 
            key={block.id}
            ref={el => {
              if (el) el.id = `block-${block.id}`;
            }}
            onClick={() => !isPreview && onBlockSelect(block.id)}
            className={cn(
              "relative group cursor-pointer transition-all",
              selectedBlockId === block.id && "ring-2 ring-blue-500 ring-offset-4 rounded",
              !isPreview && "hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded"
            )}
          >
            <div className={cn(
              "w-full h-full",
              block.type === 'heading' && 'text-center',
              block.type === 'text' && 'text-left',
              block.type === 'image' && 'object-cover',
              block.type === 'button' && 'text-center'
            )}>
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
          </div>
        ))}
        
        {!isPreview && blocks.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-slate-400">
            <Plus className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-sm text-slate-400">Add your first block from the sidebar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;