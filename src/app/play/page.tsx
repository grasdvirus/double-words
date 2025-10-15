
import { SiteHeader } from "@/components/site-header";
import { GameClient } from "./game-client";
import { Suspense } from 'react';

function GamePageContent({ training }: { training: boolean }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 animate-fade-in">
        <GameClient isTrainingMode={training} />
      </main>
    </div>
  );
}

export default function PlayPage({ searchParams }: { searchParams: { training: string } }) {
  const isTraining = searchParams.training === 'true';

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <GamePageContent training={isTraining} />
    </Suspense>
  );
}
