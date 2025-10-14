
'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Swords, Check, X, Loader2, Crown, ArrowRight, Undo2 } from 'lucide-react';
import { generateDuelChallenge } from '@/ai/flows/generate-duel-challenge';
import { Button } from '@/components/ui/button';
import { LetterGrid } from '@/components/letter-grid';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const ROUNDS_IN_DUEL = 5;

const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function DuelPlayPage() {
  const params = useParams();
  const router = useRouter();
  const duelId = params.duelId as string;
  
  const firestore = useFirestore();
  const { user } = useUser();

  const duelRef = useMemoFirebase(() => {
    if (!firestore || !duelId) return null;
    return doc(firestore, 'duels', duelId);
  }, [firestore, duelId]);

  const { data: duelData, isLoading } = useDoc(duelRef);

  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [disabledLetterIndexes, setDisabledLetterIndexes] = useState<boolean[]>([]);
  
  const currentRoundIndex = duelData?.currentRound || 0;
  const currentRound = duelData?.rounds?.[currentRoundIndex];
  
  // Memoize player info
  const { host, opponent, me, otherPlayer } = useMemo(() => {
    if (!duelData?.players) return {};
    const host = duelData.players.find((p: any) => p.uid === duelData.hostId);
    const opponent = duelData.players.find((p: any) => p.uid !== duelData.hostId);
    const me = duelData.players.find((p: any) => p.uid === user?.uid);
    const otherPlayer = duelData.players.find((p: any) => p.uid !== user?.uid);
    return { host, opponent, me, otherPlayer };
  }, [duelData, user?.uid]);

  const myAnswer = currentRound?.playerAnswers?.[user?.uid || ''];
  const opponentAnswer = otherPlayer ? currentRound?.playerAnswers?.[otherPlayer.uid] : undefined;

  const myScore = duelData?.playerScores?.[me?.uid] ?? 0;
  const opponentScore = duelData?.playerScores?.[otherPlayer?.uid] ?? 0;
  const totalScore = myScore + opponentScore;
  const myScorePercentage = totalScore > 0 ? (myScore / totalScore) * 100 : 50;


  const startNewRound = useCallback(async () => {
    if (!duelRef || !duelData || user?.uid !== duelData.hostId) return;

    setIsGenerating(true);
    try {
        const result = await generateDuelChallenge({
            existingWords: duelData.rounds?.map(r => r.solutionWord) || []
        });

        const word = result.solutionWord.toUpperCase();
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const solutionLetters = word.split('');
        const extraLetters: string[] = [];
        while (extraLetters.length < Math.max(4, 12 - solutionLetters.length)) {
            const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
            if (!solutionLetters.includes(randomLetter)) {
            extraLetters.push(randomLetter);
            }
        }
        
        const newRound = {
            ...result,
            solutionWord: word,
            jumbledLetters: shuffle([...solutionLetters, ...extraLetters]),
            playerAnswers: {}
        };

        const updatedRounds = [...(duelData.rounds || []), newRound];
        await updateDoc(duelRef, {
            rounds: updatedRounds,
            currentRound: (duelData.rounds || []).length
        });

    } catch (e) {
        console.error("Failed to generate duel challenge", e);
    } finally {
        setIsGenerating(false);
    }
  }, [duelRef, duelData, user?.uid]);

  useEffect(() => {
    if (duelData && duelData.status === 'active' && (!duelData.rounds || duelData.rounds.length === 0) && user?.uid === duelData.hostId) {
      startNewRound();
    }
  }, [duelData, user, startNewRound]);

  // Effect to handle player leaving
  useEffect(() => {
    return () => {
      if (!duelData || !user || !duelRef || duelData.status !== 'active') return;

      const isHost = duelData.hostId === user.uid;
      const remainingPlayers = duelData.players.filter(p => p.uid !== user.uid);

      if (isHost) {
        // If host leaves, delete the game
        deleteDoc(duelRef);
      } else if (remainingPlayers.length > 0) {
        // If opponent leaves, set status to completed and declare host as winner
        updateDoc(duelRef, {
          status: 'completed',
          winnerId: remainingPlayers[0].uid,
          endedAt: serverTimestamp(),
          players: remainingPlayers, // Optional: remove leaving player
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelId, user?.uid, duelData?.hostId, duelData?.status]);

  useEffect(() => {
    // If only one player is left in an active game, they win.
    if (duelRef && duelData?.status === 'active' && duelData.players.length === 1) {
      updateDoc(duelRef, {
        status: 'completed',
        winnerId: duelData.players[0].uid,
        endedAt: serverTimestamp()
      });
    }
  }, [duelData, duelRef]);
  

  useEffect(() => {
    if (currentRound && currentRound.jumbledLetters) {
        setInputValue("");
        const letterCount = currentRound.jumbledLetters.length || 0;
        setDisabledLetterIndexes(new Array(letterCount).fill(false));
    }
  }, [currentRound]);
  
  useEffect(() => {
    // If both players have answered, the host prepares the next round
    if (user?.uid === duelData?.hostId && currentRound && currentRound.playerAnswers && Object.keys(currentRound.playerAnswers).length === 2) {
      setTimeout(() => {
        if (currentRoundIndex < ROUNDS_IN_DUEL - 1) {
          startNewRound();
        } else {
            // End of game
            if(duelData?.playerScores) {
              const finalScores = duelData.playerScores;
              const winnerId = Object.keys(finalScores).reduce((a, b) => finalScores[a] > finalScores[b] ? a : b);
              updateDoc(duelRef, { status: 'completed', winnerId: winnerId, endedAt: serverTimestamp() });
            }
        }
      }, 3000); // 3-second pause before next round
    }
  }, [currentRound, user, duelData, startNewRound, currentRoundIndex, duelRef]);

  const handleKeyPress = (key: string, index: number) => {
    if (!currentRound || !currentRound.solutionWord || inputValue.length >= currentRound.solutionWord.length) return;
    setInputValue((prev) => prev + key);
    setDisabledLetterIndexes(prev => {
        const newDisabled = [...prev];
        newDisabled[index] = true;
        return newDisabled;
    });
  };
  
  const handleBackspace = () => {
    if (inputValue.length === 0 || !currentRound || !currentRound.jumbledLetters) return;
    
    const lastChar = inputValue[inputValue.length - 1];
    setInputValue((prev) => prev.slice(0, -1));

    let reEnabled = false;
    for(let i = disabledLetterIndexes.length - 1; i >= 0; i--) {
        if(currentRound.jumbledLetters[i] === lastChar && disabledLetterIndexes[i] && !reEnabled) {
            setDisabledLetterIndexes(prev => {
                const newDisabled = [...prev];
                newDisabled[i] = false;
                return newDisabled;
            });
            reEnabled = true;
        }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting || !currentRound || !user || !duelRef || myAnswer) return;

    setIsSubmitting(true);
    const cleanedInput = inputValue.trim().toUpperCase();

    const isCorrect = cleanedInput === currentRound.solutionWord;

    if (!isCorrect) {
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setInputValue("");
        if(currentRound && currentRound.jumbledLetters) {
            setDisabledLetterIndexes(new Array(currentRound.jumbledLetters.length).fill(false));
        }
      }, 800);
      setTimeout(() => setIsSubmitting(false), 820);
      return;
    }

    const newAnswer = {
        answer: cleanedInput,
        isCorrect: true,
        timeTaken: Date.now() // Simple timestamp for now
    };

    const newPoints = (duelData?.playerScores?.[user.uid] || 0) + 10;

    await updateDoc(duelRef, {
        [`rounds.${currentRoundIndex}.playerAnswers.${user.uid}`]: newAnswer,
        [`playerScores.${user.uid}`]: newPoints
    });

    setIsSubmitting(false);
  };
  
  const renderInputBoxes = () => {
    if (!currentRound || !currentRound.solutionWord) {
      return <div className="flex justify-center items-center gap-2 flex-wrap min-h-14"><Loader2 className="animate-spin" /></div>;
    }

    return (
      <div className="relative min-h-14">
        <div className={cn("flex justify-center items-center gap-2 flex-wrap", isWrong && "animate-shake")}>
          {Array.from({ length: currentRound.solutionWord.length }).map((_, i) => (
            <div
                key={i}
                className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-md border text-2xl font-bold uppercase",
                    "bg-card transition-all duration-300",
                    inputValue[i] && "border-primary ring-2 ring-primary animate-pop-in"
                )}
            >
                {inputValue[i] || ''}
            </div>
          ))}
        </div>
        {isWrong && <span className="text-3xl absolute -right-10 top-1/2 -translate-y-1/2 animate-pop-in">❌</span>}
      </div>
    );
  };


  if (isLoading || !duelData || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <div className="section-center">
            <div className="section-path"><div className="globe"><div className="wrapper"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div></div>
        </div>
        <p className="text-lg pt-24">Chargement du duel...</p>
      </div>
    );
  }

  if (duelData.status === 'completed' || duelData.status === 'abandoned') {
    const winner = duelData.players.find(p => p.uid === duelData.winnerId);
    const isTie = !duelData.winnerId && duelData.status === 'completed';
    
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold text-primary mb-4">Partie terminée !</h1>
            {isTie ? (
                <>
                    <Swords className="h-24 w-24 text-muted-foreground my-8"/>
                    <p className="text-2xl mb-4">Égalité !</p>
                </>
            ) : winner ? (
                <>
                    <Crown className="h-24 w-24 text-yellow-400 my-8 animate-bounce"/>
                    <p className="text-2xl mb-4">Le vainqueur est...</p>
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={winner?.photoURL} alt={winner?.displayName} />
                            <AvatarFallback className="text-5xl">{winner?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-3xl">{winner?.displayName}</p>
                    </div>
                </>
            ) : (
                 <p className="text-2xl my-8">Un joueur a quitté la partie.</p>
            )}

            <Card className="mt-8 w-full max-w-sm">
              <CardHeader>
                <CardTitle>Tableau des scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {duelData.players.map(p => (
                   <div key={p.uid} className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={p.photoURL} alt={p.displayName} />
                            <AvatarFallback>{p.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{p.displayName}</span>
                     </div>
                      <span className="font-bold text-xl text-primary">{duelData.playerScores[p.uid] || 0}</span>
                   </div>
                 ))}
                 {/* Display score for player who may have left */}
                 {Object.keys(duelData.playerScores)
                    .filter(uid => !duelData.players.some(p => p.uid === uid))
                    .map(uid => {
                        const playerInfo = duelData.players.find(p => p.uid === uid); // This might be stale
                        return (
                            <div key={uid} className="flex justify-between items-center opacity-50">
                                <span className="font-semibold italic">Joueur déconnecté</span>
                                <span className="font-bold text-xl text-primary">{duelData.playerScores[uid] || 0}</span>
                            </div>
                        )
                    })
                 }
              </CardContent>
            </Card>

            <Button onClick={() => router.push('/duel')} className="mt-12">
                Retour au lobby des duels
            </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl mx-auto animate-fade-in text-center">
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 border-2 border-primary">
                          <AvatarImage src={me?.photoURL} alt={me?.displayName} />
                          <AvatarFallback>{me?.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold hidden sm:inline">{me?.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="font-semibold hidden sm:inline">{otherPlayer?.displayName}</span>
                      <Avatar className="h-10 w-10 border-2">
                          <AvatarImage src={otherPlayer?.photoURL} alt={otherPlayer?.displayName} />
                          <AvatarFallback>{otherPlayer?.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                  </div>
              </div>
              <div className="relative h-6 w-full bg-muted rounded-full overflow-hidden border">
                  <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 z-10" style={{ width: `${myScorePercentage}%` }}></div>
                  <div className="absolute inset-0 flex justify-between items-center px-4 z-20">
                      <span className="font-bold text-lg text-primary-foreground mix-blend-difference">{myScore}</span>
                      <span className="font-bold text-lg text-foreground mix-blend-difference">{opponentScore}</span>
                  </div>
              </div>
              <p className="text-xl font-bold text-muted-foreground">Manche {currentRoundIndex + 1}/{ROUNDS_IN_DUEL}</p>
            </div>
            
            {!currentRound ? (
                <Card>
                    <CardHeader>
                        <CardTitle>En attente du prochain tour</CardTitle>
                    </CardHeader>
                    <CardContent className='flex justify-center items-center p-8'>
                        {user?.uid === duelData.hostId ? (
                            <Button onClick={startNewRound} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className='animate-spin'/> : "Démarrer la manche"}
                            </Button>
                        ) : (
                            <div className='flex items-center gap-3 text-muted-foreground'>
                                <Loader2 className="animate-spin"/>
                                <p>L'hôte prépare la prochaine manche...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full max-w-3xl flex flex-col gap-4">
                     <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-semibold">
                            Défi : {currentRound.description}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    
                    <div className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                {renderInputBoxes()}
                                <Button type="button" size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2 transform-gpu" onClick={handleBackspace} disabled={isSubmitting || inputValue.length === 0 || !!myAnswer}>
                                    <Undo2 className="h-5 w-5"/>
                                </Button>
                            </div>

                            <LetterGrid letters={currentRound.jumbledLetters || []} onKeyPress={handleKeyPress} disabledLetters={disabledLetterIndexes} disabled={isSubmitting || !!myAnswer} />

                            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !currentRound || !currentRound.solutionWord || inputValue.length !== currentRound.solutionWord.length || !!myAnswer}>
                                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                {myAnswer ? "En attente de l'adversaire..." : 'Valider'}
                                {!myAnswer && !isSubmitting && <ArrowRight className="ml-2" />}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
