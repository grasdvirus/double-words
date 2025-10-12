
import { SiteHeader } from "@/components/site-header";
import { LeaderboardClient } from "./leaderboard-client";

export default function LeaderboardPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 animate-fade-in">
        <LeaderboardClient />
      </main>
    </div>
  );
}
