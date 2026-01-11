
'use client';

import { useEffect, useState } from 'react';
import { Award, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { achievements as allAchievements, type Achievement } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

const AchievementIcon = ({ name, className }: { name: IconName; className?: string }) => {
  const Icon = LucideIcons[name] as React.ElementType;
  if (!Icon) return <Award className={className} />; // Fallback icon
  return <Icon className={className} />;
};


export default function AchievementsPage() {
    const [claimedAchievements, setClaimedAchievements] = useState<Set<string>>(new Set());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const stats = JSON.parse(localStorage.getItem('gamificationStats') || '{}');
        if (stats.achievements) {
            setClaimedAchievements(new Set(stats.achievements));
        }
    }, []);

    if (!isClient) {
        return (
            <div className="flex flex-col flex-1 p-4 md:p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                        <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
                        <p className="text-muted-foreground">Track your accomplishments and milestones.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6 h-[150px] bg-muted/50 rounded-lg" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    const claimedCount = claimedAchievements.size;
    const totalCount = allAchievements.length;

    return (
        <div className="flex flex-col flex-1 p-4 md:p-6">
             <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                        <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
                        <p className="text-muted-foreground">Track your accomplishments and milestones.</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">{claimedCount} / {totalCount}</p>
                    <p className="text-sm text-muted-foreground">Unlocked</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allAchievements.map((achievement) => {
                    const isClaimed = claimedAchievements.has(achievement.id);
                    return (
                        <Card key={achievement.id} className={cn("transition-all duration-300", isClaimed ? 'border-accent shadow-accent/20 shadow-lg' : 'bg-muted/50')}>
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className={cn("p-3 rounded-lg", isClaimed ? 'bg-accent text-accent-foreground' : 'bg-muted-foreground/20 text-muted-foreground')}>
                                    {isClaimed ? <AchievementIcon name={achievement.icon as IconName} className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className={cn("font-bold", isClaimed ? "text-accent-foreground" : "text-foreground")}>{achievement.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

