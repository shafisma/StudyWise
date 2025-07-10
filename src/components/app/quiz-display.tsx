'use client';

import { useState, useMemo, type FC } from 'react';
import { Check, X, ChevronsRight, Award } from 'lucide-react';
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
}

interface QuizDisplayProps {
  quizData: string;
}

const parseQuiz = (quizText: string): Question[] => {
  if (!quizText) return [];
  try {
    const questions: Question[] = [];
    const questionBlocks = quizText.trim().split(/\n\s*\n/);

    for (const block of questionBlocks) {
      const lines = block.split('\n').filter((line) => line.trim() !== '');
      if (lines.length < 2) continue;

      const questionLine = lines.find((line) => /^\d+\.\s/.test(line));
      if (!questionLine) continue;
      const question = questionLine.replace(/^\d+\.\s/, '').trim();

      const options = lines
        .filter((line) => /^[A-Z][\).]/.test(line))
        .map((line) => line.replace(/^[A-Z][\).]\s*/, '').trim());

      const answerLine = lines.find((line) => /^Answer:\s*[A-Z]/.test(line));
      if (!answerLine) continue;
      const correctOptionLetter = answerLine.match(/^Answer:\s*([A-Z])/)?.[1];
      if (!correctOptionLetter) continue;

      const correctOptionIndex = correctOptionLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      if (correctOptionIndex < 0 || correctOptionIndex >= options.length) continue;

      questions.push({
        question,
        options,
        answer: options[correctOptionIndex],
      });
    }
    return questions;
  } catch (error) {
    console.error("Failed to parse quiz:", error);
    return [];
  }
};

const QuizDisplay: FC<QuizDisplayProps> = ({ quizData }) => {
  const questions = useMemo(() => parseQuiz(quizData), [quizData]);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | undefined)[]>(Array(questions.length).fill(undefined));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
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
    api?.scrollTo(0, true);
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground mb-4">Could not parse the quiz.</p>
        <Card className="w-full text-left">
          <CardHeader>
            <CardTitle>Raw Quiz Text</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">{quizData}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Card className="text-center bg-primary/20">
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
        <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">Review Answers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <p className="text-sm text-muted-foreground">Question {current + 1} of {questions.length}</p>
            <Progress value={((current + 1) / questions.length) * 100} className="w-1/2" />
        </div>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {questions.map((q, i) => (
            <CarouselItem key={i}>
              <Card>
                <CardHeader>
                  <CardTitle>{i + 1}. {q.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedAnswers[i]}
                    onValueChange={(value) => handleAnswerSelect(i, value)}
                    disabled={isSubmitted}
                    className="space-y-2"
                  >
                    {q.options.map((option, j) => {
                      const isCorrect = option === q.answer;
                      const isSelected = selectedAnswers[i] === option;
                      return (
                        <Label
                          key={j}
                          className={cn(
                            "flex items-center space-x-3 rounded-md border p-4 transition-colors hover:bg-accent/50",
                            isSubmitted && isSelected && !isCorrect && "bg-destructive/20 border-destructive",
                            isSubmitted && isCorrect && "bg-primary/20 border-primary"
                          )}
                        >
                          <RadioGroupItem value={option} />
                          <span>{option}</span>
                          {isSubmitted && isSelected && !isCorrect && <X className="ml-auto h-5 w-5 text-destructive" />}
                          {isSubmitted && isCorrect && <Check className="ml-auto h-5 w-5 text-primary" />}
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

      {selectedAnswers.every((a) => a !== undefined) && !isSubmitted && (
        <Button onClick={handleSubmit} className="w-full">
          Submit Quiz <ChevronsRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default QuizDisplay;
