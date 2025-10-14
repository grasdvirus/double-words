
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FloatingLettersBackground } from '@/components/floating-letters-background';
import { Trophy, Swords, BookOpen, Settings, UserPlus, LogIn, Users, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useAuth } from '@/firebase';
import { signInWithGoogle } from '@/firebase/auth';
import { useNotification } from '@/contexts/notification-context';
import { useTranslations } from '@/hooks/use-translations';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { showNotification } = useNotification();
  const t = useTranslations();

  const handleSignIn = async () => {
    if (!auth) {
      console.error("L'instance d'authentification Firebase n'est pas prête.");
      showNotification({
        title: t('auth_error'),
        message: t('auth_service_error'),
        type: 'error'
      });
      return;
    }
    try {
      await signInWithGoogle(auth);
    } catch (error: any) {
      console.error("Erreur de connexion Google :", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        showNotification({
          title: t('auth_error'),
          message: t('auth_error_message'),
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <FloatingLettersBackground />
      <div className="z-10 text-center p-4 w-full max-w-3xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold text-primary font-headline tracking-tighter mb-4 animate-fade-in-down">
          {t('home_title')}
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-in-up">
          {t('home_subtitle')}
        </p>

        {!user && !isUserLoading && (
           <Alert className="mb-8 text-left max-w-md mx-auto animate-fade-in-up [animation-delay:0.2s]">
            <UserPlus className="h-4 w-4" />
            <AlertTitle>{t('home_connect_alert_title')}</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>{t('home_connect_alert_description')}</span>
              <Button size="sm" onClick={handleSignIn} className="flex-shrink-0">
                <LogIn className="mr-2 h-4 w-4" />
                {t('connect')}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isUserLoading && (
          <div className="mb-8 flex justify-center">
             <div className="section-center scale-50">
                <div className="section-path">
                    <div className="globe">
                    <div className="wrapper">
                        <span></span><span></span><span></span><span></span>
                        <span></span><span></span><span></span><span></span>
                        <span></span><span></span><span></span><span></span>
                        <span></span><span></span><span></span><span></span>
                    </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.4s]">
          <Button asChild size="lg" className="w-full">
            <Link href="/play">
              <Trophy className="mr-2" />
              {t('challenge_mode')}
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href="/play">
              <Swords className="mr-2" />
              {t('training_mode')}
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href="/duel">
              <Users className="mr-2" />
              {t('duel_mode')}
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:col-span-1 lg:col-auto">
            <Link href="/tournaments">
              <Calendar className="mr-2" />
              {t('tournaments_mode')}
            </Link>
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4 animate-fade-in-up [animation-delay:0.6s]">
            <Button asChild variant="ghost" size="icon">
              <Link href="/rules" aria-label={t('rules')}>
                <BookOpen />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="/leaderboard" aria-label={t('leaderboard')}>
                <Trophy />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="/settings" aria-label={t('settings')}>
                <Settings />
              </Link>
            </Button>
          </div>
      </div>
    </div>
  );
}
