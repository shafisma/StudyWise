import { Metadata } from 'next';
import HistoryPageClient from './page-client';

export const metadata: Metadata = {
  title: 'My History',
  description: 'View your history of generated study materials.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
