
"use client";

import { GameProvider } from "@/contexts/game-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { NotificationProvider } from "@/contexts/notification-context";
import { ThemeProvider } from "next-themes";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <FirebaseClientProvider>
        <GameProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </GameProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
