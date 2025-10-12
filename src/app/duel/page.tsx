
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Users, Gamepad, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DuelLobbyPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in">
          <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-4">
            <Users className="h-10 w-10" />
            Mode Duel
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gamepad className="h-6 w-6 text-primary" />
                  Créer une partie
                </CardTitle>
                <CardDescription>
                  Créez une nouvelle salle de jeu et invitez un ami avec un code.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button asChild className="w-full">
                  <Link href="/duel/create">
                    Créer et obtenir un code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <KeyRound className="h-6 w-6 text-primary" />
                  Rejoindre une partie
                </CardTitle>
                <CardDescription>
                  Entrez le code d'une partie existante pour rejoindre le duel.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end gap-4">
                 <Input placeholder="Entrez le code..." className="text-center text-lg h-12" maxLength={6} />
                 <Button className="w-full">
                    Rejoindre la partie
                    <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
