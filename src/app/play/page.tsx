
import { SiteHeader } from "@/components/site-header";
import { GameClient } from "./game-client";

export default function PlayPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 animate-fade-in">
        <GameClient />
      </main>
    </div>
  );
}
