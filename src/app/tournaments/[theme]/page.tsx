

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Medal, Users, ArrowLeft, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { tournamentData } from "@/lib/tournament-data";
import { notFound } from "next/navigation";


const ICONS: {[key: string]: React.ReactNode} = {
    joueurs: <Users className="h-6 w-6 text-primary" />,
    equipes: <Medal className="h-6 w-6 text-primary" />,
    pays: <Globe className="h-6 w-6 text-primary" />
}

// Pour capitaliser la première lettre
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TournamentThemePage({ params }: { params: { theme: string } }) {
  const { theme } = params;
  const themeData = tournamentData[theme];
  
  if (!themeData) {
    notFound();
  }

  const categories = Object.keys(themeData).map(slug => ({
      slug,
      ...themeData[slug],
      icon: ICONS[slug] || <Users className="h-6 w-6 text-primary" />
  }));

  const themeName = capitalize(theme);

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl mx-auto animate-fade-in">
          <div className="relative mb-8 text-center">
            <Button 
                variant="ghost" 
                asChild
                className="absolute left-0 top-1/2 -translate-y-1/2 animate-fade-in-up"
            >
              <Link href="/tournaments">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Retour
              </Link>
            </Button>
            <Badge variant="secondary" className="text-lg mb-4">
              Tournoi
            </Badge>
            <h1 className="text-4xl font-bold text-primary">
              {themeName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Choisissez une catégorie pour commencer le défi.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card key={category.slug} className="flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader className="flex-grow">
                  <CardTitle className="flex items-center gap-3">
                    {category.icon}
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/tournaments/${theme}/${category.slug}`}>
                      Jouer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
