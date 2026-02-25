"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2, BookOpen, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface AddLessonFormProps {
  onSuccess: (lesson: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const AddLessonForm: React.FC<AddLessonFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subject: initialData?.subject || '',
    age_range: initialData?.age_range || '10-12',
    md_content: initialData?.md_content || '',
    image_url: initialData?.image_url || '',
    parts: initialData?.parts || 1,
    is_premium: initialData?.is_premium || false
  });

  const GEMINI_API_KEY = "AIzaSyBtkm6zLXo5gsD547xh8Y_p5FHwDA4ZnaE";

  const handleAiGenerate = async () => {
    if (!formData.title || !formData.subject) {
      showError("Please provide a title and subject first!");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Create a fun, interactive educational lesson for kids aged ${formData.age_range}.
      Topic: ${formData.title}
      Subject: ${formData.subject}
      Format: Markdown with headings, bullet points, and simple explanations.
      Include: A short introduction, 3 key facts, and a small "Did you know?" section.
      Tone: Engaging, encouraging, and easy to understand.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setFormData(prev => ({ ...prev, md_content: generatedText }));
        showSuccess("AI generated the lesson content!");
      } else {
        throw new Error("No content returned from AI");
      }
    } catch (error: any) {
      showError("AI Generation failed: " + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiImprove = async () => {
    if (!formData.md_content) {
      showError("Please write some content first!");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Improve this educational lesson content for kids aged ${formData.age_range}. 
      Make it more engaging, fix any complex words to be simpler, and ensure the markdown formatting is clean.
      
      Content:
      ${formData.md_content}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const improvedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (improvedText) {
        setFormData(prev => ({ ...prev, md_content: improvedText }));
        showSuccess("AI improved your content!");
      }
    } catch (error: any) {
      showError("AI Improvement failed: " + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSuccess(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Lesson Title</Label>
          <Input
            id="title"
            placeholder="e.g. The Magic of Photosynthesis"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="e.g. Science, History, Math"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age_range">Target Age Group</Label>
          <Select 
            value={formData.age_range} 
            onValueChange={(val) => setFormData({ ...formData, age_range: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7-9">Young (7-9)</SelectItem>
              <SelectItem value="10-12">Middle (10-12)</SelectItem>
              <SelectItem value="13-15">Older (13-15)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Cover Image URL</Label>
          <div className="flex gap-2">
            <Input
              id="image_url"
              placeholder="https://..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <div className="bg-slate-100 p-2 rounded border flex items-center justify-center w-10 h-10">
              <ImageIcon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="md_content">Lesson Content (Markdown)</Label>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
              Generate with AI
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAiImprove}
              disabled={aiLoading || !formData.md_content}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wand2 className="h-3 w-3 mr-1" />}
              Improve with AI
            </Button>
          </div>
        </div>
        <Textarea
          id="md_content"
          className="min-h-[300px] font-mono text-sm"
          placeholder="Write your lesson here or use AI to generate it..."
          value={formData.md_content}
          onChange={(e) => setFormData({ ...formData, md_content: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Switch 
            id="premium" 
            checked={formData.is_premium} 
            onCheckedChange={(val) => setFormData({ ...formData, is_premium: val })}
          />
          <Label htmlFor="premium" className="cursor-pointer">Premium Lesson</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="parts">Number of Parts</Label>
          <Input 
            id="parts" 
            type="number" 
            className="w-20" 
            min="1" 
            max="10"
            value={formData.parts}
            onChange={(e) => setFormData({ ...formData, parts: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          {initialData ? 'Update Lesson' : 'Create Lesson'}
        </Button>
      </div>
    </form>
  );
};

export default AddLessonForm;