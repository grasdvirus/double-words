
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Users, Gamepad, KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFirestore, useUser } from "@/firebase";
import { collection, query, where, getDoc, doc, setDoc, serverTimestamp, getDocs, updateDoc } from "firebase/firestore";
import { useNotification } from "@/contexts/notification-context";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { useTranslations } from "@/hooks/use-translations";


export default function DuelLobbyPage() {
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const t = useTranslations();

  const handleJoinGame = async () => {
    if (!user || !firestore) {
      showNotification({
        title: t('auth_required'),
        message: t('auth_required_message'),
        type: 'error'
      });
      return;
    }
    
    const code = joinCode.toUpperCase();
    if (!code || code.length !== 6) {
      showNotification({
        title: t('invalid_code'),
        message: t('invalid_code_message'),
        type: 'error'
      });
      return;
    }

    setIsJoining(true);

    try {
      // 1. Look up the game code in the duelGameCodes collection
      const gameCodeRef = doc(firestore, 'duelGameCodes', code);
      const gameCodeSnap = await getDoc(gameCodeRef);

      if (!gameCodeSnap.exists()) {
        showNotification({
          title: t('game_not_found'),
          message: t('game_not_found_message'),
          type: 'error'
        });
        setIsJoining(false);
        return;
      }

      const { duelId } = gameCodeSnap.data();
      const gameDocRef = doc(firestore, "duels", duelId);
      const gameDoc = await getDoc(gameDocRef);

      if (!gameDoc.exists() || gameDoc.data().status !== 'waiting') {
        showNotification({
          title: t('game_not_found'),
          message: t('game_not_found_message'),
          type: 'error'
        });
        setIsJoining(false);
        return;
      }

      const gameData = gameDoc.data();
      
      if (gameData.hostId === user.uid) {
        showNotification({
          title: t('cannot_join_own_game'),
          message: t('cannot_join_own_game_message'),
          type: 'error'
        });
        setIsJoining(false);
        return;
      }
      
      if (gameData.players.length >= 2) {
          showNotification({
             title: t('game_full'),
             message: t('game_full_message'),
             type: 'error'
          });
          setIsJoining(false);
          return;
      }

      const player2 = {
        uid: user.uid,
        displayName: user.displayName || 'Anonyme',
        photoURL: user.photoURL || '',
      };
      
      const updatedPlayers = [...gameData.players, player2];
      const updatedScores = { ...gameData.playerScores, [user.uid]: 0 };

      const updateData = {
        players: updatedPlayers,
        playerScores: updatedScores,
        status: 'active',
        startedAt: serverTimestamp() // Start the clock
      };

      await updateDoc(gameDocRef, updateData)
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: gameDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsJoining(false);
            throw error;
        });

      router.push(`/duel/play/${gameDoc.id}`);

    } catch (error) {
       if (!(error instanceof FirestorePermissionError)) {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
           path: `duelGameCodes/${code}`,
           operation: 'get'
         }));
       }
       setIsJoining(false);
    }
  };


  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-2xl mx-auto animate-fade-in">
          <h1 className="text-4xl font-bold text-primary mb-8 text-center flex items-center justify-center gap-4">
            <Users className="h-10 w-10" />
            {t('lobby_title')}
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gamepad className="h-6 w-6 text-primary" />
                  {t('create_a_game')}
                </CardTitle>
                <CardDescription>
                  {t('create_game_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button asChild className="w-full" disabled={isUserLoading}>
                  <Link href="/duel/create">
                    {t('setup_game')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <KeyRound className="h-6 w-6 text-primary" />
                  {t('join_a_game')}
                </CardTitle>
                <CardDescription>
                  {t('join_game_description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end gap-4">
                 <Input 
                    placeholder={t('enter_code')} 
                    className="text-center text-lg h-12 tracking-widest font-mono" 
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    disabled={isJoining || isUserLoading}
                  />
                 <Button className="w-full" onClick={handleJoinGame} disabled={isJoining || isUserLoading}>
                    {isJoining ? <Loader2 className="animate-spin" /> : t('joining_game')}
                    {!isJoining && <ArrowRight className="ml-2 h-4 w-4" />}
                 </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
