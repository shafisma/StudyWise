'use client';

import { useState, useRef } from 'react';
import { BrainCircuit, Loader2, Wand2, MessageCircleQuestion, FileText, Upload, Youtube, FileType } from 'lucide-react';
import { explainLikeImFive, type ExplainLikeImFiveOutput, type ExplainLikeImFiveInput } from '@/ai/flows/eli5';
import { extractTextFromFile } from '@/lib/file-parser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import NotesDisplay from '@/components/app/notes-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type Difficulty = 'easy' | 'medium' | 'hard';
type InputMode = 'text' | 'file' | 'image' | 'youtube';

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export default function Eli5Page() {
  const [inputText, setInputText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  
  const [generatedContent, setGeneratedContent] = useState<ExplainLikeImFiveOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    let input: ExplainLikeImFiveInput = { difficulty };
    
    switch (inputMode) {
      case 'text':
        if (!inputText.trim()) {
          toast({ variant: 'destructive', title: 'Text is required.' });
          return;
        }
        input.text = inputText;
        break;
      case 'file':
        const docFile = docInputRef.current?.files?.[0];
        if (!docFile) {
            toast({ variant: 'destructive', title: 'A document file is required.' });
            return;
        }
        try {
            const extractedText = await extractTextFromFile(docFile);
            if (!extractedText.trim()) {
                toast({ variant: 'destructive', title: 'Could not extract text from file.' });
                return;
            }
            input.text = extractedText;
        } catch (err) {
            toast({ variant: 'destructive', title: 'Failed to read file', description: err instanceof Error ? err.message : 'Unknown error' });
            return;
        }
        break;
      case 'youtube':
        if (!youtubeUrl.trim()) {
          toast({ variant: 'destructive', title: 'YouTube URL is required.' });
          return;
        }
        input.youtubeUrl = youtubeUrl;
        break;
      case 'image':
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
          toast({ variant: 'destructive', title: 'An image file is required.' });
          return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast({ variant: 'destructive', title: 'Unsupported file type. Please upload a PNG or JPG.' });
          return;
        }
        input.imageDataUri = await fileToDataURL(file);
        break;
    }


    setIsLoading(true);
    setGeneratedContent(null);

    try {
      const result = await explainLikeImFive(input);
      setGeneratedContent(result);
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'An error occurred while generating your explanation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex items-center justify-center pt-8">
             <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Reading & Explaining...</p>
             </div>
          </div>
        </div>
      );
    }

    if (!generatedContent || !generatedContent.explanation) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">Your explanation will appear here</h3>
          <p className="text-sm text-muted-foreground">
            Provide some content and select a difficulty to get started.
          </p>
        </div>
      );
    }

    return <NotesDisplay notes={generatedContent.explanation} onPlayAudio={() => {}} isSynthesizing={null} />;
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
          <MessageCircleQuestion className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Concept Explainer</h1>
          <p className="text-muted-foreground">Get a tailored explanation for any topic from any source.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card>
            <Tabs
              value={inputMode}
              onValueChange={(value) => setInputMode(value as InputMode)}
              className="w-full"
            >
              <CardHeader>
                <CardTitle className="mb-2 text-xl">What do you want to understand?</CardTitle>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" />Text</TabsTrigger>
                    <TabsTrigger value="file"><FileType className="mr-2 h-4 w-4" />File</TabsTrigger>
                    <TabsTrigger value="image"><Upload className="mr-2 h-4 w-4" />Image</TabsTrigger>
                    <TabsTrigger value="youtube"><Youtube className="mr-2 h-4 w-4" />YouTube</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="space-y-4">
                 <TabsContent value="text" className="mt-0">
                    <Textarea
                        placeholder="Paste text here to explain..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[200px]"
                    />
                </TabsContent>
                <TabsContent value="file" className="mt-0">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="doc-file">Document (PDF/DOCX/TXT)</Label>
                        <Input id="doc-file" type="file" ref={docInputRef} accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Upload a document to extract text for explanation.</p>
                </TabsContent>
                <TabsContent value="image" className="mt-0">
                    <Input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/webp"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Upload an image containing text to explain.</p>
                </TabsContent>
                <TabsContent value="youtube" className="mt-0">
                    <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Enter a YouTube video URL to explain its content.</p>
                </TabsContent>

                <div>
                  <Label htmlFor="difficulty-select">Difficulty</Label>
                    <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)}>
                      <SelectTrigger id="difficulty-select" className="h-12 mt-1">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy (Explain Like I'm 5)</SelectItem>
                        <SelectItem value="medium">Medium (High School)</SelectItem>
                        <SelectItem value="hard">Hard (College Level)</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Explain Topic
                </Button>
              </CardFooter>
            </Tabs>
          </Card>
        </div>

        <Card className="lg:sticky top-24 min-h-[400px] lg:min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Generated Explanation</CardTitle>
            <CardDescription>Here's the topic, explained for you.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
