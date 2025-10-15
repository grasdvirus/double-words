
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Users, Copy, Clock, Play, Loader2 } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useNotification } from '@/contexts/notification-context';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from '@/hooks/use-translations';

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
  const { showNotification } = useNotification();
  const t = useTranslations();
  
  const [duration, setDuration] = useState<string>("2");
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [duelId, setDuelId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDuel = async () => {
    if (!user || !firestore) {
      showNotification({
        title: t('auth_required'),
        message: t('auth_required_message'),
        type: 'error'
      });
      router.push('/duel');
      return;
    }

    setIsCreating(true);
    const code = generateGameCode();
    const hostPlayer = {
      uid: user.uid,
      displayName: user.displayName || 'Anonyme',
      photoURL: user.photoURL || '',
    };
    
    const duelData = {
        gameCode: code,
        hostId: user.uid,
        status: 'waiting' as const,
        players: [hostPlayer],
        playerScores: { [user.uid]: 0 },
        duration: parseInt(duration, 10),
        startedAt: null,
        wordHistory: [],
        currentChallenge: null,
        createdAt: serverTimestamp(),
    };

    const duelsCollection = collection(firestore, 'duels');
    
    try {
        const docRef = await addDoc(duelsCollection, duelData).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: duelsCollection.path,
                operation: 'create',
                requestResourceData: duelData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // Re-throw to be caught by outer try-catch
        });

        // Create the game code mapping document
        const gameCodeRef = doc(firestore, 'duelGameCodes', code);
        await setDoc(gameCodeRef, { duelId: docRef.id }).catch(serverError => {
             const permissionError = new FirestorePermissionError({
                path: gameCodeRef.path,
                operation: 'create',
                requestResourceData: { duelId: docRef.id },
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });

        setGameCode(code);
        setDuelId(docRef.id);
    } catch (error) {
        console.error("Error creating duel:", error);
        showNotification({
            title: t('error'),
            message: "Impossible de créer la partie. Vérifiez les règles de sécurité Firestore.",
            type: 'error',
        });
    } finally {
        setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!duelId || !firestore) return;
    
    const unsub = onSnapshot(doc(firestore, 'duels', duelId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPlayers(data.players || []);
        if (data.status === 'active' && data.players.length === 2) {
           router.push(`/duel/play/${duelId}`);
        }
      }
    }, (err) => {
        const permissionError = new FirestorePermissionError({
            path: `duels/${duelId}`,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    return () => unsub();
  }, [duelId, firestore, router]);


  const copyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      showNotification({
        title: t('copied'),
        message: t('copied_message'),
        type: 'success'
      });
    }
  };
  
  if (isCreating) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <div className="section-center">
            <div className="section-path">
                <div className="globe"><div className="wrapper"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div>
            </div>
        </div>
        <p className="text-lg pt-24">{t('creating_game')}</p>
      </div>
    );
  }

  if (gameCode && duelId) {
     return (
        <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
                <div className="container py-8 max-w-2xl mx-auto animate-fade-in text-center">
                <h1 className="text-4xl font-bold text-primary mb-2">{t('waiting_room_title')}</h1>
                <p className="text-muted-foreground mb-8">{t('waiting_room_description')}</p>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{t('game_code')}</CardTitle>
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
                                {t('connected_players')}
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
                                <div className="h-20 w-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden">
                                        <div className="spinner scale-125">
                                        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                                        </div>
                                </div>
                                <p>{t('waiting_for_player')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
     );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in">
           <h1 className="text-4xl font-bold text-primary mb-8 text-center">{t('create_duel_title')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('game_options')}</CardTitle>
                    <CardDescription>{t('game_options_description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="duration-select" className="flex items-center gap-2">
                        <Clock className="h-5 w-5"/>
                        {t('duration')}
                      </Label>
                      <Select
                        value={duration}
                        onValueChange={(value) => setDuration(value)}
                      >
                        <SelectTrigger id="duration-select" className="w-[180px]">
                          <SelectValue placeholder={t('duration_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t('1_minute')}</SelectItem>
                          <SelectItem value="2">{t('2_minutes')}</SelectItem>
                          <SelectItem value="3">{t('3_minutes')}</SelectItem>
                          <SelectItem value="4">{t('4_minutes')}</SelectItem>
                          <SelectItem value="5">{t('5_minutes')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <Button onClick={handleCreateDuel} className="w-full" disabled={isUserLoading || isCreating}>
                        {isCreating ? <Loader2 className="animate-spin" /> : <Play className="mr-2 h-4 w-4"/>}
                        {t('create_game_button')}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
