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
  emoji: string;
  color: string;
}

interface FlashcardsDisplayProps {
  flashcards: Flashcard[];
}

const FlashcardsDisplay: FC<FlashcardsDisplayProps> = ({ flashcards }) => {
  if (!flashcards) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-muted-foreground">No flashcards generated.</p>
      </div>
    );
  }

  const [flippedStates, setFlippedStates] = useState<boolean[]>(
    Array(flashcards.length).fill(false)
  );

  const handleFlip = (index: number) => {
    const newFlippedStates = [...flippedStates];
    newFlippedStates[index] = !newFlippedStates[index];
    setFlippedStates(newFlippedStates);
  };

  const isColorDark = (hexColor: string) => {
    const color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 186;
  };

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-muted-foreground">No flashcards generated.</p>
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-md mx-auto">
      <CarouselContent>
        {flashcards.map((flashcard, index) => {
           const cardTextColor = isColorDark(flashcard.color) ? 'text-white' : 'text-black';
           const cardStyle = { backgroundColor: flashcard.color };

            return (
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
                        <Card className={cn("w-full h-full flex flex-col", cardTextColor)} style={cardStyle}>
                          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <div className="text-6xl mb-4">{flashcard.emoji}</div>
                            <p className="text-xs opacity-80 mb-2">QUESTION</p>
                            <ScrollArea className="h-24 w-full">
                              <p className="text-lg font-semibold">{flashcard.question}</p>
                            </ScrollArea>
                          </CardContent>
                          <div className={cn("p-4 border-t", isColorDark(flashcard.color) ? 'border-white/20' : 'border-black/10')}>
                            <Button
                              variant="ghost"
                              className={cn("w-full", isColorDark(flashcard.color) ? 'hover:bg-white/10' : 'hover:bg-black/10')}
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
                        <Card className={cn("w-full h-full flex flex-col", cardTextColor)} style={cardStyle}>
                          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                             <div className="text-6xl mb-4">{flashcard.emoji}</div>
                            <p className="text-xs opacity-80 mb-2">ANSWER</p>
                            <ScrollArea className="h-24 w-full">
                              <p className="text-lg">{flashcard.answer}</p>
                            </ScrollArea>
                          </CardContent>
                          <div className={cn("p-4 border-t", isColorDark(flashcard.color) ? 'border-white/20' : 'border-black/10')}>
                            <Button
                              variant="ghost"
                              className={cn("w-full", isColorDark(flashcard.color) ? 'hover:bg-white/10' : 'hover:bg-black/10')}
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
            )
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default FlashcardsDisplay;
