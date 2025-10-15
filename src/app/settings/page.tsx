
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGame } from "@/hooks/use-game";
import { ArrowLeft, Eraser, Award, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTranslations } from "@/hooks/use-translations";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";

interface UserProfile {
    palmares?: {
        firstPlace?: number;
        secondPlace?: number;
        thirdPlace?: number;
    }
}

export default function SettingsPage() {
  const { settings, updateSettings, resetProgress } = useGame();
  const router = useRouter();
  const t = useTranslations();
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  const palmares = userProfile?.palmares;

  const handleReset = () => {
    if(window.confirm(t('reset_progress_confirm'))) {
      resetProgress();
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in">
          
          <div className="relative mb-8 text-center">
            <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="absolute left-0 top-1/2 -translate-y-1/2 animate-fade-in-up"
            >
                <ArrowLeft className="mr-2 h-4 w-4"/>
                {t('back')}
            </Button>
            <h1 className="text-4xl font-bold text-primary">{t('settings_title')}</h1>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" />
                  Mon Palmarès
                </CardTitle>
                <CardDescription>Votre historique de classement à la fin de chaque saison.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-center">
                {isLoading ? (
                    <div className="col-span-3 flex justify-center items-center h-24">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                          <span className="text-4xl">🥇</span>
                          <p className="text-2xl font-bold">{palmares?.firstPlace || 0}</p>
                          <p className="text-sm text-muted-foreground">1ère Place</p>
                        </div>
                         <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                          <span className="text-4xl">🥈</span>
                          <p className="text-2xl font-bold">{palmares?.secondPlace || 0}</p>
                          <p className="text-sm text-muted-foreground">2ème Place</p>
                        </div>
                         <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                          <span className="text-4xl">🥉</span>
                          <p className="text-2xl font-bold">{palmares?.thirdPlace || 0}</p>
                          <p className="text-sm text-muted-foreground">3ème Place</p>
                        </div>
                    </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('theme_title')}</CardTitle>
                <CardDescription>{t('theme_description')}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ThemeSwitcher />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('game_title')}</CardTitle>
                <CardDescription>{t('game_description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language-select">{t('language')}</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value: 'FR' | 'EN') => updateSettings({ language: value })}
                  >
                    <SelectTrigger id="language-select" className="w-[180px]">
                      <SelectValue placeholder="Langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FR">{t('language_fr')}</SelectItem>
                      <SelectItem value="EN">{t('language_en')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-switch">{t('sound_effects')}</Label>
                  <Switch
                    id="sound-switch"
                    checked={settings.enableSound}
                    onCheckedChange={(checked) => updateSettings({ enableSound: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('progression_title')}</CardTitle>
                <CardDescription>{t('progression_description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleReset}>
                  <Eraser className="mr-2 h-4 w-4" />
                  {t('reset_progression')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
