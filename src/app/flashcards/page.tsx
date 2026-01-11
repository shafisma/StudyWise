import { Metadata } from 'next';
import FlashcardsPageClient from './page-client';

export const metadata: Metadata = {
  title: 'AI Flashcard Maker',
  description: 'Create flashcards automatically from your study materials using AI. Test your knowledge effectively.',
  openGraph: {
    title: 'AI Flashcard Maker | StudyWise AI',
    description: 'Instant flashcards from your notes or textbooks.',
  }
};

export default function FlashcardsPage() {
  return <FlashcardsPageClient />;
}
