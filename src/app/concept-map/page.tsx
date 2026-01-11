import { Metadata } from 'next';
import ConceptMapPageClient from './page-client';

export const metadata: Metadata = {
  title: 'AI Concept Map Generator',
  description: 'Visualize relationships between concepts. Generate interactive concept maps for better understanding.',
  openGraph: {
    title: 'AI Concept Map Generator | StudyWise AI',
    description: 'Visual learning made easy with AI-generated concept maps.',
  }
};

export default function ConceptMapPage() {
  return <ConceptMapPageClient />;
}
