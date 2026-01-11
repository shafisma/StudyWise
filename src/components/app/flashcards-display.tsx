'use client';

import { useState, type FC } from 'react';
import { RefreshCw, Download, FileJson } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  // State for flipped cards
  const [flippedStates, setFlippedStates] = useState<boolean[]>(
      () => Array(flashcards?.length || 0).fill(false)
  );

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(20);
      doc.text('Flashcards', 14, yPos);
      yPos += 10;
      doc.setFontSize(12);

      flashcards.forEach((card, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Q${index + 1}: ${card.question}`, 14, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        // Handle multiline answers
        const splitAnswer = doc.splitTextToSize(`A: ${card.answer}`, 180);
        doc.text(splitAnswer, 14, yPos);
        yPos += (splitAnswer.length * 7) + 5;
      });

      doc.save('studywise-flashcards.pdf');
      toast({ title: "Flashcards Exported", description: "PDF has been downloaded" });
    } catch (e) {
      toast({ variant: 'destructive', title: "Export Failed" });
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flashcards.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Flashcards Exported", description: "JSON has been downloaded" });
  };

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

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-muted-foreground">No flashcards generated.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleExportJson}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPdf}>
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
      </div>
      
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
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default FlashcardsDisplay;
