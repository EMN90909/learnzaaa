"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image as ImageIcon, File as FilePdf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface HomeworkUploadProps {
  learnerId: string;
  lessonId?: string;
  onUploadSuccess: () => void;
}

const HomeworkUpload: React.FC<HomeworkUploadProps> = ({ learnerId, lessonId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (!allowedFileTypes.includes(selectedFile.type)) {
        showError('Please upload only JPG, PNG, or PDF files.');
        return;
      }

      if (selectedFile.size > maxFileSize) {
        showError('File size exceeds 10MB limit.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('homework')
        .upload(`uploads/${learnerId}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(50);

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('homework')
        .getPublicUrl(`uploads/${learnerId}/${fileName}`);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      setUploadProgress(75);

      // Save homework record to database
      const { error: dbError } = await supabase
        .from('homework')
        .insert({
          learner_id: learnerId,
          lesson_id: lessonId,
          file_url: urlData.publicUrl,
          status: 'uploaded',
          review_notes: note,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) {
        throw dbError;
      }

      setUploadProgress(100);

      // Award points for homework upload
      const { error: pointsError } = await supabase.rpc('award_homework_points', {
        learner_id: learnerId
      });

      if (pointsError) {
        console.error('Failed to award points for homework:', pointsError);
      }

      showSuccess('Homework uploaded successfully! +10 points awarded');
      onUploadSuccess();

      // Reset form
      setFile(null);
      setNote('');
      setIsDialogOpen(false);

    } catch (error: any) {
      showError('Failed to upload homework: ' + error.message);
      console.error('Homework upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-gray-400" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (file.type === 'application/pdf') return <FilePdf className="h-8 w-8 text-red-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
          <Upload className="h-4 w-4 mr-2" />
          Upload Homework
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Homework</DialogTitle>
          <DialogDescription>
            Upload your completed homework as JPG, PNG, or PDF (max 10MB)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            <input
              type="file"
              id="homework-upload"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="homework-upload" className="cursor-pointer">
              {getFileIcon()}
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {file ? (
                  <span className="font-medium">{file.name} ({Math.round(file.size / 1024)} KB)</span>
                ) : (
                  'Click to upload or drag and drop'
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG, PDF (max 10MB)
              </p>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homework-note">Optional Note</Label>
            <Input
              id="homework-note"
              placeholder="Any notes for your teacher?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Homework
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HomeworkUpload;