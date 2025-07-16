
'use client';

import { useState, useRef } from 'react';
import { BrainCircuit, Loader2, Wand2, Layers, BookOpen, Upload, Download, FileType, Youtube } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { generateFlashcards, type GenerateFlashcardsOutput, type GenerateFlashcardsInput } from '@/ai/flows/generate-flashcards';
import { generateFromTopic } from '@/ai/flows/generate-from-topic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import FlashcardsDisplay from '@/components/app/flashcards-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { extractTextFromFile } from '@/lib/file-parser';

type InputMode = 'text' | 'topic' | 'youtube';

interface GeneratedContent {
    flashcards: GenerateFlashcardsOutput['flashcards'];
    notes?: string;
    quiz?: { questions: any[] };
    imageHint?: string;
    sourceTopic?: string;
}

// Extend the jsPDF type to include the autoTable method from the plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function FlashcardsPage() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    
    setIsLoading(true);
    setGeneratedContent(null);

    try {
       let result: GeneratedContent;

        if (inputMode === 'topic') {
            if (!topic.trim()) {
                toast({ variant: 'destructive', title: 'Topic is required.' });
                setIsLoading(false);
                return;
            }
            const topicResult = await generateFromTopic({ topic });
            result = {
                flashcards: topicResult.flashcards,
                notes: topicResult.notes,
                quiz: topicResult.quiz,
                imageHint: topicResult.imageHint,
                sourceTopic: topic,
            };
        } else {
            let input: GenerateFlashcardsInput = {};
             if (inputMode === 'text') {
                if (!text.trim()) {
                  toast({ variant: 'destructive', title: 'Text is required.' });
                  setIsLoading(false);
                  return;
                }
                input.text = text;
            } else if (inputMode === 'youtube') {
                if (!youtubeUrl.trim()) {
                  toast({ variant: 'destructive', title: 'YouTube URL is required.' });
                  setIsLoading(false);
                  return;
                }
                input.youtubeUrl = youtubeUrl;
            }
            result = await generateFlashcards(input);
        }

      setGeneratedContent(result);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'An error occurred while generating your content. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

 const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
          const extractedText = await extractTextFromFile(file);
          setText(extractedText);
          setInputMode('text');
          setGeneratedContent(null);
          toast({
            title: 'File Loaded',
            description: 'The text from your file has been loaded.',
          });
      } catch (error) {
        console.error("File upload error:", error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Could not read the file.',
        });
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePdfExport = () => {
    if (!generatedContent?.flashcards) return;

    const doc = new jsPDF() as jsPDFWithAutoTable;
    const flashcardsTitle = generatedContent.sourceTopic ? `Flashcards: ${generatedContent.sourceTopic}` : 'Flashcards';
    
    // Set title
    doc.setFontSize(20);
    doc.text(flashcardsTitle, 14, 22);

    // Create table
    doc.autoTable({
        startY: 30,
        head: [['Question', 'Answer']],
        body: generatedContent.flashcards.map(fc => [fc.question, fc.answer]),
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
        styles: { font: 'helvetica', fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 'auto' },
        },
    });

    const fileName = `studywise-flashcards-${generatedContent.sourceTopic?.replace(/\s+/g, '_') || 'custom'}.pdf`;
    doc.save(fileName);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-4 flex flex-col items-center">
            <Skeleton className="h-80 w-full max-w-md" />
        </div>
      );
    }

    if (!generatedContent || !generatedContent.flashcards || generatedContent.flashcards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">Your flashcards will appear here</h3>
          <p className="text-sm text-muted-foreground">
            Enter some text, a topic, or import a file to get started.
          </p>
        </div>
      );
    }

    return <FlashcardsDisplay flashcards={generatedContent.flashcards} />;
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
          <Layers className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Flashcards</h1>
          <p className="text-muted-foreground">Create interactive flashcards to memorize key info.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
             <Card>
                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)} className="w-full">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="text"><Layers className="mr-2"/>Use my text</TabsTrigger>
                            <TabsTrigger value="topic"><BookOpen className="mr-2"/>From a topic</TabsTrigger>
                            <TabsTrigger value="youtube"><Youtube className="mr-2"/>From YouTube</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="text" className="mt-0">
                             <CardTitle className="mb-2 text-xl">Enter Your Study Material</CardTitle>
                             <CardDescription className="mb-4">Paste your text or import a document below to get started.</CardDescription>
                             <Textarea
                                placeholder="Paste your notes, an article, or any text you want to study..."
                                className="min-h-[250px] text-base"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </TabsContent>
                        <TabsContent value="topic" className="mt-0">
                            <CardTitle className="mb-2 text-xl">Generate From Topic</CardTitle>
                            <CardDescription className="mb-4">Enter a topic and we'll generate the study materials for you.</CardDescription>
                            <Input
                                placeholder="e.g., 'The basics of photosynthesis'"
                                className="text-base h-12"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </TabsContent>
                         <TabsContent value="youtube" className="mt-0">
                            <CardTitle className="mb-2 text-xl">Generate From YouTube</CardTitle>
                            <CardDescription className="mb-4">Enter a YouTube video URL and we'll create flashcards from its transcript.</CardDescription>
                            <Input
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                        </TabsContent>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-2">
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Flashcards
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full sm:w-auto" size="lg" title="Import from file">
                            <Upload className="h-4 w-4" />
                        </Button>
                        <Button onClick={handlePdfExport} disabled={!generatedContent} variant="outline" className="w-full sm:w-auto" size="lg" title="Export to PDF">
                            <FileType className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Tabs>
            </Card>
          </div>

          <Card className="lg:sticky top-24 min-h-[400px] lg:min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Generated Flashcards</CardTitle>
              <CardDescription>Review your key concepts.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
