
'use client';

import { SiteHeader } from "@/components/site-header";
import { LeaderboardClient } from "./leaderboard-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";
import { CountdownTimer } from "./countdown-timer";

export default function LeaderboardPage() {
  const router = useRouter();
  const t = useTranslations();

  // Date de fin de la saison (modifiable)
  const seasonEndDate = new Date('2024-08-15T23:59:59');

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 animate-fade-in">
        <div className="container py-8 max-w-4xl mx-auto">
            <div className="relative mb-4 text-center">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="absolute left-0 top-1/2 -translate-y-1/2 animate-fade-in-up"
                >
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    {t('back')}
                </Button>
                <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-4">
                    <Trophy className="h-8 w-8" />
                    {t('leaderboard_title')}
                </h1>
            </div>
            <CountdownTimer endDate={seasonEndDate} />
            <LeaderboardClient />
        </div>
      </main>
    </div>
  );
}
