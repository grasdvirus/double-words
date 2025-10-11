import { SiteHeader } from "@/components/site-header";
import { GameProvider } from "@/contexts/game-context";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <GameProvider>
      <div className="relative flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </GameProvider>
  );
}
