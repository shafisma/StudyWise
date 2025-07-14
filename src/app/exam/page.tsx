
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClipboardCheck, Loader2, Wand2, FileText, CheckCircle, Clock } from 'lucide-react';
import { generateExam } from '@/ai/flows/generate-exam';
import { evaluateExam } from '@/ai/flows/evaluate-exam';
import { type GenerateExamInput, GenerateExamInputSchema, type GenerateExamOutput } from '@/ai/schemas/exam-schemas';
import { type EvaluateExamOutput } from '@/ai/schemas/evaluation-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import ExamResultsDisplay from '@/components/app/exam-results-display';
import { differenceInCalendarDays } from 'date-fns';

const questionTypes = [
  { id: 'mcq', label: 'Multiple Choice' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'descriptive', label: 'Descriptive' },
] as const;

export default function ExamPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GenerateExamOutput | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateExamOutput | null>(null);
  const { toast } = useToast();
  
  const examAnswersForm = useForm();

  const form = useForm<GenerateExamInput>({
    resolver: zodResolver(GenerateExamInputSchema),
    defaultValues: {
      subject: '',
      chapters: '',
      grade: '',
      totalMarks: 50,
      questionTypes: ['mcq', 'short_answer'],
    },
  });

  async function onConfigSubmit(values: GenerateExamInput) {
    setIsLoading(true);
    setGeneratedExam(null);
    setEvaluationResult(null);

    try {
      const result = await generateExam(values);
      setGeneratedExam(result);
      toast({
        title: 'Exam Generated Successfully!',
        description: 'Your exam paper is ready to be taken.',
      });
    } catch (error) {
      console.error('Error generating exam:', error);
      toast({
        variant: 'destructive',
        title: 'Exam Generation Failed',
        description: 'An error occurred while creating your exam. Please check the inputs and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const saveExamResult = (subject: string, score: number, totalMarks: number) => {
    // Save exam attempt to history
    const result = {
      type: 'exam',
      topic: subject,
      score,
      total: totalMarks,
      date: new Date().toISOString(),
    };
    const history = JSON.parse(localStorage.getItem('activityHistory') || '[]');
    history.push(result);
    localStorage.setItem('activityHistory', JSON.stringify(history));

    // Update gamification stats
    const stats = JSON.parse(localStorage.getItem('gamificationStats') || '{"xp":0, "streak":0, "longestStreak":0, "lastActivityDate": null}');
    
    // Add XP (1 per mark)
    stats.xp += score;

    // Update streak
    const today = new Date();
    const lastActivityDate = stats.lastActivityDate ? new Date(stats.lastActivityDate) : null;
    
    if (lastActivityDate) {
        const diffDays = differenceInCalendarDays(today, lastActivityDate);
        if (diffDays === 1) {
            stats.streak++; // Continue streak
        } else if (diffDays > 1) {
            stats.streak = 1; // Reset streak
        }
    } else {
        stats.streak = 1; // First activity
    }

    if (stats.streak > stats.longestStreak) {
        stats.longestStreak = stats.streak;
    }

    stats.lastActivityDate = today.toISOString();
    
    localStorage.setItem('gamificationStats', JSON.stringify(stats));

    toast({
        title: `+${score} XP`,
        description: "Your progress has been saved!",
    });
  }


  async function onExamSubmit(data: any) {
    if (!generatedExam) return;

    setIsEvaluating(true);
    const userAnswers = generatedExam.questions.map((_, index) => data[`question_${index}`] || '');

    try {
      const result = await evaluateExam({
        examQuestions: generatedExam.questions,
        userAnswers,
      });
      setEvaluationResult(result);
      saveExamResult(
        form.getValues('subject'), 
        result.totalScore, 
        generatedExam.questions.reduce((acc, q) => acc + q.marks, 0)
      );
      toast({
        title: "Evaluation Complete!",
        description: "Check out your results and feedback below."
      });
    } catch (error) {
      console.error('Error evaluating exam:', error);
      toast({
        variant: 'destructive',
        title: 'Evaluation Failed',
        description: 'An error occurred while evaluating your exam.',
      });
    } finally {
      setIsEvaluating(false);
    }
  }

  const renderExamTaker = () => {
    if (!generatedExam) return null;

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{generatedExam.title}</CardTitle>
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{generatedExam.timeLimitMinutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Total Marks: {generatedExam.questions.reduce((acc, q) => acc + q.marks, 0)}</span>
                    </div>
                </div>
                <CardDescription className="pt-2">{generatedExam.instructions}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...examAnswersForm}>
                    <form onSubmit={examAnswersForm.handleSubmit(onExamSubmit)} className="space-y-8">
                        {generatedExam.questions.map((question, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <FormField
                                    control={examAnswersForm.control}
                                    name={`question_${index}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base flex justify-between items-center">
                                                <span>Question {index + 1}: {question.question_text}</span>
                                                <span className="text-sm font-medium text-primary">({question.marks} Marks)</span>
                                            </FormLabel>
                                            <FormControl>
                                                {question.question_type === 'mcq' && question.options ? (
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="pt-2 space-y-2">
                                                        {question.options.map((option, optIndex) => (
                                                            <FormItem key={optIndex} className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value={option} />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">{option}</FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
                                                ) : (
                                                    <Textarea placeholder="Your answer..." {...field} className="mt-2" />
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                        <Button type="submit" size="lg" className="w-full" disabled={isEvaluating}>
                           {isEvaluating ? <Loader2 className="animate-spin" /> : null}
                           {isEvaluating ? 'Evaluating...' : 'Submit Exam'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
  }

  const renderContent = () => {
    if (evaluationResult && generatedExam) {
        return <ExamResultsDisplay results={evaluationResult} questions={generatedExam.questions} />;
    }
    if (generatedExam) {
        return renderExamTaker();
    }

    return (
        <Card>
          <CardHeader>
            <CardTitle>Exam Configuration</CardTitle>
            <CardDescription>Specify the details for your exam paper.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onConfigSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Biology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class / Grade</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10th Grade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="chapters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapters / Topics</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cell Structure, Photosynthesis" {...field} />
                      </FormControl>
                      <FormDescription>Separate multiple topics with a comma.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Marks</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionTypes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Question Types</FormLabel>
                        <FormDescription>Select which types of questions to include.</FormDescription>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {questionTypes.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="questionTypes"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(field.value?.filter((value) => value !== item.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                  Generate Exam
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Exam Simulator</h1>
            <p className="text-muted-foreground">Create, take, and get AI feedback on exams.</p>
            </div>
        </div>
        {(generatedExam || evaluationResult) && (
            <Button variant="secondary" onClick={() => {
                setGeneratedExam(null);
                setEvaluationResult(null);
                form.reset();
                examAnswersForm.reset();
            }}>
                Create New Exam
            </Button>
        )}
      </div>

       {isLoading && !generatedExam && (
            <div className="flex flex-col justify-center items-center mt-8 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your exam, please wait...</p>
            </div>
        )}
      
      {renderContent()}

    </div>
  );
}
