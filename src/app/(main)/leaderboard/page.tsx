import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Medal, Shield } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Joueur_Alpha", score: 1250, tier: "Diamant" },
  { rank: 2, name: "Mot_Maestro", score: 1180, tier: "Diamant" },
  { rank: 3, name: "Miss_Lettre", score: 1050, tier: "Or" },
  { rank: 4, name: "Syntax_Samurai", score: 980, tier: "Or" },
  { rank: 5, name: "Pro_du_Prose", score: 920, tier: "Or" },
  { rank: 6, name: "Captain_Voyelle", score: 850, tier: "Argent" },
  { rank: 7, name: "Consonne_King", score: 760, tier: "Argent" },
  { rank: 8, name: "Le_Scrabbleur", score: 690, tier: "Bronze" },
  { rank: 9, name: "Verbe_Veloce", score: 610, tier: "Bronze" },
  { rank: 10, name: "Double_Trouble", score: 550, tier: "Bronze" },
];

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "Diamant":
      return <Gem className="h-5 w-5 text-cyan-400" />;
    case "Or":
      return <Medal className="h-5 w-5 text-yellow-500" />;
    case "Argent":
      return <Shield className="h-5 w-5 text-slate-400" />;
    case "Bronze":
      return <Shield className="h-5 w-5 text-orange-400" />;
    default:
      return null;
  }
};

export default function LeaderboardPage() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center">Classement</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Top 10 des Joueurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rang</TableHead>
                <TableHead>Pseudo</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((player) => (
                <TableRow key={player.rank} className="hover:bg-white/5">
                  <TableCell className="font-medium text-center">{player.rank}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getTierIcon(player.tier)}
                    {player.tier}
                  </TableCell>
                  <TableCell className="text-right font-mono">{player.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
