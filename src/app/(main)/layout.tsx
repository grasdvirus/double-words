import { SiteHeader } from "@/components/site-header";
import { GameProvider } from "@/contexts/game-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <FirebaseClientProvider>
      <GameProvider>
        <div className="relative flex min-h-screen flex-col bg-background">
          <SiteHeader />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </GameProvider>
    </FirebaseClientProvider>
  );
}
