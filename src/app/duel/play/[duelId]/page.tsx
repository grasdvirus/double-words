
'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp, deleteDoc, Timestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Swords, Check, X, Loader2, Crown, ArrowRight, Undo2, Lightbulb, Key } from 'lucide-react';
import { generateDuelChallenge } from '@/ai/flows/generate-duel-challenge';
import { Button } from '@/components/ui/button';
import { LetterGrid } from '@/components/letter-grid';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useNotification } from '@/contexts/notification-context';
import { useTranslations } from '@/hooks/use-translations';
import { useGame } from '@/hooks/use-game';


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
  const t = useTranslations();
  const { settings } = useGame();
  
  const firestore = useFirestore();
  const { user } = useUser();

  const duelRef = useMemoFirebase(() => {
    if (!firestore || !duelId) return null;
    return doc(firestore, 'duels', duelId);
  }, [firestore, duelId]);

  const { data: duelData, isLoading } = useDoc(duelRef);
  const { showNotification } = useNotification();

  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [disabledLetterIndexes, setDisabledLetterIndexes] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const [isRevealOnCooldown, setIsRevealOnCooldown] = useState(false);
  
  const currentChallenge = duelData?.currentChallenge;
  
  const { me, otherPlayer } = useMemo(() => {
    if (!duelData?.players || !user?.uid) return { me: null, otherPlayer: null };
    const me = duelData.players.find((p: any) => p.uid === user.uid);
    const otherPlayer = duelData.players.find((p: any) => p.uid !== user.uid);
    return { me, otherPlayer };
  }, [duelData, user?.uid]);

  const myScore = duelData?.playerScores?.[me?.uid] ?? 0;
  const opponentScore = duelData?.playerScores?.[otherPlayer?.uid] ?? 0;
  const totalScore = myScore + opponentScore;
  const myScorePercentage = totalScore > 0 ? (myScore / totalScore) * 100 : 50;

  const getNewChallenge = useCallback(async () => {
    if (!duelRef || !duelData || user?.uid !== duelData.hostId) return;

    setIsGenerating(true);
    try {
        const result = await generateDuelChallenge({
            existingWords: duelData.wordHistory || [],
            language: settings.language,
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
        
        const newChallenge = {
            ...result,
            solutionWord: word,
            jumbledLetters: shuffle([...solutionLetters, ...extraLetters]),
        };

        await updateDoc(duelRef, {
            currentChallenge: newChallenge,
            wordHistory: [...(duelData.wordHistory || []), word]
        });

    } catch (e) {
        console.error("Failed to generate duel challenge", e);
    } finally {
        setIsGenerating(false);
    }
  }, [duelRef, duelData, user?.uid, settings.language]);
  
  // Timer logic
  useEffect(() => {
    if (duelData?.status !== 'active' || !duelData.startedAt || !duelData.duration) {
      setTimeLeft(duelData?.duration ? duelData.duration * 60 : null);
      return;
    }
  
    const startTime = (duelData.startedAt as Timestamp).toDate().getTime();
    const durationMillis = duelData.duration * 60 * 1000;
    const endTime = startTime + durationMillis;
  
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining / 1000);
  
      if (remaining === 0) {
        clearInterval(interval);
        if (user?.uid === duelData.hostId && duelData.status === 'active') {
          const finalScores = duelData.playerScores;
          const playerIds = Object.keys(finalScores);
          let winnerId: string | null = null;
          if (playerIds.length === 2) {
              const score1 = finalScores[playerIds[0]];
              const score2 = finalScores[playerIds[1]];
              if (score1 > score2) {
                  winnerId = playerIds[0];
              } else if (score2 > score1) {
                  winnerId = playerIds[1];
              }
          } else if (playerIds.length === 1) {
            winnerId = playerIds[0];
          }

          updateDoc(duelRef, { status: 'completed', winnerId, endedAt: serverTimestamp() });
        }
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [duelData, duelRef, user?.uid]);


  useEffect(() => {
    // Host generates first challenge when game becomes active
    if (duelData && duelData.status === 'active' && !duelData.currentChallenge && user?.uid === duelData.hostId) {
      getNewChallenge();
    }
  }, [duelData, user, getNewChallenge]);

  // Effect to handle player leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (!duelData || !user || !duelRef || duelData.status !== 'active') return;
        
        // This is a best-effort attempt. It's not guaranteed to run.
        // The real reliable logic is handled by onSnapshot detecting player count change.
        updateDoc(duelRef, {
            status: 'abandoned',
            winnerId: otherPlayer?.uid || null,
            endedAt: serverTimestamp(),
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, [duelId, user, duelData, duelRef, otherPlayer]);

  useEffect(() => {
    // This effect reliably detects if a player has left.
    if (duelRef && duelData?.status === 'active' && duelData.players.length < 2 && duelData.startedAt) {
      updateDoc(duelRef, {
        status: 'abandoned', // Use a different status to distinguish from a normal finish
        winnerId: duelData.players.length > 0 ? duelData.players[0].uid : null,
        endedAt: serverTimestamp()
      });
    }
  }, [duelData, duelRef]);
  
  useEffect(() => {
    if (currentChallenge) {
        setInputValue("");
        const letterCount = currentChallenge.jumbledLetters?.length || 0;
        setDisabledLetterIndexes(new Array(letterCount).fill(false));
        setRevealedIndexes([]);
        setRevealCount(0);
    }
  }, [currentChallenge]);

  const handleKeyPress = (key: string, index: number) => {
    if (!currentChallenge || !currentChallenge.solutionWord || inputValue.length >= currentChallenge.solutionWord.length) return;
    setInputValue((prev) => prev + key);
    setDisabledLetterIndexes(prev => {
        const newDisabled = [...prev];
        newDisabled[index] = true;
        return newDisabled;
    });
  };
  
const handleBackspace = () => {
    if (inputValue.length === 0 || !currentChallenge || !currentChallenge.jumbledLetters) return;

    const lastTypedChar = inputValue.slice(-1);
    const lastTypedCharIndexInInput = inputValue.length - 1;

    // Check if the character being deleted was one revealed by the hint system.
    // If it was, we just clear the input box but don't re-enable any letter in the grid.
    if (revealedIndexes.includes(lastTypedCharIndexInInput)) {
        setInputValue(inputValue.slice(0, -1));
        return; // Don't proceed to re-enable a grid letter
    }

    setInputValue(inputValue.slice(0, -1));

    // Find the last used index in the grid for the character we're removing.
    // This logic is complex with duplicate letters. A simpler but effective way
    // is to find the first disabled letter that matches the one being removed and re-enable it.
    // We search backwards to correctly handle duplicates added sequentially.
    let indexToReEnable = -1;
    for (let i = disabledLetterIndexes.length - 1; i >= 0; i--) {
        if (disabledLetterIndexes[i] && currentChallenge.jumbledLetters[i] === lastTypedChar) {
            indexToReEnable = i;
            break; // Found the most recently disabled matching letter
        }
    }
    
    if (indexToReEnable !== -1) {
        setDisabledLetterIndexes(prev => {
            const newDisabled = [...prev];
            newDisabled[indexToReEnable] = false;
            return newDisabled;
        });
    }
};

    const showHint = async () => {
        if (currentChallenge?.hint && user && duelRef) {
          showNotification({
            title: t('hint'),
            message: currentChallenge.hint,
            type: 'info',
            duration: 'persistent',
          });
          const newPoints = Math.max(0, (duelData?.playerScores?.[user.uid] || 0) - 2);
          await updateDoc(duelRef, {
              [`playerScores.${user.uid}`]: newPoints,
          });
        }
      };

    const handleRevealLetter = async () => {
        if (!currentChallenge || !user || !duelRef || revealCount >= 3 || isRevealOnCooldown) return;
    
        const solution = currentChallenge.solutionWord;
        let possibleIndexesToReveal: number[] = [];
        for (let i = 0; i < solution.length; i++) {
            if (inputValue[i] !== solution[i] && !revealedIndexes.includes(i)) {
                possibleIndexesToReveal.push(i);
            }
        }
    
        if (possibleIndexesToReveal.length === 0) return;
    
        const indexToReveal = possibleIndexesToReveal[Math.floor(Math.random() * possibleIndexesToReveal.length)];
        const letterToReveal = solution[indexToReveal];
    
        // Update input field
        let newInputValueArray = inputValue.padEnd(solution.length, ' ').split('');
        newInputValueArray[indexToReveal] = letterToReveal;
        setInputValue(newInputValueArray.join('').trimEnd());
        setRevealedIndexes(prev => [...prev, indexToReveal]);
    
        // Find and disable the corresponding letter in the jumbled grid
        let gridIndexToDisable = -1;
        for (let i = 0; i < currentChallenge.jumbledLetters.length; i++) {
            if (currentChallenge.jumbledLetters[i] === letterToReveal && !disabledLetterIndexes[i]) {
                gridIndexToDisable = i;
                break;
            }
        }
    
        if (gridIndexToDisable !== -1) {
            setDisabledLetterIndexes(prev => {
                const newDisabled = [...prev];
                newDisabled[gridIndexToDisable] = true;
                return newDisabled;
            });
        }
    
        // Apply penalty and cooldown
        const newPoints = Math.max(0, (duelData?.playerScores?.[user.uid] || 0) - 3);
        await updateDoc(duelRef, {
            [`playerScores.${user.uid}`]: newPoints,
        });
    
        setRevealCount(prev => prev + 1);
        setIsRevealOnCooldown(true);
        setTimeout(() => setIsRevealOnCooldown(false), 5000);
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting || !currentChallenge || !currentChallenge.solutionWord || !user || !duelRef) return;

    setIsSubmitting(true);
    const cleanedInput = inputValue.trim().toUpperCase();

    if (cleanedInput !== currentChallenge.solutionWord) {
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setInputValue("");
        if(currentChallenge && currentChallenge.jumbledLetters) {
            setDisabledLetterIndexes(new Array(currentChallenge.jumbledLetters.length).fill(false));
            setRevealedIndexes([]);
        }
      }, 800);
      setTimeout(() => setIsSubmitting(false), 820);
      return;
    }

    const newPoints = (duelData?.playerScores?.[user.uid] || 0) + 10;

    await updateDoc(duelRef, {
        [`playerScores.${user.uid}`]: newPoints,
    });

    setIsSubmitting(false);
    // Only host generates next challenge
    if (user.uid === duelData?.hostId) {
        getNewChallenge();
    }
  };
  
  const renderInputBoxes = () => {
    if (isGenerating || !currentChallenge || !currentChallenge.solutionWord) {
      return <div className="flex justify-center items-center gap-2 flex-wrap min-h-14"><Loader2 className="animate-spin" /></div>;
    }

    return (
      <div className="relative min-h-14">
        <div className={cn("flex justify-center items-center gap-2 flex-wrap", isWrong && "animate-shake")}>
          {Array.from({ length: currentChallenge.solutionWord.length }).map((_, i) => (
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
        <p className="text-lg pt-24">{t('loading_duel')}</p>
      </div>
    );
  }
  
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '...';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (duelData.status === 'completed' || duelData.status === 'abandoned') {
    const winner = duelData.players.find(p => p.uid === duelData.winnerId);
    const isTie = !duelData.winnerId && myScore === opponentScore && duelData.status === 'completed';
    
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold text-primary mb-4">{t('game_over')}</h1>
            {isTie ? (
                <>
                    <Swords className="h-24 w-24 text-muted-foreground my-8"/>
                    <p className="text-2xl mb-4">{t('tie_game')}</p>
                </>
            ) : winner ? (
                <>
                    <Crown className="h-24 w-24 text-yellow-400 my-8 animate-bounce"/>
                    <p className="text-2xl mb-4">{t('winner_is')}</p>
                    <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-32 w-32 border-4 border-primary">
                            <AvatarImage src={winner?.photoURL} alt={winner?.displayName} />
                            <AvatarFallback className="text-5xl">{winner?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-3xl">{winner?.displayName}</p>
                    </div>
                </>
            ) : duelData.status === 'abandoned' ? (
                 <p className="text-2xl my-8">{t('player_left_game')}</p>
            ) : (
                 <p className="text-2xl my-8">{t('game_over')}</p>
            )}

            <Card className="mt-8 w-full max-w-sm">
              <CardHeader>
                <CardTitle>{t('score_board')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {(duelData.players.length > 0 ? duelData.players : [me, otherPlayer].filter(Boolean)).map(p => (
                   p && <div key={p.uid} className="flex justify-between items-center">
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
                 {Object.keys(duelData.playerScores)
                    .filter(uid => !duelData.players.some(p => p.uid === uid) && (me?.uid === uid || otherPlayer?.uid === uid))
                    .map(uid => {
                      const disconnectedPlayer = uid === me?.uid ? me : otherPlayer;
                      return (
                        <div key={uid} className="flex justify-between items-center opacity-50">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                  <AvatarImage src={disconnectedPlayer?.photoURL} alt={disconnectedPlayer?.displayName} />
                                  <AvatarFallback>{disconnectedPlayer?.displayName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-semibold italic">{disconnectedPlayer?.displayName || t('disconnected_player')}</span>
                            </div>
                            <span className="font-bold text-xl text-primary">{duelData.playerScores[uid] || 0}</span>
                        </div>
                      )
                    })
                 }
              </CardContent>
            </Card>

            <Button onClick={() => router.push('/duel')} className="mt-12">
                {t('back_to_duel_lobby')}
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
              <p className="text-xl font-bold text-muted-foreground">{t('time_remaining')} : {formatTime(timeLeft)}</p>
            </div>
            
            {!currentChallenge ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('waiting_for_challenge')}</CardTitle>
                    </CardHeader>
                    <CardContent className='flex justify-center items-center p-8'>
                        {user?.uid === duelData.hostId ? (
                            <Button onClick={getNewChallenge} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className='animate-spin'/> : t('start_game')}
                            </Button>
                        ) : (
                            <div className='flex items-center gap-3 text-muted-foreground'>
                                <Loader2 className="animate-spin"/>
                                <p>{t('host_is_preparing')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full max-w-3xl flex flex-col gap-4">
                     <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-semibold">
                            {t('challenge')}: {currentChallenge.description}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <div className="flex justify-center gap-2 mb-2">
                        <Button variant="outline" size="sm" onClick={showHint} disabled={isSubmitting || !currentChallenge.hint}>
                            <Lightbulb className="mr-2 h-4 w-4" />
                            {t('hint_penalty')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRevealLetter}
                            disabled={isSubmitting || revealCount >= 3 || isRevealOnCooldown || !currentChallenge}
                            className="relative"
                        >
                            <Key className="mr-2 h-4 w-4" />
                            Révéler (-3 pts)
                            {isRevealOnCooldown && <span className="absolute -top-1 -right-1 text-xs bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center">...</span>}
                            <span className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                                {3 - revealCount}
                            </span>
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                {renderInputBoxes()}
                                <Button type="button" size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2 transform-gpu" onClick={handleBackspace} disabled={isSubmitting || inputValue.length === 0}>
                                    <Undo2 className="h-5 w-5"/>
                                </Button>
                            </div>

                            {currentChallenge.jumbledLetters && (
                                <LetterGrid letters={currentChallenge.jumbledLetters || []} onKeyPress={handleKeyPress} disabledLetters={disabledLetterIndexes} disabled={isSubmitting} />
                            )}

                            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !currentChallenge || !currentChallenge.solutionWord || inputValue.length !== currentChallenge.solutionWord.length}>
                                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                {t('submit')}
                                {!isSubmitting && <ArrowRight className="ml-2" />}
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

    