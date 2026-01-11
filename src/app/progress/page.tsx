import { Metadata } from 'next';
import ProgressPageClient from './page-client';

export const metadata: Metadata = {
  title: 'My Progress',
  description: 'Track your study streaks and learning progress.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProgressPage() {
  return <ProgressPageClient />;
}
