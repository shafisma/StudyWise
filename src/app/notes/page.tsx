import { Metadata } from 'next';
import NotesPageClient from './page-client';

export const metadata: Metadata = {
  title: 'AI Note Generator',
  description: 'Generate comprehensive study notes from text, PDFs, or YouTube videos instantly with AI.',
  openGraph: {
    title: 'AI Note Generator | StudyWise AI',
    description: 'Turn any content into structured study notes in seconds.',
  }
};

export default function NotesPage() {
  return <NotesPageClient />;
}
