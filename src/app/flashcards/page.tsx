'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BrainCircuit, Loader2, Wand2, Layers, BookOpen } from 'lucide-react';

import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';
import { generateFromTopic } from '@/ai/flows/generate-from-topic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import FlashcardsDisplay from '@/components/app/flashcards-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

type GenerationMode = 'from-text' | 'from-topic';

interface GeneratedContent {
    flashcards: GenerateFlashcardsOutput['flashcards'];
    image?: string;
}


export default function FlashcardsPage() {
  const [generationMode, setGenerationMode] = useState<GenerationMode>('from-text');
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (generationMode === 'from-text' && !text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Text Required',
        description: 'Please enter some text to generate flashcards.',
      });
      return;
    }

    if (generationMode === 'from-topic' && !topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Topic Required',
        description: 'Please enter a topic to generate flashcards from.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);

    try {
      let result: GeneratedContent;
      if (generationMode === 'from-text') {
        result = await generateFlashcards({ text });
      } else { // from-topic
        const topicResult = await generateFromTopic({ topic });
        result = { flashcards: topicResult.flashcards, image: topicResult.image };
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 space-y-4 flex flex-col items-center">
            <Skeleton className="h-80 w-full max-w-md" />
        </div>
      );
    }

    if (!generatedContent || !generatedContent.flashcards) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">Your flashcards will appear here</h3>
          <p className="text-sm text-muted-foreground">
            Enter some text or a topic to get started.
          </p>
        </div>
      );
    }

    return (
        <>
            {generatedContent.image && (
                 <div className="mb-6 rounded-lg overflow-hidden aspect-video relative w-full max-w-md mx-auto">
                    <Image src={generatedContent.image} alt="Generated cover image" layout="fill" objectFit="cover" data-ai-hint="flashcards"/>
                </div>
            )}
            <FlashcardsDisplay flashcards={generatedContent.flashcards} />
        </>
    );
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
              <CardHeader>
                 <Tabs
                  value={generationMode}
                  onValueChange={(value) => setGenerationMode(value as GenerationMode)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="from-text"><Layers className="mr-2"/>Use my text</TabsTrigger>
                    <TabsTrigger value="from-topic"><BookOpen className="mr-2"/>From a topic</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {generationMode === 'from-text' ? (
                  <>
                    <CardTitle className="mb-2 text-xl">Enter Your Study Material</CardTitle>
                    <CardDescription className="mb-4">Paste your text below to get started.</CardDescription>
                    <Textarea
                        placeholder="Paste your notes, an article, or any text you want to study..."
                        className="min-h-[250px] text-base"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                  </>
                ) : (
                    <>
                    <CardTitle className="mb-2 text-xl">Generate From Topic</CardTitle>
                    <CardDescription className="mb-4">Enter a topic and we'll generate the study materials for you.</CardDescription>
                    <Input
                        placeholder="e.g., 'The basics of photosynthesis'"
                        className="text-base h-12"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                  </>
                )}
              </CardContent>
               <CardFooter>
                 <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Flashcards
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="lg:sticky top-8 min-h-[400px] lg:min-h-[600px] flex flex-col">
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
