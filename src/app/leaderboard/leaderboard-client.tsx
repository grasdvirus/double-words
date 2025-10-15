
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Medal, Shield, Trophy } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemoFirebase } from "@/firebase/provider";
import { useTranslations } from "@/hooks/use-translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  displayName: string;
  score: number;
  photoURL?: string;
  updatedAt?: { seconds: number, nanoseconds: number };
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

function LeaderboardTable({ players, isLoading, isRecent = false }: { players: Player[] | null, isLoading: boolean, isRecent?: boolean }) {
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
          {isRecent ? (
            <TableHead className="hidden md:table-cell text-center">{t('date')}</TableHead>
          ) : (
            <TableHead className="hidden md:table-cell">{t('tier')}</TableHead>
          )}
          <TableHead className="text-right">{t('score')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players?.map((player, index) => {
          const tier = getTier(player.score);
          const date = player.updatedAt ? new Date(player.updatedAt.seconds * 1000) : null;
          const rank = index + 1;
          return (
            <TableRow 
                key={player.id + index} 
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
              {isRecent ? (
                <TableCell className="hidden md:table-cell text-center">
                    {date ? formatDistanceToNow(date, { addSuffix: true, locale: fr }) : '-'}
                </TableCell>
              ) : (
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    {tier.icon}
                    {tier.name}
                  </div>
                </TableCell>
              )}
              <TableCell className="text-right font-mono text-lg">{player.score}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}


export function LeaderboardClient() {
  const firestore = useFirestore();
  const t = useTranslations();

  const topPlayersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "leaderboard"), orderBy("score", "desc"), limit(10));
  }, [firestore]);
  
  const recentScoresQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "recentScores"), orderBy("updatedAt", "desc"), limit(10));
  }, [firestore]);

  const { data: topPlayersData, isLoading: isLoadingTop } = useCollection<Player>(topPlayersQuery);
  const { data: recentScoresData, isLoading: isLoadingRecent } = useCollection<Player>(recentScoresQuery);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('leaderboard_title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top-scores">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="top-scores">{t('top_players')}</TabsTrigger>
            <TabsTrigger value="recent-scores">{t('recent_scores')}</TabsTrigger>
          </TabsList>
          <TabsContent value="top-scores">
             <LeaderboardTable players={topPlayersData} isLoading={isLoadingTop} />
          </TabsContent>
          <TabsContent value="recent-scores">
             <LeaderboardTable players={recentScoresData} isLoading={isLoadingRecent} isRecent={true} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
