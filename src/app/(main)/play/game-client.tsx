"use client";

import { useState, useMemo, useCallback, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { gameLevels } from "@/lib/game-levels";
import { LevelCompleteDialog } from "@/components/level-complete-dialog";
import { useToast } from "@/hooks/use-toast";
import { checkOriginality } from "@/ai/flows/check-originality";
import { evaluateAnswer } from "@/ai/flows/evaluate-answer";
import { ArrowRight, LoaderCircle, Undo2, Clock, Lightbulb, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LetterGrid } from "@/components/letter-grid";
import { cn } from "@/lib/utils";

const LEVEL_TIME = 60; // 60 seconds per level

// Helper to shuffle an array
const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export function GameClient() {
  const { level, score, updateScore, nextLevel, history, addWordToHistory } = useGame();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [lastRoundPoints, setLastRoundPoints] = useState({ points: 0, bonus: 0 });
  const [solutionWord, setSolutionWord] = useState('');
  const [hint, setHint] = useState('');
  const [jumbledLetters, setJumbledLetters] = useState<string[]>([]);
  const [disabledLetterIndexes, setDisabledLetterIndexes] = useState<boolean[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIME);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const { toast } = useToast();

  const currentLevelData = useMemo(() => gameLevels[level - 1], [level]);

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = useCallback(() => {
    if (timerId) clearInterval(timerId);
    setIsTimeUp(false);
    setTimeRemaining(LEVEL_TIME);
    const newTimerId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(newTimerId);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(newTimerId);
  }, [timerId, handleTimeUp]);
  
  useEffect(() => {
    if (isTimeUp) {
      updateScore(-10);
      // Automatically move to the next level after a delay to show the solution
      setTimeout(() => {
        nextLevel();
      }, 3000); // 3-second delay
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeUp]);


  const generateJumbledLetters = useCallback(async () => {
    setIsSubmitting(true);
    setInputValue("");
    try {
      const result = await evaluateAnswer({
        wordOrPhrase: '',
        challenge: currentLevelData.challenge,
        description: currentLevelData.description,
        solutionWord: currentLevelData.solutionWord
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
  }, [currentLevelData, startTimer, toast]);

  useEffect(() => {
    generateJumbledLetters();

    return () => {
      if (timerId) clearInterval(timerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleKeyPress = (key: string, index: number) => {
    if (inputValue.length >= solutionWord.length) return;
    setInputValue((prev) => prev + key);
    setDisabledLetterIndexes(prev => {
        const newDisabled = [...prev];
        newDisabled[index] = true;
        return newDisabled;
    });
  };
  
  const handleBackspace = () => {
     if (inputValue.length === 0) return;
    
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
    if (hint) {
      toast({
        title: "Indice",
        description: hint,
      });
      updateScore(-2); // Penalize for using hint
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    if (timerId) clearInterval(timerId);
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
      generateJumbledLetters();
      setInputValue("");
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
    nextLevel();
  };
  
  const progressPercentage = (level / gameLevels.length) * 100;
  
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
              !isTimeUp && "blur-md select-none"
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
              Défi : "{currentLevelData.description}"
            </CardTitle>
            <Progress value={progressPercentage} className="w-full mt-4" />
          </CardHeader>
        </Card>
        
        <div className="flex justify-center mb-2">
            <Button variant="outline" size="sm" onClick={showHint} disabled={isSubmitting || isTimeUp}>
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
                <Button type="button" size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2" onClick={handleBackspace} disabled={isSubmitting || inputValue.length === 0 || isTimeUp}>
                    <Undo2 className="h-5 w-5"/>
                </Button>
            </div>

            {isSubmitting && jumbledLetters.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                    <LoaderCircle className="animate-spin h-10 w-10 text-primary" />
                </div>
            ) : (
                <LetterGrid letters={jumbledLetters} onKeyPress={handleKeyPress} disabledLetters={disabledLetterIndexes} disabled={isSubmitting || isTimeUp} />
            )}

            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || inputValue.length !== solutionWord.length || isTimeUp}>
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
    </div>
  );
}
