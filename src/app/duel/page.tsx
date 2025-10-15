
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
import { doc, getDoc, updateDoc, serverTimestamp, DocumentReference } from "firebase/firestore";
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
      showNotification({ title: t('auth_required'), message: t('auth_required_message'), type: 'error' });
      return;
    }
    
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length !== 6) {
      showNotification({ title: t('invalid_code'), message: t('invalid_code_message'), type: 'error' });
      return;
    }

    setIsJoining(true);
    let gameDocRef: DocumentReference | null = null;
    let duelId: string | null = null;

    try {
      // 1. Get the duelId from the game code
      const gameCodeRef = doc(firestore, 'duelGameCodes', code);
      const gameCodeSnap = await getDoc(gameCodeRef).catch(serverError => {
        const permissionError = new FirestorePermissionError({ path: gameCodeRef.path, operation: 'get' });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });

      if (!gameCodeSnap.exists()) {
        showNotification({ title: t('game_not_found'), message: t('game_not_found_message'), type: 'error' });
        setIsJoining(false);
        return;
      }

      duelId = gameCodeSnap.data().duelId;
      if (!duelId) {
        throw new Error("Duel ID not found in game code document.");
      }

      // 2. Get the duel document
      gameDocRef = doc(firestore, "duels", duelId);
      const gameDoc = await getDoc(gameDocRef);

      if (!gameDoc.exists()) {
        showNotification({ title: t('game_not_found'), message: "Le duel associé à ce code n'existe plus.", type: 'error' });
        setIsJoining(false);
        return;
      }
      
      const gameData = gameDoc.data();

      // 3. Validate game state
      if (gameData.status !== 'waiting') {
        showNotification({ title: t('game_full'), message: "Cette partie a déjà commencé ou est terminée.", type: 'error' });
        setIsJoining(false);
        return;
      }
      
      if (gameData.players.length >= 2) {
          showNotification({ title: t('game_full'), message: t('game_full_message'), type: 'error' });
          setIsJoining(false);
          return;
      }

      if (gameData.hostId === user.uid) {
        showNotification({ title: t('cannot_join_own_game'), message: t('cannot_join_own_game_message'), type: 'error' });
        setIsJoining(false);
        return;
      }
      
      // 4. Update the duel document with the new player
      const player2 = {
        uid: user.uid,
        displayName: user.displayName || 'Anonyme',
        photoURL: user.photoURL || '',
      };
      
      const updateData = {
        players: [...gameData.players, player2],
        playerScores: { ...gameData.playerScores, [user.uid]: 0 },
        status: 'active' as const,
        startedAt: serverTimestamp()
      };

      // *** THIS IS THE CRITICAL FIX ***
      // We must update the actual duel document, not the gameCode document.
      await updateDoc(gameDocRef, updateData).catch(serverError => {
        const permissionError = new FirestorePermissionError({
           path: gameDocRef!.path,
           operation: 'update',
           requestResourceData: updateData,
       });
       errorEmitter.emit('permission-error', permissionError);
       throw permissionError;
      });

      // 5. Redirect to the game
      router.push(`/duel/play/${duelId}`);

    } catch (error) {
       console.error("Error joining game:", error);
       showNotification({
          title: t('error'),
          message: "Impossible de rejoindre la partie. Vérifiez le code ou réessayez.",
          type: 'error',
       });
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
