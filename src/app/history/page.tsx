'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface QuizResult {
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export default function HistoryPage() {
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedHistory = localStorage.getItem('quizHistory');
    if (storedHistory) {
      setQuizHistory(JSON.parse(storedHistory));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('quizHistory');
    setQuizHistory([]);
  };

  const renderHistory = () => {
    if (!isClient) {
      return null;
    }
    
    if (quizHistory.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <History className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No Quiz History</h3>
          <p className="text-sm text-muted-foreground">Your past quiz results will be saved here.</p>
        </div>
      );
    }

    // Sort history from most recent to oldest
    const sortedHistory = [...quizHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <ScrollArea className="h-full">
        <div className="space-y-4">
          {sortedHistory.map((result, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold capitalize">{result.topic || 'General Quiz'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(result.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {result.score}/{result.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Score
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };
  
  return (
    <div className="flex flex-col flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Quiz History</h1>
        {isClient && quizHistory.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your entire quiz history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <Card className="flex-1">
        <CardContent className="p-6 h-full">
          {renderHistory()}
        </CardContent>
      </Card>
    </div>
  );
}