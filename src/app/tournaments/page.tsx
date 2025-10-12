
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

const themes = [
  {
    name: "Football",
    slug: "football",
    description: "Testez vos connaissances sur le monde du ballon rond.",
    icon: "⚽️",
  },
  // D'autres thèmes pourront être ajoutés ici
];

export default function TournamentsPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-4">
            <Trophy className="h-10 w-10" />
            Mode Tournois
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Choisissez un thème pour commencer un tournoi et affronter des défis uniques.
          </p>
          
          <div className="grid gap-6">
            {themes.map((theme) => (
              <Card key={theme.slug} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <span className="text-4xl">{theme.icon}</span>
                    {theme.name}
                  </CardTitle>
                  <CardDescription>{theme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href={`/tournaments/${theme.slug}`}>
                      Choisir ce thème
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
