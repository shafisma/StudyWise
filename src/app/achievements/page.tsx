import { Metadata } from 'next';
import AchievementsPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Achievements',
  description: 'View your unlocked achievements and badges.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AchievementsPage() {
  return <AchievementsPageClient />;
}

