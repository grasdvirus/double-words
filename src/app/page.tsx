
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FloatingLettersBackground } from '@/components/floating-letters-background';
import { Play, Trophy, BookOpen, Settings, UserPlus, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useAuth } from '@/firebase';
import { signInWithGoogle } from '@/firebase/auth';

export default function Home() {
  const { user } = useUser();
  const auth = useAuth();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <FloatingLettersBackground />
      <div className="z-10 text-center p-4 w-full max-w-3xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold text-primary font-headline tracking-tighter mb-4 animate-fade-in-down">
          DOUBLE WORDS
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-in-up">
          Le jeu où les lettres se répètent, mais jamais les idées.
        </p>

        {!user && (
           <Alert className="mb-8 text-left max-w-md">
            <UserPlus className="h-4 w-4" />
            <AlertTitle>Connectez-vous !</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>Votre score n'apparaîtra pas dans le classement si vous jouez en tant qu'anonyme.</span>
              <Button size="sm" onClick={() => auth && signInWithGoogle(auth)} className="flex-shrink-0">
                <LogIn className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/play">
              <Play className="mr-2" />
              Jouer
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="icon">
              <Link href="/rules" aria-label="Règles du jeu">
                <BookOpen />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="icon">
              <Link href="/leaderboard" aria-label="Classement">
                <Trophy />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="icon">
              <Link href="/settings" aria-label="Paramètres">
                <Settings />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
