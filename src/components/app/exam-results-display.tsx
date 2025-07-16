'use client';

import { type FC } from 'react';
import { Award, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { type EvaluateExamOutput } from '@/ai/schemas/evaluation-schemas';
import { type ExamQuestion } from '@/ai/schemas/exam-schemas';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface ExamResultsDisplayProps {
  results: EvaluateExamOutput;
  questions: ExamQuestion[];
}

const ExamResultsDisplay: FC<ExamResultsDisplayProps> = ({ results, questions }) => {
  const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);
  const percentage = totalMarks > 0 ? (results.totalScore / totalMarks) * 100 : 0;

  const getStatusIcon = (status: 'correct' | 'incorrect' | 'partially-correct') => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'incorrect':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'partially-correct':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center items-center">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                <Award className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Results & Feedback</CardTitle>
            <CardDescription>{results.overallFeedback}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-around items-center text-center">
            <div>
              <p className="text-4xl font-bold">{results.totalScore} / {totalMarks}</p>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </div>
            {results.grade && (
              <div>
                <p className="text-4xl font-bold">{results.grade}</p>
                <p className="text-sm text-muted-foreground">Grade</p>
              </div>
            )}
          </div>
          <Progress value={percentage} className="w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Feedback</CardTitle>
          <CardDescription>Review your answers and the AI's feedback for each question.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {questions.map((question, index) => {
              const feedback = results.feedbackPerQuestion[index];
              if (!feedback) return null;

              const statusClasses = {
                'correct': 'border-green-500/50 hover:bg-green-500/10',
                'incorrect': 'border-red-500/50 hover:bg-red-500/10',
                'partially-correct': 'border-yellow-500/50 hover:bg-yellow-500/10',
              };
              
              const marksAwardedText = feedback.marksAwarded !== undefined ? `${feedback.marksAwarded}/${question.marks}` : `${question.marks}/${question.marks}`;

              return (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className={cn("text-left p-4 rounded-lg", statusClasses[feedback.isCorrect])}>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            {getStatusIcon(feedback.isCorrect)}
                            <span className="flex-1">Question {index + 1}: {question.question_text}</span>
                        </div>
                         <Badge variant="outline" className="ml-4 shrink-0">{marksAwardedText} Marks</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 space-y-2">
                    <p>
                        <strong className="font-semibold">Your Answer: </strong>
                         {feedback.userAnswer || 'Not answered'}
                    </p>
                    <p>
                      <strong className="font-semibold">Correct Answer: </strong>
                      {question.correct_answer}
                    </p>
                    <div className="p-3 bg-accent/50 rounded-md mt-2 border border-accent">
                      <p className="font-semibold text-accent-foreground">AI Feedback:</p>
                      <p className="text-muted-foreground">{feedback.feedback}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamResultsDisplay;
