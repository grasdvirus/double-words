
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { Users, Copy } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter, FirestorePermissionError } from '@/firebase/errors';


function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateDuelPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (isUserLoading || !firestore) return;
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour créer un duel.',
      });
      router.push('/duel');
      return;
    }

    const createDuel = () => {
      const code = generateGameCode();
      const hostPlayer = {
        uid: user.uid,
        displayName: user.displayName || 'Anonyme',
        photoURL: user.photoURL || '',
      };
      
      const duelData = {
          gameCode: code,
          hostId: user.uid,
          status: 'waiting',
          players: [hostPlayer],
          createdAt: serverTimestamp(),
      };

      const duelsCollection = collection(firestore, 'duels');
      
      addDoc(duelsCollection, duelData)
        .then(docRef => {
            setGameCode(code);
            setDuelId(docRef.id);
        })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: duelsCollection.path,
                operation: 'create',
                requestResourceData: duelData,
            });
            errorEmitter.emit('permission-error', permissionError);
            
            // Fallback user notification
            toast({
              variant: 'destructive',
              title: 'Erreur de permission',
              description: 'Impossible de créer la partie. Vérifiez vos permissions.',
            });
            router.push('/duel');
        });
    };

    createDuel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading, firestore, router, toast]);

  useEffect(() => {
    if (!duelId || !firestore) return;
    
    const unsub = onSnapshot(doc(firestore, 'duels', duelId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPlayers(data.players || []);
        if (data.status === 'active') {
          // router.push(`/duel/play/${duelId}`);
          console.log("Game is active, redirecting soon...");
        }
      }
    });

    return () => unsub();
  }, [duelId, firestore, router]);


  const copyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      toast({
        title: 'Copié !',
        description: 'Le code de la partie a été copié dans le presse-papiers.',
      });
    }
  };
  
  if (!gameCode) {
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
        <p className="text-lg">Création de la partie...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in text-center">
           <h1 className="text-4xl font-bold text-primary mb-2">Salle d'attente</h1>
           <p className="text-muted-foreground mb-8">Partagez ce code avec un ami pour qu'il vous rejoigne.</p>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Code de la partie</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center gap-4">
                    <p className="text-5xl font-bold tracking-widest text-primary font-mono">{gameCode}</p>
                    <Button onClick={copyCode} variant="ghost" size="icon">
                        <Copy className="h-6 w-6"/>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-3">
                        <Users className="h-6 w-6" />
                        Joueurs connectés
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center gap-8">
                    {players.map((p, index) => (
                        <div key={p.uid} className="flex flex-col items-center gap-2 animate-fade-in-up" style={{animationDelay: `${index * 100}ms`}}>
                             <Avatar className="h-20 w-20 border-2 border-primary">
                                <AvatarImage src={p.photoURL} alt={p.displayName} />
                                <AvatarFallback className="text-2xl">{p.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{p.displayName}</p>
                        </div>
                    ))}
                     {players.length < 2 && (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                           <div className="h-20 w-20 rounded-full border-2 border-dashed flex items-center justify-center p-2">
                               <div className="section-center scale-[0.3] -translate-y-1/2 top-1/2">
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
                           <p>En attente...</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
