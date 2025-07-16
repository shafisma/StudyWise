
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit,
  Loader2,
  Wand2,
  FileText,
  BookOpen,
  Upload,
  FileType,
  Volume2,
  Image as ImageIcon,
  Youtube
} from 'lucide-react';
import jsPDF from 'jspdf';
import Image from 'next/image';

import { generateNotes, type GenerateNotesInput } from '@/ai/flows/generate-notes';
import { generateFromTopic } from '@/ai/flows/generate-from-topic';
import { searchUnsplashImage } from '@/services/unsplash';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import NotesDisplay from '@/components/app/notes-display';
import { Skeleton } from '@/components/ui/skeleton';
import { extractTextFromFile } from '@/lib/file-parser';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import AudioPlayer from '@/components/app/audio-player';

type InputMode = 'from-text' | 'from-topic' | 'from-youtube';

interface GeneratedContent {
  notes?: string;
  quiz?: { questions: any[] };
  flashcards?: any[];
  imageHint?: string;
  sourceTopic?: string;
}

export default function NotesPage() {
  const [inputMode, setInputMode] = useState<InputMode>('from-text');
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (inputMode === 'from-topic' && generatedContent?.imageHint) {
      const fetchImage = async () => {
        setIsGeneratingImage(true);
        try {
          const resultUrl = await searchUnsplashImage(generatedContent.imageHint!);
          setImageUrl(resultUrl);
        } catch (error) {
          console.error("Image fetch failed:", error);
           toast({
              variant: 'destructive',
              title: 'Image Fetch Failed',
              description: 'Could not load a cover image from Unsplash. Please check your API key.',
           });
        } finally {
          setIsGeneratingImage(false);
        }
      };
      fetchImage();
    }
  }, [generatedContent, inputMode, toast]);

  const handlePlayAudio = async (textToPlay: string, id: string) => {
    if (isSynthesizing) return; 

    setIsSynthesizing(id);
    setAudioSrc(null);

    try {
      const { audioDataUri } = await textToSpeech({ text: textToPlay });
      setAudioSrc(audioDataUri);
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      toast({
        variant: 'destructive',
        title: 'Audio Failed',
        description: 'Could not generate audio for this section.',
      });
    } finally {
      setIsSynthesizing(null);
    }
  };
  
  const resetState = () => {
    setGeneratedContent(null);
    setImageUrl(null);
    setAudioSrc(null);
    setIsGeneratingImage(false);
  }

  const handleGenerate = async () => {
    setIsLoading(true);
    resetState();

    try {
      let result: GeneratedContent;
      if (inputMode === 'from-topic') {
        if (!topic.trim()) {
            toast({ variant: 'destructive', title: 'Topic is required.' });
            setIsLoading(false);
            return;
        }
        const topicResult = await generateFromTopic({ topic });
        result = {
          notes: topicResult.notes,
          quiz: topicResult.quiz,
          flashcards: topicResult.flashcards,
          imageHint: topicResult.imageHint,
          sourceTopic: topic,
        };
      } else {
        let notesInput: GenerateNotesInput = {};
        if (inputMode === 'from-text') {
            if (!text.trim()) {
                toast({ variant: 'destructive', title: 'Input Text Required' });
                setIsLoading(false);
                return;
            }
            notesInput.text = text;
        } else if (inputMode === 'from-youtube') {
            if (!youtubeUrl.trim()) {
                toast({ variant: 'destructive', title: 'YouTube URL is required.' });
                setIsLoading(false);
                return;
            }
            notesInput.youtubeUrl = youtubeUrl;
        }
        result = await generateNotes(notesInput);
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
        setInputMode('from-text');
        resetState();
        toast({
          title: 'File Loaded',
          description: 'The text from your file has been loaded.',
        });
      } catch (error) {
        console.error('File upload error:', error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Could not read the file.',
        });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePdfExport = () => {
    if (!generatedContent?.notes) return;

    const doc = new jsPDF();
    const notesTitle = generatedContent.sourceTopic
      ? `Notes: ${generatedContent.sourceTopic}`
      : 'Generated Notes';

    doc.setFontSize(20);
    doc.text(notesTitle, 14, 22);

    const plainText = generatedContent.notes
      .replace(/###\\s/g, '')
      .replace(/##\\s/g, '')
      .replace(/#\\s/g, '')
      .replace(/\\*\\*/g, '')
      .replace(/\\*/g, '')
      .replace(/`/g, '');

    const lines = doc.splitTextToSize(plainText, 180);
    doc.setFontSize(12);
    doc.text(lines, 14, 32);

    const fileName = `studywise-notes-${
      generatedContent.sourceTopic?.replace(/\\s+/g, '_') || 'custom'
    }.pdf`;
    doc.save(fileName);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      );
    }

    if (!generatedContent?.notes) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">Your study notes will appear here</h3>
          <p className="text-sm text-muted-foreground">
            Enter some text, a topic, or import a file to get started.
          </p>
        </div>
      );
    }

    return (
      <NotesDisplay
        notes={generatedContent.notes}
        onPlayAudio={handlePlayAudio}
        isSynthesizing={isSynthesizing}
      />
    );
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Notes</h1>
          <p className="text-muted-foreground">Summarize text or create notes from a topic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start flex-1">
        {/* Left panel */}
        <div className="space-y-6">
          <Card>
            <Tabs
              value={inputMode}
              onValueChange={(value) => {
                setInputMode(value as InputMode);
                resetState();
              }}
              className="w-full"
            >
              <CardHeader>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="from-text">
                    <FileText className="mr-2" />
                    Use my text
                  </TabsTrigger>
                  <TabsTrigger value="from-topic">
                    <BookOpen className="mr-2" />
                    From a topic
                  </TabsTrigger>
                   <TabsTrigger value="from-youtube">
                    <Youtube className="mr-2" />
                    From YouTube
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="from-text" className="mt-0">
                  <CardTitle className="mb-2 text-xl">Enter Your Study Material</CardTitle>
                  <CardDescription className="mb-4">
                    Paste your text or import a document below to get started.
                  </CardDescription>
                  <Textarea
                    placeholder="Paste your notes, an article, or any text you want to study..."
                    className="min-h-[250px] text-base"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="from-topic" className="mt-0">
                  <CardTitle className="mb-2 text-xl">Generate From Topic</CardTitle>
                  <CardDescription className="mb-4">
                    Enter a topic and we'll generate the study materials for you.
                  </CardDescription>
                  <Input
                    placeholder="e.g., 'The basics of photosynthesis'"
                    className="text-base h-12"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </TabsContent>
                 <TabsContent value="from-youtube" className="mt-0">
                  <CardTitle className="mb-2 text-xl">Generate From YouTube</CardTitle>
                  <CardDescription className="mb-4">
                    Enter a YouTube video URL and we'll generate notes from its transcript.
                  </CardDescription>
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
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Notes
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full sm:w-auto"
                  size="lg"
                  title="Import from file"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handlePdfExport}
                  disabled={!generatedContent?.notes}
                  variant="outline"
                  className="w-full sm:w-auto"
                  size="lg"
                  title="Export to PDF"
                >
                  <FileType className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Tabs>
          </Card>

          <AudioPlayer src={audioSrc} onEnded={() => setAudioSrc(null)} />
        </div>

        {/* Right panel */}
        <Card className="lg:sticky top-24 flex-1 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Generated Notes</CardTitle>
                    <CardDescription>{generatedContent?.sourceTopic ? `Notes on ${generatedContent.sourceTopic}` : 'Your AI-generated notes.'}</CardDescription>
                </div>
                {generatedContent?.notes && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlayAudio(generatedContent.notes!, 'full-notes')}
                        disabled={!!isSynthesizing}
                    >
                        {isSynthesizing === 'full-notes' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Volume2 className="mr-2 h-4 w-4" />
                        )}
                        Listen to All
                    </Button>
                )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {isGeneratingImage ? (
              <Skeleton className="w-full h-48 rounded-lg" />
            ) : imageUrl ? (
              <div className="mb-4">
                <Image
                    src={imageUrl}
                    alt={generatedContent?.sourceTopic || "Generated image"}
                    width={500}
                    height={300}
                    className="w-full h-auto object-cover rounded-lg"
                 />
              </div>
            ) : null}
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
