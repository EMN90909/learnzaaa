"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Save, Image as ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface LessonPart {
  id: string;
  lesson_id: string;
  part_number: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface LessonPartsManagerProps {
  lessonId: string;
  initialParts?: number;
  onPartsUpdated?: (partsCount: number) => void;
}

const LessonPartsManager: React.FC<LessonPartsManagerProps> = ({ lessonId, initialParts = 1, onPartsUpdated }) => {
  const [parts, setParts] = useState<LessonPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [editingPart, setEditingPart] = useState<LessonPart | null>(null);
  const [newPartTitle, setNewPartTitle] = useState('');
  const [newPartContent, setNewPartContent] = useState('');
  const [newPartImageUrl, setNewPartImageUrl] = useState('');

  useEffect(() => {
    fetchParts();
  }, [lessonId]);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lesson_parts')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('part_number', { ascending: true });

      if (error) throw error;

      // If no parts exist, create the first one
      if (data && data.length === 0 && initialParts > 0) {
        await createInitialParts(initialParts);
      } else {
        setParts(data || []);
        if (data && data.length > 0) {
          setActiveTab(data[0].part_number.toString());
        }
      }
    } catch (error: any) {
      showError('Failed to fetch lesson parts: ' + error.message);
      console.error('Error fetching lesson parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialParts = async (count: number) => {
    try {
      const newParts = [];
      for (let i = 1; i <= count; i++) {
        const { data, error } = await supabase
          .from('lesson_parts')
          .insert({
            lesson_id: lessonId,
            part_number: i,
            title: `Part ${i}`,
            content: `Content for part ${i}`
          })
          .select()
          .single();

        if (error) throw error;
        newParts.push(data);
      }

      setParts(newParts);
      setActiveTab('1');
      onPartsUpdated?.(count);
      showSuccess(`Created ${count} lesson parts successfully!`);
    } catch (error: any) {
      showError('Failed to create initial parts: ' + error.message);
      console.error('Error creating initial parts:', error);
    }
  };

  const handleAddPart = async () => {
    if (!newPartTitle) {
      showError('Please enter a title for the new part');
      return;
    }

    try {
      const nextPartNumber = parts.length > 0 ? Math.max(...parts.map(p => p.part_number)) + 1 : 1;

      const { data, error } = await supabase
        .from('lesson_parts')
        .insert({
          lesson_id: lessonId,
          part_number: nextPartNumber,
          title: newPartTitle,
          content: newPartContent,
          image_url: newPartImageUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      setParts(prev => [...prev, data]);
      setActiveTab(nextPartNumber.toString());
      setNewPartTitle('');
      setNewPartContent('');
      setNewPartImageUrl('');
      onPartsUpdated?.(parts.length + 1);

      showSuccess('New part added successfully!');
    } catch (error: any) {
      showError('Failed to add new part: ' + error.message);
      console.error('Error adding new part:', error);
    }
  };

  const handleUpdatePart = async () => {
    if (!editingPart) return;

    try {
      const { data, error } = await supabase
        .from('lesson_parts')
        .update({
          title: editingPart.title,
          content: editingPart.content,
          image_url: editingPart.image_url
        })
        .eq('id', editingPart.id)
        .select()
        .single();

      if (error) throw error;

      setParts(prev => prev.map(p => p.id === data.id ? data : p));
      setEditingPart(null);
      showSuccess('Part updated successfully!');
    } catch (error: any) {
      showError('Failed to update part: ' + error.message);
      console.error('Error updating part:', error);
    }
  };

  const handleDeletePart = async (partId: string) => {
    if (!window.confirm('Are you sure you want to delete this part?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lesson_parts')
        .delete()
        .eq('id', partId);

      if (error) throw error;

      setParts(prev => prev.filter(p => p.id !== partId));
      onPartsUpdated?.(parts.length - 1);
      showSuccess('Part deleted successfully!');
    } catch (error: any) {
      showError('Failed to delete part: ' + error.message);
      console.error('Error deleting part:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center">
        <CardContent>
          <p className="text-gray-600">Loading lesson parts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Lesson Parts Manager
        </CardTitle>
        <CardDescription>
          Manage multi-part lessons. Each part can have its own content and images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap gap-2">
            {parts.map((part) => (
              <TabsTrigger
                key={part.id}
                value={part.part_number.toString()}
                className="flex items-center gap-2"
              >
                Part {part.part_number}
                {editingPart?.id === part.id && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Editing</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {parts.map((part) => (
            <TabsContent key={part.id} value={part.part_number.toString()}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{part.title}</h3>
                  <div className="flex gap-2">
                    {editingPart?.id === part.id ? (
                      <Button
                        onClick={handleUpdatePart}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setEditingPart(part)}
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeletePart(part.id)}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {part.image_url && (
                  <div className="mb-4">
                    <img
                      src={part.image_url}
                      alt={part.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {editingPart?.id === part.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="part-title">Title</Label>
                      <Input
                        id="part-title"
                        value={editingPart.title}
                        onChange={(e) => setEditingPart({...editingPart, title: e.target.value})}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="part-image-url">Image URL (optional)</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          id="part-image-url"
                          value={editingPart.image_url || ''}
                          onChange={(e) => setEditingPart({...editingPart, image_url: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button variant="outline" size="icon">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {editingPart.image_url && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                          <img
                            src={editingPart.image_url}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="part-content">Content (Markdown)</Label>
                      <Textarea
                        id="part-content"
                        value={editingPart.content}
                        onChange={(e) => setEditingPart({...editingPart, content: e.target.value})}
                        className="min-h-[200px] font-mono mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none border p-4 rounded bg-gray-50">
                    <MarkdownRenderer content={part.content} ageGroup="middle" />
                  </div>
                )}
              </div>
            </TabsContent>
          ))}

          {/* Add New Part Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" /> Add New Part
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-part-title">Title</Label>
                <Input
                  id="new-part-title"
                  placeholder="Part title"
                  value={newPartTitle}
                  onChange={(e) => setNewPartTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="new-part-image-url">Image URL (optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="new-part-image-url"
                    placeholder="https://example.com/image.jpg"
                    value={newPartImageUrl}
                    onChange={(e) => setNewPartImageUrl(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="new-part-content">Content (Markdown)</Label>
                <Textarea
                  id="new-part-content"
                  placeholder="Write your content in Markdown format..."
                  value={newPartContent}
                  onChange={(e) => setNewPartContent(e.target.value)}
                  className="min-h-[150px] font-mono"
                />
              </div>

              <Button
                onClick={handleAddPart}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {parts.length} part{parts.length !== 1 ? 's' : ''} in this lesson
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={activeTab === '1'}
            onClick={() => {
              const currentIndex = parts.findIndex(p => p.part_number.toString() === activeTab);
              if (currentIndex > 0) {
                setActiveTab(parts[currentIndex - 1].part_number.toString());
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={activeTab === parts[parts.length - 1]?.part_number.toString()}
            onClick={() => {
              const currentIndex = parts.findIndex(p => p.part_number.toString() === activeTab);
              if (currentIndex < parts.length - 1) {
                setActiveTab(parts[currentIndex + 1].part_number.toString());
              }
            }}
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonPartsManager;