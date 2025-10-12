
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FloatingLettersBackground } from '@/components/floating-letters-background';
import { Trophy, Swords, BookOpen, Settings, UserPlus, LogIn, Users, Calendar, GraduationCap, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useAuth } from '@/firebase';
import { signInWithGoogle } from '@/firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (auth) {
      try {
        await signInWithGoogle(auth);
      } catch (error: any) {
        console.error("Erreur de connexion Google :", error);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Impossible de se connecter avec Google. Veuillez réessayer.",
        });
      }
    } else {
      console.error("L'instance d'authentification Firebase n'est pas prête.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le service d'authentification n'est pas disponible.",
      });
    }
  };

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

        {!user && !isUserLoading && (
           <Alert className="mb-8 text-left max-w-md mx-auto animate-fade-in-up [animation-delay:0.2s]">
            <UserPlus className="h-4 w-4" />
            <AlertTitle>Connectez-vous !</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>Votre score n'apparaîtra pas dans le classement.</span>
              <Button size="sm" onClick={handleSignIn} className="flex-shrink-0">
                <LogIn className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {isUserLoading && (
          <div className="mb-8 flex justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.4s]">
          <Button asChild size="lg" className="w-full">
            <Link href="/play">
              <Trophy className="mr-2" />
              Mode Défi
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href="/play">
              <Swords className="mr-2" />
              Entraînement
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href="#">
              <Users className="mr-2" />
              Duel (2J)
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:col-span-1 lg:col-auto">
            <Link href="#">
              <Calendar className="mr-2" />
              Tournois
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:col-span-2 lg:col-span-1">
            <Link href="#">
              <GraduationCap className="mr-2" />
              Apprentissage
            </Link>
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4 animate-fade-in-up [animation-delay:0.6s]">
            <Button asChild variant="ghost" size="icon">
              <Link href="/rules" aria-label="Règles du jeu">
                <BookOpen />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="/leaderboard" aria-label="Classement">
                <Trophy />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="/settings" aria-label="Paramètres">
                <Settings />
              </Link>
            </Button>
          </div>
      </div>
    </div>
  );
}
