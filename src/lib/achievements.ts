
import { type LucideIcon } from "lucide-react";

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: 'Exam' | 'Quiz' | 'Consistency' | 'General';
    icon: string; // Using string to avoid direct import of lucide-react in a data file
}

export const achievements: Achievement[] = [
    // Exam Achievements
    {
        id: 'exam_novice',
        name: 'Exam Novice',
        description: 'Complete your first exam.',
        category: 'Exam',
        icon: 'Feather',
    },
    {
        id: 'exam_pro',
        name: 'Exam Pro',
        description: 'Complete 5 exams.',
        category: 'Exam',
        icon: 'Award',
    },
    {
        id: 'exam_veteran',
        name: 'Exam Veteran',
        description: 'Complete 15 exams.',
        category: 'Exam',
        icon: 'Shield',
    },
    {
        id: 'top_scorer',
        name: 'Top Scorer',
        description: 'Score 90% or higher on an exam.',
        category: 'Exam',
        icon: 'TrendingUp',
    },
    {
        id: 'exam_ace',
        name: 'Exam Ace',
        description: 'Score 100% on an exam.',
        category: 'Exam',
        icon: 'Trophy',
    },
    {
        id: 'subject_specialist',
        name: 'Subject Specialist',
        description: 'Complete 3 exams on the same subject.',
        category: 'Exam',
        icon: 'BookMarked',
    },
    // Quiz Achievements
    {
        id: 'quiz_taker',
        name: 'Quiz Taker',
        description: 'Complete your first quiz.',
        category: 'Quiz',
        icon: 'HelpCircle',
    },
    {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Complete 10 quizzes.',
        category: 'Quiz',
        icon: 'BrainCircuit',
    },
    {
        id: 'quiz_champion',
        name: 'Quiz Champion',
        description: 'Complete 25 quizzes.',
        category: 'Quiz',
        icon: 'Crown',
    },
    {
        id: 'perfect_quiz',
        name: 'Perfect Quiz',
        description: 'Score 100% on a quiz.',
        category: 'Quiz',
        icon: 'Sparkles',
    },
    // Consistency Achievements
    {
        id: 'scholars_streak_3',
        name: "Scholar's Streak",
        description: 'Maintain a 3-day activity streak.',
        category: 'Consistency',
        icon: 'Flame',
    },
    {
        id: 'dedicated_learner_7',
        name: 'Dedicated Learner',
        description: 'Maintain a 7-day activity streak.',
        category: 'Consistency',
        icon: 'Medal',
    },
    {
        id: 'consistent_performer',
        name: 'Consistent Performer',
        description: "Score an 'A' or 'A+' on three consecutive exams.",
        category: 'Consistency',
        icon: 'BarChart',
    },
    {
        id: 'weekly_warrior',
        name: 'Weekly Warrior',
        description: 'Complete 3 or more exams in a single week.',
        category: 'Consistency',
        icon: 'CalendarDays',
    },
    {
        id: 'quiz_whiz',
        name: 'Quiz Whiz',
        description: 'Complete 5 or more quizzes in a single week.',
        category: 'Consistency',
        icon: 'Zap',
    },
];

