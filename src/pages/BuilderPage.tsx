import React, { useState } from 'react';
import BuilderHeader from '../components/builder/BuilderHeader';
import LeftPane from '../components/builder/LeftPane';
import MiddlePane from '../components/builder/MiddlePane';
import Canvas from './Canvas';

const BuilderPage: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [blocks, setBlocks] = useState<any[]>([
    { id: '1', type: 'heading', content: 'Welcome to My Website!', style: { textAlign: 'center', fontSize: '2.5rem' } },
    { id: '2', type: 'text', content: 'I built this using the Learnzaa Block Builder. It is super easy and fun!', style: { textAlign: 'center' } }
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleCreateProject = (name: string) => {
    setActiveProject(name);
    setView('editor');
  };

  const handleOpenProject = (id: string) => {
    setActiveProject("Existing Project");
    setView('editor');
  };

  const handleBlockSelect = (id: string) => {
    setSelectedBlockId(id);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950">
      <BuilderHeader 
        projectName={activeProject || "Untitled Project"} 
        onBack={() => setView('dashboard')} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftPane />
        <MiddlePane />
        <div className="flex-1">
          <Canvas 
            blocks={blocks} 
            setBlocks={setBlocks} 
            selectedBlockId={selectedBlockId} 
            onBlockSelect={handleBlockSelect} 
            isPreview={isPreview} 
          />
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;