'use client';

import { useState, type FC } from 'react';
import { Check, X, ChevronsRight, Award, History, ArrowLeft, Volume2, Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import React from 'react';

interface Question {
  question: string;
  options: string[];
  answer: string;
  emoji?: string;
}

interface QuizDisplayProps {
  questions: Question[];
  onQuizSubmit: (score: number, totalQuestions: number) => void;
  onPlayAudio: (text: string, id: string) => void;
  isSynthesizing: string | null;
}

const QuizDisplay: FC<QuizDisplayProps> = ({ questions, onQuizSubmit, onPlayAudio, isSynthesizing }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<(string | undefined)[]>(Array(questions.length).fill(undefined));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const { toast } = useToast();

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(20);
      doc.text('Quiz Questions', 14, yPos);
      yPos += 10;
      doc.setFontSize(12);

      questions.forEach((q, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        const splitQuestion = doc.splitTextToSize(`Q${index + 1}: ${q.question}`, 180);
        doc.text(splitQuestion, 14, yPos);
        yPos += (splitQuestion.length * 7) + 5;
        
        doc.setFont('helvetica', 'normal');
        q.options.forEach((opt, optIndex) => {
           const label = String.fromCharCode(65 + optIndex);
           const isAnswer = opt === q.answer;
           const text = `${label}) ${opt}${isSubmitted && isAnswer ? ' (Correct)' : ''}`;
           const splitOpt = doc.splitTextToSize(text, 170);
           doc.text(splitOpt, 20, yPos);
           yPos += (splitOpt.length * 7);
        });
        yPos += 5;
      });

      doc.save('studywise-quiz.pdf');
      toast({ title: "Quiz Exported", description: "PDF has been downloaded" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Export Failed" });
    }
  };

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (isReviewing) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let newScore = 0;
    for (let i = 0; i < questions.length; i++) {
      if (selectedAnswers[i] === questions[i].answer) {
        newScore++;
      }
    }
    setScore(newScore);
    setIsSubmitted(true);
    setIsReviewing(false);
    onQuizSubmit(newScore, questions.length);
    api?.scrollTo(0, true);
  };
  
  const handleReview = () => {
    setIsSubmitted(false);
    setIsReviewing(true);
    api?.scrollTo(0, true);
  };

  const handleBackToScoreboard = () => {
    setIsSubmitted(true);
    setIsReviewing(false);
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground mb-4">No quiz questions were generated.</p>
      </div>
    );
  }

  if (isSubmitted && !isReviewing) {
    return (
      <div className="space-y-6">
        <Card className="text-center bg-primary/20 relative">
            <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" onClick={handleExportPdf} title="Export Quiz">
                    <Download className="h-5 w-5" />
                </Button>
            </div>
            <CardHeader>
                <div className="mx-auto bg-accent rounded-full p-3 w-fit">
                    <Award className="h-8 w-8 text-accent-foreground"/>
                </div>
                <CardTitle>Quiz Complete!</CardTitle>
                <CardDescription>You scored {score} out of {questions.length}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Progress value={(score / questions.length) * 100} className="w-full" />
            </CardContent>
        </Card>
        <div className="flex gap-4">
            <Button onClick={handleReview} variant="outline" className="w-full">
                <History className="mr-2 h-4 w-4" />
                Review Answers
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <p className="text-sm text-muted-foreground">Question {current + 1} of {questions.length}</p>
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={handleExportPdf}>
                    <Download className="h-4 w-4 mr-2" />
                    Save PDF
                 </Button>
                 <Progress value={((current + 1) / questions.length) * 100} className="w-24" />
            </div>
        </div>
      <Carousel setApi={setApi} className="w-full max-w-md mx-auto">
        <CarouselContent>
          {questions.map((q, i) => (
            <CarouselItem key={i}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {q.emoji && <span className="text-2xl mt-1">{q.emoji}</span>}
                            <span>{i + 1}. {q.question}</span>
                        </div>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => onPlayAudio(q.question, `question-${i}`)}
                            disabled={isSynthesizing === `question-${i}`}
                            title="Read question aloud"
                          >
                            {isSynthesizing === `question-${i}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedAnswers[i]}
                    onValueChange={(value) => handleAnswerSelect(i, value)}
                    disabled={isReviewing}
                    className="space-y-2"
                  >
                    {q.options.map((option, j) => {
                      const isCorrectAnswer = option === q.answer;
                      const isSelectedAnswer = selectedAnswers[i] === option;
                      
                      let variantClass = "";
                      if (isReviewing) {
                        if (isCorrectAnswer) {
                            variantClass = "bg-primary/20 border-primary";
                        } else if (isSelectedAnswer && !isCorrectAnswer) {
                            variantClass = "bg-destructive/20 border-destructive";
                        }
                      }

                      return (
                        <Label
                          key={j}
                          className={cn(
                            "flex items-center space-x-3 rounded-md border p-4 transition-colors",
                            !isReviewing && "hover:bg-accent/50",
                            variantClass
                          )}
                        >
                          <RadioGroupItem value={option} disabled={isReviewing} />
                          <span>{option}</span>
                          {isReviewing && isSelectedAnswer && !isCorrectAnswer && <X className="ml-auto h-5 w-5 text-destructive" />}
                          {isReviewing && isCorrectAnswer && <Check className="ml-auto h-5 w-5 text-primary" />}
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {!isReviewing && selectedAnswers.every((a) => a !== undefined) && (
        <Button onClick={handleSubmit} className="w-full">
          Submit Quiz <ChevronsRight className="ml-2 h-4 w-4" />
        </Button>
      )}

      {isReviewing && (
        <Button onClick={handleBackToScoreboard} className="w-full" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back to scoreboard
        </Button>
      )}
    </div>
  );
};

export default QuizDisplay;
