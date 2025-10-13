
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Medal, Shield, Trophy } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemoFirebase } from "@/firebase/provider";

interface Player {
  id: string;
  displayName: string;
  score: number;
  photoURL?: string;
}

const getTier = (score: number) => {
  if (score >= 1000) return { name: "Diamant", icon: <Gem className="h-5 w-5 text-cyan-400" /> };
  if (score >= 500) return { name: "Or", icon: <Medal className="h-5 w-5 text-yellow-500" /> };
  if (score >= 200) return { name: "Argent", icon: <Shield className="h-5 w-5 text-slate-400" /> };
  return { name: "Bronze", icon: <Shield className="h-5 w-5 text-orange-400" /> };
};

export function LeaderboardClient() {
  const firestore = useFirestore();
  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "leaderboard"), orderBy("score", "desc"), limit(10));
  }, [firestore]);
  
  const { data: leaderboardData, isLoading } = useCollection<Player>(leaderboardQuery);

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-4">
        <Trophy className="h-10 w-10" />
        Classement
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Top 10 des Joueurs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <div className="section-center scale-50">
                    <div className="section-path">
                        <div className="globe">
                        <div className="wrapper">
                            <span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rang</TableHead>
                  <TableHead>Joueur</TableHead>
                  <TableHead className="hidden md:table-cell">Niveau</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData?.map((player, index) => {
                  const tier = getTier(player.score);
                  return (
                    <TableRow key={player.id} className="hover:bg-white/5">
                      <TableCell className="font-medium text-center text-lg">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 font-semibold">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={player.photoURL} alt={player.displayName} />
                            <AvatarFallback>{player.displayName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {player.displayName}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {tier.icon}
                          {tier.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-lg">{player.score}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
