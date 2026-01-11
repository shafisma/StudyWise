import { Metadata } from 'next';
import Eli5PageClient from './page-client';

export const metadata: Metadata = {
  title: 'Explain Like I\'m 5 (ELI5)',
  description: 'Get simple, easy-to-understand explanations for complex topics. AI breaks it down for you.',
  openGraph: {
    title: 'Explain Like I\'m 5 | StudyWise AI',
    description: 'Simplify complex concepts with AI explanations.',
  }
};

export default function Eli5Page() {
  return <Eli5PageClient />;
}
