
'use client';

import { useState, useRef } from 'react';
import { BrainCircuit, Loader2, Wand2, FileQuestion, BookOpen, Upload, Download, FileType, Youtube } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { generateQuiz, type GenerateQuizOutput, type GenerateQuizInput } from '@/ai/flows/generate-quiz';
import { generateFromTopic } from '@/ai/flows/generate-from-topic';
import { textToSpeech } from '@/ai/flows/text-to-speech';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import QuizDisplay from '@/components/app/quiz-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { extractTextFromFile } from '@/lib/file-parser';
import AudioPlayer from '@/components/app/audio-player';
import { differenceInCalendarDays, isSameWeek } from 'date-fns';
import { achievements } from '@/lib/achievements';

type InputMode = 'from-text' | 'from-topic' | 'from-youtube';

interface Question {
  question: string;
  options: string[];
  answer: string;
  emoji?: string;
}

interface GeneratedContent {
    notes?: string;
    quiz: { questions: Question[] };
    flashcards?: any[];
    imageHint?: string;
    sourceTopic?: string;
}

// Extend the jsPDF type to include the autoTable method from the plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function QuizPage() {
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

  const handlePlayAudio = async (textToPlay: string, id: string) => {
      if (isSynthesizing === id) return;
      
      setIsSynthesizing(id);
      setAudioSrc(null);

      try {
          const { audioDataUri } = await textToSpeech({ text: textToPlay });
          setAudioSrc(audioDataUri);
      } catch (error) {
          console.error("Error synthesizing speech:", error);
          toast({
              variant: 'destructive',
              title: 'Audio Failed',
              description: 'Could not generate audio for this question.',
          });
      } finally {
          setIsSynthesizing(null);
      }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent(null);

    try {
      let result: GeneratedContent;
      if (inputMode === 'from-topic') {
        if (!topic.trim()) {
            toast({ variant: 'destructive', title: 'Topic is required.' });
            setIsLoading(false);
            return;
        }
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
      } else { // from-text or from-youtube
        let quizInput: GenerateQuizInput = {};
        if (inputMode === 'from-text') {
            if (!text.trim()) {
                toast({ variant: 'destructive', title: 'Text is required.' });
                setIsLoading(false);
                return;
            }
            quizInput.text = text;
        } else if (inputMode === 'from-youtube') {
            if (!youtubeUrl.trim()) {
                toast({ variant: 'destructive', title: 'YouTube URL is required.' });
                setIsLoading(false);
                return;
            }
            quizInput.youtubeUrl = youtubeUrl;
        }
        const textResult = await generateQuiz(quizInput);
        result = { quiz: { questions: textResult.questions } }
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
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handlePdfExport = () => {
    if (!generatedContent?.quiz?.questions) return;
    
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const quizTitle = generatedContent.sourceTopic ? `Quiz: ${generatedContent.sourceTopic}` : 'Quiz';

    // Set title
    doc.setFontSize(20);
    doc.text(quizTitle, 14, 22);

    // Create table
    doc.autoTable({
        startY: 30,
        head: [['Question', 'Answer']],
        body: generatedContent.quiz.questions.map(q => [q.question, q.answer]),
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
        styles: { font: 'helvetica', fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 'auto' },
        },
    });

    const fileName = `studywise-quiz-${generatedContent.sourceTopic?.replace(/\s+/g, '_') || 'custom'}.pdf`;
    doc.save(fileName);
  };
  
  const checkAndAwardAchievements = (newActivityHistory: any[], currentStats: any) => {
    const newAchievements = new Set(currentStats.achievements || []);
    
    const showAchievementToast = (id: string) => {
        if (!newAchievements.has(id)) {
            const achievement = achievements.find(a => a.id === id);
            if (achievement) {
                newAchievements.add(id);
                toast({ title: `Achievement Unlocked: ${achievement.name}!`, description: achievement.description, className: 'bg-accent text-accent-foreground' });
            }
        }
    };
    
    const examHistory = newActivityHistory.filter((item: any) => item.type === 'exam');
    const quizHistory = newActivityHistory.filter((item: any) => item.type === 'quiz');

    // Exam Achievements
    if (examHistory.length >= 1) showAchievementToast('exam_novice');
    if (examHistory.length >= 5) showAchievementToast('exam_pro');
    if (examHistory.length >= 15) showAchievementToast('exam_veteran');

    const lastExam = examHistory[examHistory.length - 1];
    if (lastExam) {
        const percentage = lastExam.total > 0 ? (lastExam.score / lastExam.total) * 100 : 0;
        if (percentage >= 90) showAchievementToast('top_scorer');
        if (percentage === 100) showAchievementToast('exam_ace');
        
        const sameSubjectExams = examHistory.filter((e: any) => e.topic.toLowerCase() === lastExam.topic.toLowerCase());
        if (sameSubjectExams.length >= 3) showAchievementToast('subject_specialist');
    }

    // Quiz Achievements
    if (quizHistory.length >= 1) showAchievementToast('quiz_taker');
    if (quizHistory.length >= 10) showAchievementToast('quiz_master');
    if (quizHistory.length >= 25) showAchievementToast('quiz_champion');
    
    const lastQuiz = quizHistory[quizHistory.length - 1];
    if(lastQuiz && lastQuiz.score === lastQuiz.total) {
        showAchievementToast('perfect_quiz');
    }
    

    // Consistency Achievements
    if (currentStats.streak >= 3) showAchievementToast('scholars_streak_3');
    if (currentStats.streak >= 7) showAchievementToast('dedicated_learner_7');

    if (examHistory.length >= 3) {
      const lastThreeExams = examHistory.slice(-3);
      if (lastThreeExams.every((e: any) => ['A+', 'A'].includes(e.grade))) {
        showAchievementToast('consistent_performer');
      }
    }
    
    const today = new Date();
    const examsThisWeek = examHistory.filter((h: any) => isSameWeek(new Date(h.date), today, { weekStartsOn: 1 }));
    if (examsThisWeek.length >= 3) showAchievementToast('weekly_warrior');
    
    const quizzesThisWeek = quizHistory.filter((h: any) => isSameWeek(new Date(h.date), today, { weekStartsOn: 1 }));
    if (quizzesThisWeek.length >= 5) showAchievementToast('quiz_whiz');


    return Array.from(newAchievements);
};


  const saveQuizResult = (score: number, totalQuestions: number) => {
    let resultTopic = 'Custom Content';
    if(inputMode === 'from-topic') resultTopic = topic;
    if(inputMode === 'from-youtube') resultTopic = 'YouTube Video';
    
    const result = {
      type: 'quiz',
      topic: resultTopic,
      score,
      total: totalQuestions,
      date: new Date().toISOString(),
    };
    const history = JSON.parse(localStorage.getItem('activityHistory') || '[]');
    history.push(result);
    localStorage.setItem('activityHistory', JSON.stringify(history));

    let stats = JSON.parse(localStorage.getItem('gamificationStats') || '{"xp":0, "streak":0, "longestStreak":0, "lastActivityDate": null, "achievements": []}');
    
    stats.xp += score * 10;

    const today = new Date();
    const lastActivityDate = stats.lastActivityDate ? new Date(stats.lastActivityDate) : null;
    
    if (lastActivityDate) {
        const diffDays = differenceInCalendarDays(today, lastActivityDate);
        if (diffDays === 1) {
            stats.streak++;
        } else if (diffDays > 1) {
            stats.streak = 1;
        }
    } else {
        stats.streak = 1;
    }

    if (stats.streak > stats.longestStreak) {
        stats.longestStreak = stats.streak;
    }

    stats.lastActivityDate = today.toISOString();
    
    stats.achievements = checkAndAwardAchievements(history, stats);

    localStorage.setItem('gamificationStats', JSON.stringify(stats));

    toast({
        title: `+${score * 10} XP Earned!`,
        description: "Your progress has been saved.",
    });
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
        <QuizDisplay 
            questions={generatedContent.quiz.questions} 
            onQuizSubmit={saveQuizResult}
            onPlayAudio={handlePlayAudio}
            isSynthesizing={isSynthesizing}
        />
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
                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)} className="w-full">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="from-text"><FileQuestion className="mr-2"/>Use my text</TabsTrigger>
                            <TabsTrigger value="from-topic"><BookOpen className="mr-2"/>From a topic</TabsTrigger>
                            <TabsTrigger value="from-youtube"><Youtube className="mr-2"/>From YouTube</TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="from-text">
                             <CardTitle className="mb-2 text-xl">Enter Your Study Material</CardTitle>
                             <CardDescription className="mb-4">Paste your text or import a document below to get started.</CardDescription>
                             <Textarea
                                placeholder="Paste your notes, an article, or any text you want to study..."
                                className="min-h-[250px] text-base"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </TabsContent>
                         <TabsContent value="from-topic">
                            <CardTitle className="mb-2 text-xl">Generate From Topic</CardTitle>
                            <CardDescription className="mb-4">Enter a topic and we'll generate the study materials for you.</CardDescription>
                            <Input
                                placeholder="e.g., 'The basics of photosynthesis'"
                                className="text-base h-12"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </TabsContent>
                        <TabsContent value="from-youtube">
                             <CardTitle className="mb-2 text-xl">Generate From YouTube</CardTitle>
                             <CardDescription className="mb-4">Enter a video URL and we'll make a quiz from its transcript.</CardDescription>
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
                            Generate Quiz
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
            <AudioPlayer src={audioSrc} onEnded={() => setAudioSrc(null)} />
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
