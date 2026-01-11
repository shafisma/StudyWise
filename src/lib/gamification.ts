
'use client';

import { differenceInCalendarDays, isSameWeek } from "date-fns";
import { toast } from "../hooks/use-toast";
import { achievements } from "./achievements";

export const checkAndAwardAchievements = (newActivityHistory: any[], currentStats: any) => {
    const newAchievements = new Set(currentStats.achievements || []);
    
    const showAchievementToast = (id: string) => {
        if (!newAchievements.has(id)) {
            const achievement = achievements.find(a => a.id === id);
            if (achievement) {
                newAchievements.add(id);
                toast({ title: `Achievement Unlocked: ${achievement.name}!`, description: achievement.description, className: 'bg-accent text-accent-foreground' });
            }
        }
    };
    
    const examHistory = newActivityHistory.filter((item: any) => item.type === 'exam');
    const quizHistory = newActivityHistory.filter((item: any) => item.type === 'quiz');

    // Exam Achievements
    if (examHistory.length >= 1) showAchievementToast('exam_novice');
    if (examHistory.length >= 5) showAchievementToast('exam_pro');
    if (examHistory.length >= 15) showAchievementToast('exam_veteran');

    const lastExam = examHistory[examHistory.length - 1];
    if (lastExam) {
        const percentage = lastExam.total > 0 ? (lastExam.score / lastExam.total) * 100 : 0;
        if (percentage >= 90) showAchievementToast('top_scorer');
        if (percentage === 100) showAchievementToast('exam_ace');
        
        const sameSubjectExams = examHistory.filter((e: any) => e.topic.toLowerCase() === lastExam.topic.toLowerCase());
        if (sameSubjectExams.length >= 3) showAchievementToast('subject_specialist');
    }

    // Quiz Achievements
    if (quizHistory.length >= 1) showAchievementToast('quiz_taker');
    if (quizHistory.length >= 10) showAchievementToast('quiz_master');
    if (quizHistory.length >= 25) showAchievementToast('quiz_champion');
    
    const lastQuiz = quizHistory[quizHistory.length - 1];
    if(lastQuiz && lastQuiz.score === lastQuiz.total) {
        showAchievementToast('perfect_quiz');
    }
    

    // Consistency Achievements
    if (currentStats.streak >= 3) showAchievementToast('scholars_streak_3');
    if (currentStats.streak >= 7) showAchievementToast('dedicated_learner_7');

    if (examHistory.length >= 3) {
      const lastThreeExams = examHistory.slice(-3);
      if (lastThreeExams.every((e: any) => ['A+', 'A'].includes(e.grade))) {
        showAchievementToast('consistent_performer');
      }
    }
    
    const today = new Date();
    const examsThisWeek = examHistory.filter((h: any) => isSameWeek(new Date(h.date), today, { weekStartsOn: 1 }));
    if (examsThisWeek.length >= 3) showAchievementToast('weekly_warrior');
    
    const quizzesThisWeek = quizHistory.filter((h: any) => isSameWeek(new Date(h.date), today, { weekStartsOn: 1 }));
    if (quizzesThisWeek.length >= 5) showAchievementToast('quiz_whiz');


    return Array.from(newAchievements);
};

const updateStatsAndSave = (activityType: 'quiz' | 'exam', payload: { topic: string; score: number; total: number; grade?: string; }) => {
    if (typeof window === 'undefined') return;

    const result = {
      type: activityType,
      ...payload,
      date: new Date().toISOString(),
    };
    
    const history = JSON.parse(localStorage.getItem('activityHistory') || '[]');
    history.push(result);
    localStorage.setItem('activityHistory', JSON.stringify(history));

    let stats = JSON.parse(localStorage.getItem('gamificationStats') || '{"xp":0, "streak":0, "longestStreak":0, "lastActivityDate": null, "achievements": []}');
    
    // Add XP
    stats.xp += payload.score * (activityType === 'quiz' ? 10 : 1); 

    // Update streak
    const today = new Date();
    const lastActivityDate = stats.lastActivityDate ? new Date(stats.lastActivityDate) : null;
    if (lastActivityDate) {
        const diff = differenceInCalendarDays(today, lastActivityDate);
        if (diff === 1) stats.streak++;
        else if (diff > 1) stats.streak = 1;
    } else {
        stats.streak = 1;
    }
    if (stats.streak > stats.longestStreak) {
        stats.longestStreak = stats.streak;
    }
    stats.lastActivityDate = today.toISOString();

    // Check for new achievements
    stats.achievements = checkAndAwardAchievements(history, stats);
    
    localStorage.setItem('gamificationStats', JSON.stringify(stats));

    toast({
        title: `+${payload.score * (activityType === 'quiz' ? 10 : 1)} XP Earned!`,
        description: "Your progress has been saved.",
    });
};

export const saveQuizResult = (score: number, totalQuestions: number, topic: string) => {
    updateStatsAndSave('quiz', { topic, score, total: totalQuestions });
};

export const saveExamResult = (subject: string, score: number, totalMarks: number, grade: string | undefined) => {
    updateStatsAndSave('exam', { topic: subject, score, total: totalMarks, grade });
};
