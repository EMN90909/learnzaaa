"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image as ImageIcon, File as FilePdf, Loader2, Lightbulb, Copy, Check, AlertTriangle, Files, X, Camera, GraduationCap, PartyPopper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [isAIHelperOpen, setIsAIHelperOpen] = useState(false);
  const [images, setImages] = useState<{id: string, url: string, base64: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [status, setStatus] = useState("");
  const [guide, setGuide] = useState("");
  const [challengeResponse, setChallengeResponse] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [apiCallLimitReached, setApiCallLimitReached] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const apiKey = "AIzaSyBSVH4sgrNFKRXjnDiCZAQM-HZv17HO3FQ";

  const checkApiCallLimit = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tier, daily_api_calls, max_daily_api_calls')
        .eq('id', learnerId)
        .single();

      if (profileError) {
        console.error('Error checking API call limit:', profileError);
        return true; // Allow if we can't check
      }

      const isPaidUser = profileData.tier === 'premium';
      const currentCalls = profileData.daily_api_calls || 0;
      const maxCalls = profileData.max_daily_api_calls || (isPaidUser ? 50 : 2);

      if (currentCalls >= maxCalls) {
        setApiCallLimitReached(true);
        showError(`API call limit reached! ${isPaidUser ? 'Paid users' : 'Free users'} can make up to ${maxCalls} calls per day.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking API call limit:', error);
      return true; // Allow if there's an error
    }
  };

  const incrementApiCallCount = async () => {
    try {
      const { error } = await supabase.rpc('increment_api_call_count', {
        user_id: learnerId
      });

      if (error) {
        console.error('Error incrementing API call count:', error);
      }
    } catch (error) {
      console.error('Error incrementing API call count:', error);
    }
  };

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

  const handleAIHelperFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check API call limit before processing
    const canProceed = await checkApiCallLimit();
    if (!canProceed) return;

    setError("");
    setGuide("");
    setChallengeResponse("");

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string)?.split(',')[1];
        setImages(prev => [
          ...prev,
          { id: Math.random().toString(36).substr(2, 9), url: event.target?.result as string, base64: base64 }
        ]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (images.length <= 1) {
      setGuide("");
      setChallengeResponse("");
    }
  };

  const getHomeworkHelp = async () => {
    if (images.length === 0) return;

    // Check API call limit
    const canProceed = await checkApiCallLimit();
    if (!canProceed) return;

    setLoading(true);
    setError("");
    setChallengeResponse("");
    setStatus(`Analyzing ${images.length} page${images.length > 1 ? 's' : ''}...`);

    const imageParts = images.map(img => ({
      inlineData: { mimeType: "image/png", data: img.base64 }
    }));

    const payload = {
      contents: [{
        parts: [
          {
            text: `Read these assignment pages.
            INSTRUCTIONS:
            1. Combine the information from all images into one cohesive guide.
            2. Break down the answers into EXTREMELY SIMPLE, bite-sized steps.
            3. Use a tone that a child could understand.
            4. If there are tables or data, use Markdown table format.
            5. Explain concepts using bold text with double asterisks for key terms but keep the overall explanation very short.
            6. Leave exactly one or two small steps as a 'challenge' for the student to solve on their own.
            7. Provide a clear, simple guide.`
          },
          ...imageParts
        ]
      }]
    };

    await callGemini(payload, setGuide, setLoading);
    await incrementApiCallCount(); // Increment API call count after successful call
  };

  const revealChallenge = async () => {
    if (!guide) return;

    // Check API call limit
    const canProceed = await checkApiCallLimit();
    if (!canProceed) return;

    setRevealing(true);
    setError("");

    const payload = {
      contents: [{
        parts: [
          {
            text: `I am using your previous study guide: "${guide}".
            INSTRUCTIONS:
            Now, reveal the final answers/steps that were left as a 'challenge'.
            Use EXTREMELY SIMPLE language.
            Use double asterisks (**) for key terms and dashes (-) for list items.
            Keep it short and encouraging!`
          }
        ]
      }]
    };

    await callGemini(payload, setChallengeResponse, setRevealing);
    await incrementApiCallCount(); // Increment API call count after successful call
  };

  const callGemini = async (payload: any, onSuccess: (text: string) => void, setLoader: (loading: boolean) => void) => {
    let attempt = 0;
    const maxRetries = 3;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('API request failed');

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          onSuccess(text);
          setLoader(false);
          return;
        } else {
          throw new Error('No content returned from AI.');
        }
      } catch (err) {
        if (attempt === maxRetries) {
          setError("Something went wrong. Please try again.");
          setLoader(false);
          break;
        }
        await delay(Math.pow(2, attempt) * 1000);
        attempt++;
      }
    }
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = `${guide}\n\n--- CHALLENGE REVEAL ---\n${challengeResponse}`;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const parseInline = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 bg-blue-50 px-1 rounded">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    const elements: JSX.Element[] = [];
    let tableBuffer: string[] = [];
    let isInsideTable = false;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        isInsideTable = true;
        tableBuffer.push(line);
      } else {
        if (isInsideTable) {
          elements.push(renderTable(tableBuffer, `table-${idx}`));
          tableBuffer = [];
          isInsideTable = false;
        }

        if (line.startsWith('###')) {
          elements.push(
            <h3 key={idx} className="text-lg font-bold mt-4 mb-2 text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              {parseInline(line.replace('###', '').trim())}
            </h3>
          );
        } else if (line.startsWith('##')) {
          elements.push(
            <h2 key={idx} className="text-xl font-bold mt-6 mb-3 text-blue-800 border-b border-blue-100 pb-1">
              {parseInline(line.replace('##', '').trim())}
            </h2>
          );
        } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[-*]\s*/, "");
          elements.push(
            <li key={idx} className="ml-6 mb-2 list-none relative text-slate-700">
              <span className="absolute -left-4 text-blue-400">•</span>
              {parseInline(content)}
            </li>
          );
        } else if (trimmed !== "") {
          elements.push(<p key={idx} className="mb-3 text-slate-700 leading-relaxed">{parseInline(line)}</p>);
        } else {
          elements.push(<div key={idx} className="h-2"></div>);
        }
      }
    });

    if (isInsideTable) elements.push(renderTable(tableBuffer, 'table-end'));
    return elements;
  };

  const renderTable = (rows: string[], key: string) => {
    const parsedRows = rows.map(row =>
      row.split('|').filter((cell, i, arr) => (i > 0 && i < arr.length - 1)).map(cell => cell.trim())
    );
    const cleanRows = parsedRows.filter(row => !row.every(cell => cell.includes('---')));
    return (
      <div key={key} className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {cleanRows[0]?.map((header, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {parseInline(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {cleanRows.slice(1).map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-slate-600">
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-gray-400" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (file.type === 'application/pdf') return <FilePdf className="h-8 w-8 text-red-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <>
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
            {apiCallLimitReached && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-700 flex items-center gap-2">
                  <AlertTriangle className="text-yellow-600" />
                  API call limit reached! Please upgrade to premium for more calls.
                </p>
              </div>
            )}

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

            <div className="flex justify-between items-center">
              <Button
                onClick={() => setIsAIHelperOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
                disabled={apiCallLimitReached}
              >
                <Lightbulb className="h-4 w-4" />
                Get Help with Work
              </Button>

              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-green-600 hover:bg-green-700 text-white"
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

            {isUploading && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading...</p>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Homework Helper Dialog */}
      <Dialog open={isAIHelperOpen} onOpenChange={setIsAIHelperOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="text-blue-600" /> Homework Helper
            </DialogTitle>
            <DialogDescription>
              Scan multiple pages for a full guide!
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-120px)]">
            <div className="min-h-[500px] bg-[#f1f5f9] flex flex-col items-center py-8 px-4 font-sans text-slate-900">
              <div className="w-full max-w-3xl">
                {apiCallLimitReached && (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 flex items-center gap-2">
                      <AlertTriangle className="text-yellow-600" />
                      API call limit reached! Free users can make 2 calls/day, paid users 50 calls/day.
                    </p>
                  </div>
                )}

                <div className="flex flex-col items-center mb-10 text-center">
                  <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 mb-4 text-white">
                    <GraduationCap size={32} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-slate-900">Homework Helper</h1>
                  <p className="text-slate-500 mt-2 text-lg font-medium">Scan multiple pages for a full guide!</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-300/50 border border-white overflow-hidden">
                  <div
                    className={`p-6 md:p-10 border-4 border-dashed m-4 rounded-[1.5rem] transition-all flex flex-col items-center justify-center
                      ${images.length > 0 ? 'border-blue-100 bg-blue-50/10' : 'border-slate-100 bg-white'}`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAIHelperFileChange}
                      className="hidden"
                      accept="image/*"
                      multiple
                      disabled={apiCallLimitReached}
                    />

                    {images.length === 0 ? (
                      <div
                        onClick={() => !apiCallLimitReached && fileInputRef.current?.click()}
                        className={`flex flex-col items-center cursor-pointer py-10 ${apiCallLimitReached ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <div className="bg-blue-600 p-4 rounded-full shadow-lg text-white mb-4 animate-pulse">
                          <Upload size={32} />
                        </div>
                        <p className="text-xl font-bold text-slate-700 text-center">Tap to upload photos</p>
                        <p className="text-sm text-slate-400 mt-1 font-medium">You can select multiple files at once</p>
                        {apiCallLimitReached && (
                          <p className="text-sm text-red-500 mt-2">API limit reached. Please upgrade to continue.</p>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex flex-wrap gap-4 justify-center mb-8">
                          {images.map((img) => (
                            <div key={img.id} className="relative group animate-in zoom-in-50 duration-300">
                              <img
                                src={img.url}
                                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl shadow-md border-2 border-white"
                                alt="Thumbnail"
                              />
                              <button
                                onClick={() => removeImage(img.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => !apiCallLimitReached && fileInputRef.current?.click()}
                            className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-400 hover:bg-blue-50 transition-all"
                            disabled={apiCallLimitReached}
                          >
                            <Upload size={24} />
                            <span className="text-xs font-bold mt-1">Add More</span>
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <button
                            onClick={() => setImages([])}
                            className="px-5 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={getHomeworkHelp}
                            disabled={loading || images.length === 0 || apiCallLimitReached}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                          >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Files size={18} />}
                            {loading ? "Analyzing..." : `Help with ${images.length} Page${images.length > 1 ? 's' : ''}`}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {loading && (
                    <div className="px-8 pb-10 text-center animate-in fade-in duration-500">
                      <div className="flex justify-center mb-4"><div className="bg-blue-100 p-3 rounded-full"><Lightbulb className="text-blue-600 animate-pulse" size={24} /></div></div>
                      <p className="text-slate-600 font-bold text-lg">{status}</p>
                    </div>
                  )}

                  {error && (
                    <div className="mx-8 mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 flex items-center gap-3"><AlertTriangle size={24} /><p className="font-bold">{error}</p></div>
                  )}

                  {guide && !loading && (
                    <div className="p-8 border-t border-slate-50 bg-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3"><div className="w-3 h-10 bg-blue-600 rounded-full"></div>Study Guide</h2>
                        <button onClick={copyToClipboard} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-bold text-sm shadow-sm ${copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                          {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "Copied!" : "Copy Everything"}
                        </button>
                      </div>

                      <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-8">
                        <div className="prose prose-slate max-w-none">
                          {renderFormattedText(guide)}
                        </div>
                      </div>

                      {!challengeResponse ? (
                        <button
                          onClick={revealChallenge}
                          disabled={revealing || apiCallLimitReached}
                          className="w-full mt-4 p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group hover:bg-blue-700 transition-all active:scale-[0.98]"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform">
                            {revealing ? <Loader2 className="animate-spin" size={64} /> : <Lightbulb size={64} />}
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <h4 className="font-black text-xl mb-1 flex items-center gap-2">
                              Ready for the Challenge? {revealing && "..."}
                            </h4>
                            <p className="text-blue-50 font-medium">
                              {revealing ? "Checking my notes..." : "I've left a tiny bit for you. Click here to check the final steps! 🚀"}
                            </p>
                            {apiCallLimitReached && (
                              <p className="text-red-500 text-sm mt-1">API limit reached. Please upgrade to continue.</p>
                            )}
                          </div>
                        </button>
                      ) : (
                        <div className="mt-4 p-6 bg-green-50 border-2 border-green-200 rounded-[2rem] animate-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-500 p-2 rounded-full text-white"><PartyPopper size={20} /></div>
                            <h4 className="font-black text-green-800 text-xl text-left">The Reveal!</h4>
                          </div>
                          <div className="prose prose-green max-w-none text-green-900 text-left">
                            {renderFormattedText(challengeResponse)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomeworkUpload;