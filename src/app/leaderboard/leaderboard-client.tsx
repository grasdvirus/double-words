
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Medal, Shield, Trophy, PartyPopper, Copy } from "lucide-react";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemoFirebase } from "@/firebase/provider";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useCallback } from "react";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/notification-context";


interface Player {
  id: string;
  displayName: string;
  score: number;
  photoURL?: string;
  uid?: string;
}

const getTier = (score: number) => {
  if (score >= 1000) return { name: "Diamant", icon: <Gem className="h-5 w-5 text-cyan-400" /> };
  if (score >= 500) return { name: "Or", icon: <Medal className="h-5 w-5 text-yellow-500" /> };
  if (score >= 200) return { name: "Argent", icon: <Shield className="h-5 w-5 text-slate-400" /> };
  return { name: "Bronze", icon: <Shield className="h-5 w-5 text-orange-400" /> };
};

const RankIndicator = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return <Trophy className="h-7 w-7 text-yellow-400" />;
    }
    if (rank === 2) {
      return <Medal className="h-7 w-7 text-slate-400" />;
    }
    if (rank === 3) {
      return <Medal className="h-7 w-7 text-orange-400" />;
    }
    return <span className="font-medium text-lg">{rank}</span>;
  };

function LeaderboardTable({ players, isLoading }: { players: Player[] | null, isLoading: boolean }) {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="section-center scale-50">
          <div className="section-path">
            <div className="globe">
              <div className="wrapper"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px] text-center">{t('rank')}</TableHead>
          <TableHead>{t('player')}</TableHead>
          <TableHead className="hidden md:table-cell">{t('tier')}</TableHead>
          <TableHead className="text-right">{t('score')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players?.map((player, index) => {
          const tier = getTier(player.score);
          const rank = index + 1;
          return (
            <TableRow 
                key={player.id}
                className={cn(
                    "transition-transform duration-300",
                    rank > 3 && "hover:scale-[1.02] hover:bg-white/5"
                )}
            >
              <TableCell className="font-medium text-center">
                <div className="flex justify-center items-center h-full">
                    <RankIndicator rank={rank} />
                </div>
              </TableCell>
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
  );
}

function EndOfSeasonResults({ allPlayers }: { allPlayers: Player[] }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const t = useTranslations();
    const { showNotification } = useNotification();
    const [claimed, setClaimed] = useState(false);

    const { userRank, userScore } = useMemo(() => {
        const rank = allPlayers.findIndex(p => p.id === user?.uid) + 1;
        const score = allPlayers.find(p => p.id === user?.uid)?.score || 0;
        return { userRank: rank, userScore: score };
    }, [allPlayers, user?.uid]);

    const handleClaim = useCallback(async () => {
        if (!user || !firestore || !userRank || userRank > 3) {
            showNotification({
                title: "Palmarès",
                message: "Votre récompense a été enregistrée. Continuez comme ça !",
                type: 'info'
            });
            setClaimed(true);
            return;
        };

        const userProfileRef = doc(firestore, "users", user.uid);
        let fieldToIncrement = "";
        if (userRank === 1) fieldToIncrement = "palmares.firstPlace";
        if (userRank === 2) fieldToIncrement = "palmares.secondPlace";
        if (userRank === 3) fieldToIncrement = "palmares.thirdPlace";
        
        try {
            // Ensure the user profile document and palmares object exist
            const userDoc = await getDoc(userProfileRef);
            if (!userDoc.exists()) {
              await updateDoc(userProfileRef, { palmares: { firstPlace: 0, secondPlace: 0, thirdPlace: 0 }}, { merge: true });
            } else if (!userDoc.data()?.palmares) {
              await updateDoc(userProfileRef, { palmares: { firstPlace: 0, secondPlace: 0, thirdPlace: 0 }}, { merge: true });
            }
            
            await updateDoc(userProfileRef, {
                [fieldToIncrement]: increment(1)
            });

            showNotification({
                title: "Félicitations !",
                message: `Votre ${userRank}ème place a été ajoutée à votre palmarès !`,
                type: 'success'
            });
            setClaimed(true);

        } catch (error) {
            console.error("Erreur lors de la mise à jour du palmarès:", error);
             showNotification({
                title: "Erreur",
                message: "Impossible de mettre à jour votre palmarès. Veuillez réessayer.",
                type: 'error'
            });
        }
    }, [user, firestore, userRank, showNotification]);

    if (!user) return <p>Connectez-vous pour voir vos résultats.</p>;

    return (
        <Card className="text-center animate-fade-in-up">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                    <PartyPopper className="h-8 w-8 text-primary" />
                    Fin de la Saison !
                </CardTitle>
                <CardContent className="space-y-4 pt-6">
                    <p className="text-muted-foreground">Voici votre performance pour la saison écoulée. Bravo !</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Votre Score Final</p>
                            <p className="text-4xl font-bold text-primary">{userScore}</p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Votre Rang Final</p>
                            <p className="text-4xl font-bold text-primary">{userRank > 0 ? `#${userRank}` : "N/A"}</p>
                        </div>
                    </div>
                    {userRank > 0 && userRank <= 3 && (
                        <div className="pt-4">
                            <p className="font-semibold text-lg text-accent">Félicitations, vous êtes sur le podium !</p>
                            <Button className="mt-4" onClick={handleClaim} disabled={claimed}>
                                {claimed ? "Récompense Réclamée" : "🏆 Réclamer ma récompense"}
                            </Button>
                        </div>
                    )}
                     {userRank > 3 && (
                        <div className="pt-4">
                            <p className="font-semibold">Continuez vos efforts pour atteindre le podium la saison prochaine !</p>
                        </div>
                    )}
                </CardContent>
            </CardHeader>
        </Card>
    );
}


export function LeaderboardClient() {
  const firestore = useFirestore();
  const t = useTranslations();
  const { seasonEndDate } = useGame();
  const [isSeasonOver, setIsSeasonOver] = useState(false);

  // This query always fetches the top 100 for display
  const topPlayersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "leaderboard"), orderBy("score", "desc"), limit(100));
  }, [firestore]);

  // This query fetches ALL players, but only when the season is over, to calculate ranks
  const allPlayersQuery = useMemoFirebase(() => {
    if (!firestore || !isSeasonOver) return null;
    return query(collection(firestore, "leaderboard"), orderBy("score", "desc"));
  }, [firestore, isSeasonOver]);
  
  const { data: topPlayersData, isLoading: isLoadingTop } = useCollection<Player>(topPlayersQuery);
  const { data: allPlayersData, isLoading: isLoadingAll } = useCollection<Player>(allPlayersQuery);

  useEffect(() => {
    const checkSeason = () => {
        if (new Date() > seasonEndDate) {
            setIsSeasonOver(true);
        }
    };
    checkSeason();
    const interval = setInterval(checkSeason, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [seasonEndDate]);

  if (isSeasonOver) {
      if (isLoadingAll) {
          return <div className="text-center p-8">Calcul des résultats finaux...</div>;
      }
      return <EndOfSeasonResults allPlayers={allPlayersData || []} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('leaderboard_top100')}</CardTitle>
      </CardHeader>
      <CardContent>
        <LeaderboardTable players={topPlayersData} isLoading={isLoadingTop} />
      </CardContent>
    </Card>
  );
}
