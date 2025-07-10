'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BrainCircuit, Loader2, Wand2, MessageCircleQuestion } from 'lucide-react';
import { explainLikeImFive, type ExplainLikeImFiveOutput } from '@/ai/flows/eli5';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import NotesDisplay from '@/components/app/notes-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export default function Eli5Page() {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<ExplainLikeImFiveOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Topic Required',
        description: 'Please enter a topic to explain.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);

    try {
      const result = await explainLikeImFive({ topic });
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
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      );
    }

    if (!generatedContent || !generatedContent.explanation) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">A simple explanation will appear here</h3>
          <p className="text-sm text-muted-foreground">
            Enter a topic to get started.
          </p>
        </div>
      );
    }

    return (
      <>
        {generatedContent.imageHint && (
          <div className="mb-6 rounded-lg overflow-hidden aspect-video relative">
            <Image src={`https://placehold.co/600x400.png`} alt="Generated illustration" layout="fill" objectFit="cover" data-ai-hint={generatedContent.imageHint}/>
          </div>
        )}
        <NotesDisplay notes={generatedContent.explanation} />
      </>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
          <MessageCircleQuestion className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Explain Like I'm 5</h1>
          <p className="text-muted-foreground">Get a super simple explanation for any topic.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="mb-2 text-xl">What do you want to understand?</CardTitle>
              <CardDescription className="mb-4">Enter a topic and we'll break it down for you in the simplest terms.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., 'Quantum computing' or 'Black holes'"
                className="text-base h-12"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
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
          </Card>
        </div>

        <Card className="lg:sticky top-24 min-h-[400px] lg:min-h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Simple Explanation</CardTitle>
            <CardDescription>Here's the topic, simplified.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
