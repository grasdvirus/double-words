
'use client';

import { useParams } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Swords } from 'lucide-react';

export default function DuelPlayPage() {
  const params = useParams();
  const duelId = params.duelId as string;
  
  const firestore = useFirestore();
  const { user } = useUser();

  const duelRef = useMemoFirebase(() => {
    if (!firestore || !duelId) return null;
    return doc(firestore, 'duels', duelId);
  }, [firestore, duelId]);

  const { data: duelData, isLoading } = useDoc(duelRef);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <div className="section-center">
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
        <p className="text-lg">Chargement du duel...</p>
      </div>
    );
  }

  if (!duelData) {
     return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
         <h1 className="text-2xl font-bold text-destructive">Duel non trouvé</h1>
         <p>Cette partie n'existe pas ou a été annulée.</p>
      </div>
     )
  }

  const host = duelData.players.find((p: any) => p.uid === duelData.hostId);
  const opponent = duelData.players.find((p: any) => p.uid !== duelData.hostId);

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl mx-auto animate-fade-in text-center">
            <div className="flex justify-around items-center mb-8">
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={host?.photoURL} alt={host?.displayName} />
                        <AvatarFallback className="text-3xl">{host?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-xl">{host?.displayName}</p>
                    <p className="text-muted-foreground">Hôte</p>
                </div>
                
                <Swords className="h-12 w-12 text-primary animate-pulse" />

                 <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24 border-4 border-muted-foreground">
                        <AvatarImage src={opponent?.photoURL} alt={opponent?.displayName} />
                        <AvatarFallback className="text-3xl">{opponent?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-xl">{opponent?.displayName}</p>
                    <p className="text-muted-foreground">Adversaire</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Le duel va commencer !</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>La logique du jeu est en cours de développement.</p>
                    <p>Bientôt, vous pourrez vous affronter ici !</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
