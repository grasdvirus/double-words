import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FloatingLettersBackground } from '@/components/floating-letters-background';
import { Play, Trophy, BookOpen, Settings, Swords } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <FloatingLettersBackground />
      <div className="z-10 text-center p-4">
        <h1 className="text-6xl md:text-8xl font-bold text-primary font-headline tracking-tighter mb-4 animate-fade-in-down">
          DOUBLE WORDS
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-in-up">
          Le jeu où les lettres se répètent, mais jamais les idées.
        </p>
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
