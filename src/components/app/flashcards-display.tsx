'use client';

import { useState, type FC } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsDisplayProps {
  flashcards: Flashcard[];
}

const FlashcardsDisplay: FC<FlashcardsDisplayProps> = ({ flashcards }) => {
  const [flippedStates, setFlippedStates] = useState<boolean[]>(
    Array(flashcards.length).fill(false)
  );

  const handleFlip = (index: number) => {
    const newFlippedStates = [...flippedStates];
    newFlippedStates[index] = !newFlippedStates[index];
    setFlippedStates(newFlippedStates);
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-muted-foreground">No flashcards generated.</p>
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-md mx-auto">
      <CarouselContent>
        {flashcards.map((flashcard, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <div
                className={cn(
                  'flip-card w-full h-80 rounded-lg',
                  flippedStates[index] && 'flipped'
                )}
              >
                <div className="flip-card-inner relative w-full h-full">
                  {/* Front of card */}
                  <div className="flip-card-front absolute w-full h-full">
                    <Card className="w-full h-full flex flex-col">
                      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <p className="text-xs text-muted-foreground mb-2">QUESTION</p>
                        <ScrollArea className="h-48 w-full">
                           <p className="text-lg font-semibold">{flashcard.question}</p>
                        </ScrollArea>
                      </CardContent>
                      <div className="p-4 border-t">
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => handleFlip(index)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Flip to Answer
                        </Button>
                      </div>
                    </Card>
                  </div>
                  {/* Back of card */}
                  <div className="flip-card-back absolute w-full h-full">
                    <Card className="w-full h-full flex flex-col bg-secondary">
                      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <p className="text-xs text-muted-foreground mb-2">ANSWER</p>
                         <ScrollArea className="h-48 w-full">
                           <p className="text-lg">{flashcard.answer}</p>
                         </ScrollArea>
                      </CardContent>
                       <div className="p-4 border-t">
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => handleFlip(index)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Flip to Question
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default FlashcardsDisplay;
