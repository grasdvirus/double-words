
"use client";

import { GameProvider } from "@/contexts/game-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </FirebaseClientProvider>
  );
}
