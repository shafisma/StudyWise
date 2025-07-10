'use client';

import type { FC } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { marked } from 'marked';

interface NotesDisplayProps {
  notes: string;
}

const NotesDisplay: FC<NotesDisplayProps> = ({ notes }) => {
  const getHTML = (markdown: string) => {
    if (!markdown) return { __html: '' };
    return { __html: marked(markdown) };
  };

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-250px)] pr-4">
      <div
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={getHTML(notes)}
      />
    </ScrollArea>
  );
};

export default NotesDisplay;
