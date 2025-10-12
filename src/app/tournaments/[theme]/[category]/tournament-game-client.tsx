
"use client";

import { useState, useCallback, FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/use-game";
import { LevelCompleteDialog } from "@/components/level-complete-dialog";
import { TimeUpDialog } from "@/components/time-up-dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, LoaderCircle, Undo2, Clock, Lightbulb } from "lucide-react";
import { LetterGrid } from "@/components/letter-grid";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { getTournamentLevel, getTournamentMaxLevel, TournamentLevel } from "@/lib/tournament-levels";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const LEVEL_TIME = 60; // 60 seconds per level

const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

interface LevelData {
  challenge: string;
  description: string;
  solutionWord: string;
  jumbledLetters: string[];
}

interface TournamentGameClientProps {
    theme: string;
    category: string;
}

export function TournamentGameClient({ theme, category }: TournamentGameClientProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { score, updateScore } = useGame();
  
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [lastRoundPoints, setLastRoundPoints] = useState({ points: 0, bonus: 0 });
  
  const [currentLevelData, setCurrentLevelData] = useState<LevelData | null>(null);
  const [level, setLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(0);

  const [disabledLetterIndexes, setDisabledLetterIndexes] = useState<boolean[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIME);
  const [isWrong, setIsWrong] = useState(false);
  const [scoreKey, setScoreKey] = useState(0);
  const [levelKey, setLevelKey] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const timerRef = useRef<number | null>(null);
  const levelStartTimeRef = useRef<number | null>(null);

  const { toast } = useToast();
  
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeUp = useCallback(() => {
      stopTimer();
      updateScore(-10);
      setShowTimeUp(true);
  }, [updateScore, stopTimer]);


  const startTimer = useCallback(() => {
    stopTimer();
    levelStartTimeRef.current = Date.now();
    setTimeRemaining(LEVEL_TIME);

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - (levelStartTimeRef.current || now)) / 1000;
      const newTimeRemaining = Math.max(0, LEVEL_TIME - elapsed);
      setTimeRemaining(newTimeRemaining);

      if (newTimeRemaining > 0) {
        timerRef.current = requestAnimationFrame(animate);
      } else {
        handleTimeUp();
      }
    };
    timerRef.current = requestAnimationFrame(animate);
  }, [stopTimer, handleTimeUp]);

  const prepareLevelData = useCallback((forLevel: number): LevelData | null => {
    const levelConfig = getTournamentLevel(theme, category, forLevel);
    
    if (!levelConfig) {
      return null;
    }

    const word = levelConfig.solutionWord.toUpperCase();
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const solutionLetters = word.split('');
    const extraLetters: string[] = [];
    while (extraLetters.length < Math.max(2, 12 - solutionLetters.length)) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!solutionLetters.includes(randomLetter)) {
        extraLetters.push(randomLetter);
      }
    }
    
    const allLetters = shuffle([...solutionLetters, ...extraLetters]);
    
    return {
      challenge: levelConfig.challenge,
      description: levelConfig.description,
      solutionWord: word,
      jumbledLetters: allLetters,
    };
  }, [theme, category]);

  const setupLevel = useCallback((levelNumber: number, isRetry = false) => {
    const data = prepareLevelData(levelNumber);
    if (!data) {
      setCurrentLevelData(null); // End of tournament
      return;
    }

    setCurrentLevelData(data);
    setInputValue("");
    setDisabledLetterIndexes(new Array(data.jumbledLetters.length).fill(false));
    setShowLevelComplete(false);
    setShowTimeUp(false);
    
    if (!isRetry) {
      startTimer();
    }
  }, [startTimer, prepareLevelData]);


  useEffect(() => {
    const max = getTournamentMaxLevel(theme, category);
    if (max > 0) {
      setMaxLevel(max);
      setupLevel(level);
    } else {
      toast({ variant: "destructive", title: "Erreur", description: "Ce tournoi n'existe pas." });
    }
    setIsInitialLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, category]);

  useEffect(() => {
    if (user && firestore && score > 0) {
      const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
      setDocumentNonBlocking(leaderboardRef, {
        displayName: user.displayName || "Joueur anonyme",
        photoURL: user.photoURL || "",
        score: score,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    setScoreKey(prev => prev + 1);
  }, [score, user, firestore]);
  
  useEffect(() => {
    setLevelKey(prev => prev + 1);
  }, [level]);

  const handleKeyPress = (key: string, index: number) => {
    if (!currentLevelData || inputValue.length >= currentLevelData.solutionWord.length || showTimeUp) return;
    setInputValue((prev) => prev + key);
    setDisabledLetterIndexes(prev => {
        const newDisabled = [...prev];
        newDisabled[index] = true;
        return newDisabled;
    });
  };
  
  const handleBackspace = () => {
     if (inputValue.length === 0 || showTimeUp || !currentLevelData) return;
    
    const lastChar = inputValue[inputValue.length - 1];
    setInputValue((prev) => prev.slice(0, -1));

    let reEnabled = false;
    for(let i = disabledLetterIndexes.length - 1; i >= 0; i--) {
        if(currentLevelData.jumbledLetters[i] === lastChar && disabledLetterIndexes[i] && !reEnabled) {
            setDisabledLetterIndexes(prev => {
                const newDisabled = [...prev];
                newDisabled[i] = false;
                return newDisabled;
            });
            reEnabled = true;
        }
    }
  };

  const showHint = () => {
    toast({
      title: "Indice",
      description: "Pas d'indice dans ce mode, vous êtes un pro !",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting || showTimeUp || showLevelComplete || !currentLevelData) return;

    setIsSubmitting(true);
    const cleanedInput = inputValue.trim().toUpperCase();

    if (cleanedInput !== currentLevelData.solutionWord) {
      updateScore(-5);
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setInputValue("");
        if(currentLevelData) {
            setDisabledLetterIndexes(new Array(currentLevelData.jumbledLetters.length).fill(false));
        }
      }, 800);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 820);
      return;
    }
    
    stopTimer();
    
    const timeBonus = Math.floor(timeRemaining / 10);
    const totalPoints = 10 + timeBonus;

    updateScore(totalPoints);
    
    setLastRoundPoints({ points: totalPoints, bonus: timeBonus });
    setShowLevelComplete(true);
    setIsSubmitting(false);
  };
  
  const handleNextLevel = () => {
    const next = level + 1;
    setLevel(next);
    setShowLevelComplete(false);
    setupLevel(next);
  };

  const handleRetry = () => {
    setShowTimeUp(false);
    // Restart with a new word from the same level
    setupLevel(level, true);
    startTimer();
  };
  
  const renderInputBoxes = () => {
    if (isInitialLoading || !currentLevelData) {
      return (
        <div className="flex justify-center items-center gap-2 flex-wrap min-h-[56px]">
          <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
        </div>
      );
    }

    return (
      <div className="relative min-h-[56px]">
        <div className={cn("flex justify-center items-center gap-2 flex-wrap", isWrong && "animate-shake")}>
          {Array.from({ length: currentLevelData.solutionWord.length }).map((_, i) => {
            const char = inputValue[i] || '';
            return (
              <div
                  key={i}
                  className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-md border text-2xl font-bold uppercase",
                      "bg-card transition-all duration-300",
                      char && "border-primary ring-2 ring-primary animate-pop-in"
                  )}
              >
                  {char}
              </div>
            );
          })}
        </div>
        {isWrong && <span className="text-3xl absolute -right-10 top-1/2 -translate-y-1/2 animate-pop-in">❌</span>}
      </div>
    );
  };

  if (isInitialLoading) {
    return (
      <div className="container py-4 md:py-8 flex flex-col items-center justify-center flex-1">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Préparation du tournoi...</p>
      </div>
    )
  }

  if (!currentLevelData) {
    return (
         <div className="container py-4 md:py-8 flex flex-col items-center justify-center flex-1 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Tournoi terminé !</h2>
            <p className="text-muted-foreground mb-8">
                Bravo, vous avez trouvé tous les mots de cette catégorie. Votre score final a été enregistré.
            </p>
            <Button asChild>
                <Link href="/tournaments">Retour aux tournois</Link>
            </Button>
        </div>
    )
  }
  
  const progressPercentage = maxLevel > 0 ? (level / maxLevel) * 100 : 0;

  return (
    <div className="container py-4 md:py-8 flex flex-col items-center justify-center flex-1 animate-fade-in-up">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-2">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Niveau</p>
                <p key={`level-${levelKey}`} className="text-2xl font-bold text-primary animate-pop-in">{level} / {maxLevel}</p>
              </div>
               <div className="flex flex-col items-center">
                 <Clock className="h-6 w-6 text-primary" />
                 <p className="text-2xl font-bold text-primary">{Math.ceil(timeRemaining)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p key={`score-${scoreKey}`} className="text-2xl font-bold text-primary animate-pop-in">{score}</p>
              </div>
            </div>
             <CardTitle className="text-2xl font-semibold">
              Défi : {currentLevelData?.description}
            </CardTitle>
            <Progress value={progressPercentage} className="w-full mt-4" />
          </CardHeader>
        </Card>
        
        <div className="flex justify-center mb-2">
            <Button variant="outline" size="sm" onClick={showHint} disabled={true}>
                <Lightbulb className="mr-2 h-4 w-4" />
                Indice
            </Button>
        </div>
        
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                {renderInputBoxes()}
                <Button type="button" size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2 transform-gpu" onClick={handleBackspace} disabled={isSubmitting || inputValue.length === 0 || showTimeUp || showLevelComplete}>
                    <Undo2 className="h-5 w-5"/>
                </Button>
            </div>

            {currentLevelData?.jumbledLetters.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                    <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
                </div>
            ) : (
                <LetterGrid letters={currentLevelData?.jumbledLetters || []} onKeyPress={handleKeyPress} disabledLetters={disabledLetterIndexes} disabled={isSubmitting || showTimeUp || showLevelComplete} />
            )}

             <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !currentLevelData || inputValue.length !== currentLevelData.solutionWord.length || showTimeUp || showLevelComplete}>
              {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
              <ArrowRight className="mr-2" />
              Valider
            </Button>
          </form>
        </div>
      </div>

      <LevelCompleteDialog
        isOpen={showLevelComplete}
        onContinue={handleNextLevel}
        level={level}
        points={lastRoundPoints.points}
        bonusPoints={0}
      />
      <TimeUpDialog 
        isOpen={showTimeUp}
        onRetry={handleRetry}
        solution={currentLevelData?.solutionWord || ""}
      />
    </div>
  );
}
