
import { SiteHeader } from "@/components/site-header";
import { TournamentGameClient } from "./tournament-game-client";
import { tournamentData } from "@/lib/tournament-data";
import { notFound } from 'next/navigation';
import { Badge } from "@/components/ui/badge";

// Pour capitaliser la première lettre
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TournamentGamePage({ params }: { params: { theme: string, category: string } }) {
  const { theme, category } = params;
  const categoryData = tournamentData[theme]?.[category];

  if (!categoryData) {
    notFound();
  }
  
  const themeName = capitalize(theme);
  const categoryName = categoryData.name;

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 animate-fade-in">
        <div className="container py-4 md:py-8 text-center">
            <Badge variant="secondary" className="text-md mb-2">
              Tournoi: {themeName}
            </Badge>
            <h1 className="text-3xl font-bold text-primary mb-4">
              Catégorie: {categoryName}
            </h1>
        </div>
        <TournamentGameClient theme={theme} category={category} />
      </main>
    </div>
  );
}
