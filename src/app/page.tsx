'use client';

import { useState } from 'react';
import { BrainCircuit, FileQuestion, FileText, Layers, Loader2, Wand2 } from 'lucide-react';

import { generateNotes, type GenerateNotesOutput } from '@/ai/flows/generate-notes';
import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import NotesDisplay from '@/components/app/notes-display';
import QuizDisplay from '@/components/app/quiz-display';
import FlashcardsDisplay from '@/components/app/flashcards-display';
import { Skeleton } from '@/components/ui/skeleton';

type MaterialType = 'notes' | 'quiz' | 'flashcards';

export default function Home() {
  const [materialType, setMaterialType] = useState<MaterialType>('notes');
  const [text, setText] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Text Required',
        description: 'Please enter some text to generate study materials.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);

    try {
      let result;
      if (materialType === 'notes') {
        result = await generateNotes({ text });
        setGeneratedContent(result);
      } else if (materialType === 'quiz') {
        result = await generateQuiz({ text });
        setGeneratedContent(result);
      } else if (materialType === 'flashcards') {
        result = await generateFlashcards({ text });
        setGeneratedContent(result);
      }
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
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      );
    }

    if (!generatedContent) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">Your study materials will appear here</h3>
          <p className="text-sm text-muted-foreground">
            Enter some text and choose a material type to get started.
          </p>
        </div>
      );
    }

    switch (materialType) {
      case 'notes':
        return <NotesDisplay notes={generatedContent.notes} />;
      case 'quiz':
        return <QuizDisplay quizData={generatedContent.quiz} />;
      case 'flashcards':
        return <FlashcardsDisplay flashcards={generatedContent.flashcards} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-foreground/90 font-headline flex items-center justify-center gap-3">
            <BrainCircuit className="w-10 h-10 text-primary" />
            StudyWise AI
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Your personal AI-powered study assistant. Paste any text and generate notes, quizzes, or flashcards in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Your Study Material</CardTitle>
                <CardDescription>Paste your text below to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your notes, an article, or any text you want to study..."
                  className="min-h-[250px] text-base"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Choose Material Type</CardTitle>
                <CardDescription>Select what you want to generate.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={materialType}
                  onValueChange={(value) => setMaterialType(value as MaterialType)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="notes"><FileText className="w-4 h-4 mr-2"/>Notes</TabsTrigger>
                    <TabsTrigger value="quiz"><FileQuestion className="w-4 h-4 mr-2"/>Quiz</TabsTrigger>
                    <TabsTrigger value="flashcards"><Layers className="w-4 h-4 mr-2"/>Flashcards</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
              <CardFooter>
                 <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="lg:sticky top-8 min-h-[400px] lg:min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>Your AI-generated study material.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
