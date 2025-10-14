
'use client';

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Award, Star, TrendingUp, Gem, Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/use-translations";

export default function RulesPage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl mx-auto animate-fade-in">
          
          <div className="relative mb-8 text-center">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="absolute left-0 top-1/2 -translate-y-1/2 animate-fade-in-up"
            >
                <ArrowLeft className="mr-2 h-4 w-4"/>
                {t('back')}
            </Button>
            <h1 className="text-4xl font-bold text-primary">{t('rules_title')}</h1>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('rules_goal_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">
                  {t('rules_goal_text')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('rules_how_to_play_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t('rules_how_to_play_1')}</p>
                <p>{t('rules_how_to_play_2')}</p>
                <p>{t('rules_how_to_play_3')}</p>
                <p>{t('rules_how_to_play_4')}</p>
                <p>{t('rules_how_to_play_5')}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('rules_scoring_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <CheckCircle className="text-accent h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{t('rules_scoring_correct')}</h3>
                    <p className="text-sm text-muted-foreground">{t('rules_scoring_correct_desc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Star className="text-primary h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{t('rules_scoring_bonus')}</h3>
                    <p className="text-sm text-muted-foreground">{t('rules_scoring_bonus_desc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <TrendingUp className="text-blue-500 h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{t('rules_scoring_time')}</h3>
                    <p className="text-sm text-muted-foreground">{t('rules_scoring_time_desc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <XCircle className="text-destructive h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{t('rules_scoring_error')}</h3>
                    <p className="text-sm text-muted-foreground">{t('rules_scoring_error_desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('rules_progression_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {t('rules_progression_text')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('rules_leaderboard_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Trophy className="text-yellow-500 h-6 w-6" />
                  <p>{t('rules_leaderboard_text')}</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
