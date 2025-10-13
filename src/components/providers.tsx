
"use client";

import { GameProvider } from "@/contexts/game-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { NotificationProvider } from "@/contexts/notification-context";

export function Providers({ children }: { children: React.Node }) {
  return (
    <FirebaseClientProvider>
      <GameProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </GameProvider>
    </FirebaseClientProvider>
  );
}
