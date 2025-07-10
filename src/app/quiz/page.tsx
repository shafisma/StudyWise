'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { BrainCircuit, Loader2, Wand2, FileQuestion, BookOpen, Upload, Download } from 'lucide-react';

import { generateQuiz, type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { generateFromTopic, type GenerateFromTopicOutput } from '@/ai/flows/generate-from-topic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import QuizDisplay from '@/components/app/quiz-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

type GenerationMode = 'from-text' | 'from-topic';

interface GeneratedContent {
    notes?: string;
    quiz: { questions: GenerateQuizOutput['questions'] };
    flashcards?: any[];
    imageHint?: string;
    sourceTopic?: string;
}

export default function QuizPage() {
  const [generationMode, setGenerationMode] = useState<GenerationMode>('from-text');
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (generationMode === 'from-text' && !text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Text Required',
        description: 'Please enter some text to generate a quiz.',
      });
      return;
    }

    if (generationMode === 'from-topic' && !topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Topic Required',
        description: 'Please enter a topic to generate a quiz from.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);

    try {
      let result: GeneratedContent;
      if (generationMode === 'from-text') {
        const textResult = await generateQuiz({ text });
        result = { quiz: { questions: textResult.questions } }
      } else { // from-topic
        const topicResult = await generateFromTopic({ topic });
        if (topicResult.quiz && topicResult.quiz.questions) {
           result = { 
                notes: topicResult.notes,
                quiz: topicResult.quiz,
                flashcards: topicResult.flashcards,
                imageHint: topicResult.imageHint,
                sourceTopic: topic,
            };
        } else {
          throw new Error("Quiz could not be generated from the topic.");
        }
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
           if (!content.quiz || !content.quiz.questions) {
            throw new Error("Invalid file format: missing quiz data.");
          }
          setGeneratedContent(content);
          if (content.sourceTopic) {
              setTopic(content.sourceTopic);
              setGenerationMode('from-topic');
          } else {
              setGenerationMode('from-text');
              const combinedText = content.quiz.questions.map((q: any) => `${q.question} ${q.options.join(' ')}`).join('\n');
              setText(combinedText);
          }
           toast({
            title: 'Content Loaded',
            description: 'Your study materials have been imported.',
          });
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: 'The selected file is not a valid StudyWise JSON file.',
          });
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleFileExport = () => {
    if (!generatedContent) return;
    const blob = new Blob([JSON.stringify(generatedContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studywise-quiz-${generatedContent.sourceTopic || 'custom'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const saveQuizResult = (score: number, totalQuestions: number) => {
    const result = {
      topic: generationMode === 'from-topic' ? topic : 'Custom Text',
      score,
      totalQuestions,
      date: new Date().toISOString(),
    };
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    history.push(result);
    localStorage.setItem('quizHistory', JSON.stringify(history));
  }


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

    if (!generatedContent || !generatedContent.quiz || !generatedContent.quiz.questions) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">Your quiz will appear here</h3>
          <p className="text-sm text-muted-foreground">
            Enter some text, a topic, or import a file to get started.
          </p>
        </div>
      );
    }

    return (
        <>
            {generatedContent.imageHint && (
                <div className="mb-6 rounded-lg overflow-hidden aspect-video relative">
                    <Image src={`https://placehold.co/600x400.png`} alt="Generated cover image" layout="fill" objectFit="cover" data-ai-hint={generatedContent.imageHint}/>
                </div>
            )}
            <QuizDisplay questions={generatedContent.quiz.questions} onQuizSubmit={saveQuizResult} />
        </>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6">
       <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
          <FileQuestion className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate Quiz</h1>
          <p className="text-muted-foreground">Test your knowledge on any topic.</p>
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
                    <TabsTrigger value="from-text"><FileQuestion className="mr-2"/>Use my text</TabsTrigger>
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
               <CardFooter className="flex-col sm:flex-row gap-2">
                 <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Quiz
                </Button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                />
                 <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full sm:w-auto" size="lg" title="Import from file">
                    <Upload className="h-4 w-4" />
                </Button>
                <Button onClick={handleFileExport} disabled={!generatedContent} variant="outline" className="w-full sm:w-auto" size="lg" title="Export to file">
                    <Download className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="lg:sticky top-24 min-h-[400px] lg:min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Generated Quiz</CardTitle>
              <CardDescription>Test your knowledge.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
