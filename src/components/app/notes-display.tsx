"use client";

import type { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';

interface NotesDisplayProps {
  notes: string;
}

const NotesDisplay: FC<NotesDisplayProps> = ({ notes }) => {
  return (
    <ScrollArea className="h-full max-h-[500px] pr-4">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {notes}
        </div>
    </ScrollArea>
  );
};

export default NotesDisplay;
