

'use client';

import { SiteHeader } from "@/components/site-header";
import { LeaderboardClient } from "./leaderboard-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 animate-fade-in">
        <div className="container py-8 max-w-4xl mx-auto">
            <div className="relative mb-8 text-center">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="absolute left-0 top-1/2 -translate-y-1/2 animate-fade-in-up"
                >
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Retour
                </Button>
                <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-4">
                    Classement
                </h1>
            </div>
            <LeaderboardClient />
        </div>
      </main>
    </div>
  );
}
