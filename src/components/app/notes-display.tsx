'use client';

import React, { type FC, useEffect, useRef, useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { marked, type Tokens } from 'marked';
import Slugger from 'github-slugger';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NotesDisplayProps {
  notes: string;
  topic?: string;
  onPlayAudio: (text: string, id: string) => void;
  isSynthesizing: string | null;
}

const NotesDisplay: FC<NotesDisplayProps> = ({ notes, topic, onPlayAudio, isSynthesizing }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportPdf = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);

    try {
      const element = containerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Improve quality
        useCORS: true, // Handle images if any
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `studywise-notes-${
         topic?.replace(/\s+/g, '_') || 'generated'
      }.pdf`;

      pdf.save(fileName);
      toast({ title: "PDF Exported!", description: "Your notes have been downloaded." });
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast({ variant: 'destructive', title: "Export Failed", description: "Could not generate PDF." });
    } finally {
      setIsExporting(false);
    }
  };

  // Render markdown with custom heading renderer
  useEffect(() => {
    const slugger = new Slugger();
    const renderer = new marked.Renderer();

    renderer.heading = ({ tokens, depth }: Tokens.Heading) => {
      const text = tokens.map(token => token.raw).join('');
      // Important: Use the same slugger instance for all headings in a single render
      const id = slugger.slug(text);

      return `
        <div class="flex items-center gap-2 group">
          <h${depth} id="${id}">
            ${text}
          </h${depth}>
          <button
            data-speech-text="${text}"
            data-speech-id="heading-${id}"
            class="play-speech-button opacity-0 group-hover:opacity-100 transition-opacity"
            title="Read this section aloud"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          </button>
        </div>
      `;
    };

    const processMarkdown = async () => {
      if (notes) {
        const renderedHtml = await marked(notes, { renderer });
        setHtml(renderedHtml);
      } else {
        setHtml('');
      }
    };
    processMarkdown();
  }, [notes]);

  // Handle play-button clicks via event delegation
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest('.play-speech-button');
      if (button) {
        const text = button.getAttribute('data-speech-text');
        const id = button.getAttribute('data-speech-id');
        if (text && id) {
          onPlayAudio(text, id);
        }
      }
    };

    const container = containerRef.current;
    container?.addEventListener('click', handleClick);

    return () => {
      container?.removeEventListener('click', handleClick);
    };
  }, [onPlayAudio]);

  // Update button states (spinner vs. play icon) when synthesizing
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const buttons = container.querySelectorAll<HTMLButtonElement>('.play-speech-button');
      buttons.forEach(btn => {
        const button = btn;
        const id = button.getAttribute('data-speech-id');
        if (id === isSynthesizing) {
          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
          button.disabled = true;
        } else {
          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
          button.disabled = false;
        }
      });
    }
  }, [isSynthesizing]);
  
  if (!notes) {
    return null;
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-250px)] relative">
      <div className="absolute top-2 right-6 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
          onClick={handleExportPdf}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export PDF
        </Button>
      </div>
      <ScrollArea.Root className="h-full">
        <ScrollArea.Viewport className="h-full w-full pr-4">
          <div
            ref={containerRef}
            className="prose dark:prose-invert max-w-none p-6 pb-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="w-2.5 touch-none select-none border-l bg-accent p-0.5 transition-colors duration-[160ms] ease-out hover:bg-black/5 dark:hover:bg-white/5">
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-border" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
};

export default NotesDisplay;
