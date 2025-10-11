"use client";

import { useState, useMemo, useCallback, FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { LevelCompleteDialog } from "@/components/level-complete-dialog";
import { TimeUpDialog } from "@/components/time-up-dialog";
import { useToast } from "@/hooks/use-toast";
import { checkOriginality } from "@/ai/flows/check-originality";
import { evaluateAnswer } from "@/ai/flows/evaluate-answer";
import { ArrowRight, LoaderCircle, Undo2, Clock, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LetterGrid } from "@/components/letter-grid";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase";

const LEVEL_TIME = 60; // 60 seconds per level

// Helper to shuffle an array
const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Helper to generate a random two-letter challenge
const generateRandomChallenge = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const char1 = alphabet[Math.floor(Math.random() * alphabet.length)];
    const char2 = alphabet[Math.floor(Math.random() * alphabet.length)];
    return (char1 + char2).toLowerCase();
}

export function GameClient() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { level, score, updateScore, nextLevel, history, addWordToHistory, settings } = useGame();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [lastRoundPoints, setLastRoundPoints] = useState({ points: 0, bonus: 0 });
  const [solutionWord, setSolutionWord] = useState('');
  const [hint, setHint] = useState('');
  const [jumbledLetters, setJumbledLetters] = useState<string[]>([]);
  const [disabledLetterIndexes, setDisabledLetterIndexes] = useState<boolean[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIME);
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");

  const timerRef = useRef<number | null>(null);
  const levelStartTimeRef = useRef<number | null>(null);

  const { toast } = useToast();
  
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setShowTimeUp(false);
    levelStartTimeRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - (levelStartTimeRef.current || now)) / 1000);
      const newTimeRemaining = Math.max(0, LEVEL_TIME - elapsed);
      setTimeRemaining(newTimeRemaining);

      if (newTimeRemaining > 0) {
        timerRef.current = requestAnimationFrame(animate);
      } else {
        setShowTimeUp(true);
        stopTimer();
      }
    };
    timerRef.current = requestAnimationFrame(animate);
  }, [stopTimer]);
  
  useEffect(() => {
    if (showTimeUp) {
      stopTimer();
      updateScore(-10); // Penalize for time up
    }
  }, [showTimeUp, updateScore, stopTimer]);


  const generateLevel = useCallback(async () => {
    setIsSubmitting(true);
    setInputValue("");
    stopTimer();

    const challenge = generateRandomChallenge();
    const description = settings.language === 'FR' ? `Trouve un mot contenant "${challenge}"` : `Find a word containing "${challenge}"`;
    setCurrentChallenge(challenge);
    setCurrentDescription(description);

    try {
      const result = await evaluateAnswer({
        wordOrPhrase: '',
        challenge: challenge,
        description: description,
        language: settings.language,
      });
      const word = result.solutionWord.toUpperCase();
      setSolutionWord(word);
      setHint(result.hint);

      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const solutionLetters = word.split('');
      const extraLetters: string[] = [];
      while (extraLetters.length < 4) {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!solutionLetters.includes(randomLetter)) {
          extraLetters.push(randomLetter);
        }
      }
      
      const allLetters = shuffle([...solutionLetters, ...extraLetters]);
      setJumbledLetters(allLetters);
      setDisabledLetterIndexes(new Array(allLetters.length).fill(false));
      startTimer();
    } catch(e) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de générer le niveau."});
    } finally {
        setIsSubmitting(false);
    }
  }, [startTimer, stopTimer, toast, settings.language]);

  useEffect(() => {
    generateLevel();

    return () => {
      stopTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  useEffect(() => {
    if (user && firestore && score > 0) {
      const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
      setDocumentNonBlocking(leaderboardRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        score: score,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  }, [score, user, firestore]);

  const handleKeyPress = (key: string, index: number) => {
    if (inputValue.length >= solutionWord.length || showTimeUp) return;
    setInputValue((prev) => prev + key);
    setDisabledLetterIndexes(prev => {
        const newDisabled = [...prev];
        newDisabled[index] = true;
        return newDisabled;
    });
  };
  
  const handleBackspace = () => {
     if (inputValue.length === 0 || showTimeUp) return;
    
    const lastChar = inputValue[inputValue.length - 1];
    setInputValue((prev) => prev.slice(0, -1));

    // Re-enable the last used letter
    let reEnabled = false;
    // Iterate backwards to find the last disabled button corresponding to the character
    for(let i = disabledLetterIndexes.length - 1; i >= 0; i--) {
        if(jumbledLetters[i] === lastChar && disabledLetterIndexes[i] && !reEnabled) {
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
    if (hint && !showTimeUp) {
      toast({
        title: "Indice",
        description: hint,
      });
      updateScore(-2); // Penalize for using hint
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting || showTimeUp) return;

    setIsSubmitting(true);
    stopTimer();
    const cleanedInput = inputValue.trim();

    if (cleanedInput.toUpperCase() !== solutionWord) {
      toast({
        variant: "default",
        title: "Presque !",
        description: "Ce n'est pas le bon mot. Essayez encore !",
      });
      updateScore(-5);
      setIsSubmitting(false);
      // Reset for next try
      setInputValue("");
      setDisabledLetterIndexes(new Array(jumbledLetters.length).fill(false));
      startTimer();
      return;
    }
    
    let bonusPoints = 0;
    try {
      const originalityResult = await checkOriginality({
        wordOrPhrase: cleanedInput,
        previousWordsAndPhrases: history,
      });
      if (originalityResult.isOriginal) {
        bonusPoints = originalityResult.bonusPoints;
      }
    } catch (error) {
      console.error("AI originality check failed:", error);
    }
    
    const timeBonus = Math.floor(timeRemaining / 10); // Bonus for remaining time
    const totalPoints = 10 + bonusPoints + timeBonus;

    updateScore(totalPoints);
    addWordToHistory(cleanedInput);
    
    setLastRoundPoints({ points: totalPoints, bonus: bonusPoints + timeBonus });
    setShowLevelComplete(true);
    setIsSubmitting(false);
  };
  
  const handleContinue = () => {
    setShowLevelComplete(false);
    setShowTimeUp(false);
    nextLevel();
  };
  
  const progressPercentage = (level % 10) * 10;
  
  const renderInputBoxes = () => {
    const boxes = [];
    const wordLength = solutionWord.length > 0 ? solutionWord.length : 10; // Default to 10 if not ready

    for (let i = 0; i < wordLength; i++) {
        const char = inputValue[i] || '';
        boxes.push(
            <div
                key={i}
                className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-md border text-2xl font-bold uppercase",
                    "bg-card",
                    char && "border-primary ring-2 ring-primary"
                )}
            >
                {char}
            </div>
        );
    }
    return boxes;
  };

  return (
    <div className="container py-4 md:py-8 flex flex-col items-center justify-center flex-1">
       <Card className={cn(
            "mb-4 w-full max-w-3xl transition-all duration-500",
            "bg-transparent border-transparent"
          )}>
        <CardContent className="p-2 text-center">
            <div className={cn(
              "flex items-center justify-center gap-2 font-mono text-2xl md:text-3xl tracking-widest text-foreground",
              !showTimeUp && "blur-md select-none"
            )}>
              {solutionWord ? solutionWord.split('').map((letter, index) => (
                <span key={index}>{letter}</span>
              )) : (
                <span className="blur-md select-none">SOLUTION</span>
              )}
            </div>
          </CardContent>
      </Card>
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-2">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Niveau</p>
                <p className="text-2xl font-bold text-primary">{level}</p>
              </div>
               <div className="flex flex-col items-center">
                 <Clock className="h-6 w-6 text-primary" />
                 <p className="text-2xl font-bold text-primary">{timeRemaining}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-primary">{score}</p>
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold">
              Défi : {currentDescription}
            </CardTitle>
            <Progress value={progressPercentage} className="w-full mt-4" />
          </CardHeader>
        </Card>
        
        <div className="flex justify-center mb-2">
            <Button variant="outline" size="sm" onClick={showHint} disabled={isSubmitting || showTimeUp}>
                <Lightbulb className="mr-2 h-4 w-4" />
                Indice (-2 points)
            </Button>
        </div>
        
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <div className="flex justify-center items-center gap-2 flex-wrap">
                    {solutionWord ? renderInputBoxes() : (
                      <div className="h-12 flex items-center justify-center">
                        <LoaderCircle className="animate-spin h-8 w-8 text-primary" />
                      </div>
                    )}
                </div>
                <Button type="button" size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2" onClick={handleBackspace} disabled={isSubmitting || inputValue.length === 0 || showTimeUp}>
                    <Undo2 className="h-5 w-5"/>
                </Button>
            </div>

            {isSubmitting && jumbledLetters.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                    <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
                </div>
            ) : (
                <LetterGrid letters={jumbledLetters} onKeyPress={handleKeyPress} disabledLetters={disabledLetterIndexes} disabled={isSubmitting || showTimeUp} />
            )}

            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || inputValue.length !== solutionWord.length || showTimeUp}>
              {isSubmitting ? (
                <LoaderCircle className="animate-spin mr-2" />
              ) : (
                <ArrowRight className="mr-2" />
              )}
              Valider
            </Button>
          </form>
        </div>
      </div>

      <LevelCompleteDialog
        isOpen={showLevelComplete}
        onContinue={handleContinue}
        level={level}
        points={lastRoundPoints.points}
        bonusPoints={lastRoundPoints.bonus}
      />
      <TimeUpDialog 
        isOpen={showTimeUp}
        onContinue={handleContinue}
        solution={solutionWord}
      />
    </div>
  );
}
