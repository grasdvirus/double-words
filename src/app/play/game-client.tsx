
"use client";

import { useState, useCallback, FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { LevelCompleteDialog } from "@/components/level-complete-dialog";
import { TimeUpDialog } from "@/components/time-up-dialog";
import { checkOriginality } from "@/ai/flows/check-originality";
import { evaluateAnswer } from "@/ai/flows/evaluate-answer";
import { ArrowRight, Undo2, Clock, Lightbulb, Key } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LetterGrid } from "@/components/letter-grid";
import { cn } from "@/lib/utils";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { gameLevels } from "@/lib/game-levels";
import { useNotification } from "@/contexts/notification-context";
import { useTranslations } from "@/hooks/use-translations";
import { playSound } from "@/lib/sounds";


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

interface LevelData {
  challenge: string;
  description: string;
  solutionWord: string;
  hint: string;
  jumbledLetters: string[];
}

export function GameClient({ isTrainingMode }: { isTrainingMode: boolean }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { level, score, updateScore, nextLevel, history, addWordToHistory, settings } = useGame();
  const t = useTranslations();

  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [lastRoundPoints, setLastRoundPoints] = useState({ points: 0, bonus: 0 });
  
  const [currentLevelData, setCurrentLevelData] = useState<LevelData | null>(null);
  const [nextLevelData, setNextLevelData] = useState<LevelData | null>(null);

  const [disabledLetterIndexes, setDisabledLetterIndexes] = useState<boolean[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(LEVEL_TIME);
  const [isWrong, setIsWrong] = useState(false);
  const [scoreKey, setScoreKey] = useState(0);
  const [levelKey, setLevelKey] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [revealUsed, setRevealUsed] = useState(false);

  const timerRef = useRef<number | null>(null);
  const levelStartTimeRef = useRef<number | null>(null);

  const { showNotification, hideNotification, notification } = useNotification();
  
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeUp = useCallback(() => {
      stopTimer();
      if (!isTrainingMode) updateScore(-10); // Penalize for time up
      setShowTimeUp(true);
  }, [updateScore, stopTimer, isTrainingMode]);


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
  
  const prepareLevelData = useCallback(async (forLevel: number): Promise<LevelData | null> => {
    const predefinedLevel = gameLevels.find(l => l.level === forLevel);
    let challenge, description, solution;

    if (predefinedLevel) {
        challenge = predefinedLevel.challenge;
        description = predefinedLevel.description;
        solution = predefinedLevel.solutionWord;
    } else {
        challenge = generateRandomChallenge();
        description = settings.language === 'FR' ? `Contient "${challenge}"` : `Contains "${challenge}"`;
        solution = undefined; 
    }

    try {
      const result = await evaluateAnswer({
        wordOrPhrase: '',
        challenge: challenge,
        description: description,
        language: settings.language,
        solutionWord: solution,
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
      
      const allLetters = shuffle([...solutionLetters, ...extraLetters]);
      
      return {
        challenge,
        description,
        solutionWord: word,
        hint: result.hint,
        jumbledLetters: allLetters,
      };

    } catch(e) {
        showNotification({ title: t('error'), message: t('level_generation_error'), type: 'error'});
        return null;
    }
  }, [settings.language, showNotification, t]);

  const setupLevel = useCallback((data: LevelData | null, isRetry = false) => {
    if (!data) return;

    setCurrentLevelData(data);
    setInputValue("");
    setDisabledLetterIndexes(new Array(data.jumbledLetters.length).fill(false));
    setShowLevelComplete(false);
    setShowTimeUp(false);
    setRevealUsed(false);
    
    if (!isRetry) {
      startTimer();
    }
    
    // Pre-fetch next level data
    prepareLevelData(level + 1).then(setNextLevelData);

  }, [startTimer, level, prepareLevelData]);


  useEffect(() => {
    if (isInitialLoading) {
        prepareLevelData(level).then(data => {
            setupLevel(data);
            setIsInitialLoading(false);
        });
    }

    return () => {
      stopTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  useEffect(() => {
    if (user && firestore && score > 0 && !isTrainingMode) {
      const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
      setDocumentNonBlocking(leaderboardRef, {
        displayName: user.displayName || "Joueur anonyme",
        photoURL: user.photoURL || "",
        score: score,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    setScoreKey(prev => prev + 1);
  }, [score, user, firestore, isTrainingMode]);

  useEffect(() => {
    setLevelKey(prev => prev + 1);
  }, [level]);

  const handleKeyPress = (key: string, index: number) => {
    if (!currentLevelData || inputValue.length >= currentLevelData.solutionWord.length || showTimeUp) return;
    if (notification?.type === 'info') {
      hideNotification();
    }
    playSound('key', settings);
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
  
    // Re-enable the corresponding letter in the grid
    const currentInputChars = inputValue.slice(0, -1).split('');
    const countOfCharInNewInput = currentInputChars.filter(c => c === lastChar).length;

    let countOfDisabledCharInGrid = 0;
    let indexToReEnable = -1;

    for(let i=0; i < currentLevelData.jumbledLetters.length; i++) {
        if(currentLevelData.jumbledLetters[i] === lastChar && disabledLetterIndexes[i]) {
             if(countOfDisabledCharInGrid === countOfCharInNewInput) {
                indexToReEnable = i;
                break;
            }
            countOfDisabledCharInGrid++;
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

  const showHint = () => {
    if (currentLevelData?.hint && !showTimeUp) {
      showNotification({
        title: t('hint'),
        message: currentLevelData.hint,
        type: 'info',
        duration: 'persistent',
      });
    }
  };
  
  const handleRevealLetter = () => {
      if (!currentLevelData || revealUsed || inputValue.length >= currentLevelData.solutionWord.length) return;
      
      const solution = currentLevelData.solutionWord;
      const currentInput = inputValue;

      // Find the first letter of the solution that is not yet in the input
      if (currentInput.length < solution.length) {
          const nextLetter = solution[currentInput.length];
          const nextInput = currentInput + nextLetter;

          // Find the corresponding letter in the grid to disable it
          const charCountsInInput = nextInput.split('').filter(c => c === nextLetter).length;
          
          let enabledCount = 0;
          let indexToDisable = -1;
          for (let i = 0; i < currentLevelData.jumbledLetters.length; i++) {
              if (currentLevelData.jumbledLetters[i] === nextLetter && !disabledLetterIndexes[i]) {
                  if (enabledCount === charCountsInInput -1) {
                      indexToDisable = i;
                      break;
                  }
                  enabledCount++;
              }
          }
          
          if(indexToDisable !== -1) {
              setInputValue(nextInput);
              setDisabledLetterIndexes(prev => {
                  const newDisabled = [...prev];
                  newDisabled[indexToDisable] = true;
                  return newDisabled;
              });
              setRevealUsed(true);
              if (!isTrainingMode) updateScore(-2); // Penalize for using hint
          }
      }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting || showTimeUp || showLevelComplete || !currentLevelData) return;

    setIsSubmitting(true);
    const cleanedInput = inputValue.trim();

    if (cleanedInput.toUpperCase() !== currentLevelData.solutionWord) {
      if (!isTrainingMode) updateScore(-5);
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        setInputValue("");
        if(currentLevelData) {
            setDisabledLetterIndexes(new Array(currentLevelData.jumbledLetters.length).fill(false));
        }
        setRevealUsed(false);
      }, 800);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 820);
      return;
    }
    
    stopTimer();
    let bonusPoints = 0;
    if (!isTrainingMode) {
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
    }
    
    const timeBonus = Math.floor(timeRemaining / 10);
    const totalPoints = 10 + bonusPoints + timeBonus;

    if (!isTrainingMode) updateScore(totalPoints);
    addWordToHistory(cleanedInput);
    
    setLastRoundPoints({ points: totalPoints, bonus: bonusPoints + timeBonus });
    setShowLevelComplete(true);
    setIsSubmitting(false);
  };
  
  const handleNextLevel = () => {
    nextLevel();
    setShowLevelComplete(false);
    if (nextLevelData) {
        setupLevel(nextLevelData);
        setNextLevelData(null); // Clear after use
    } else {
        // Fallback if pre-fetching failed or wasn't ready
        setIsInitialLoading(true);
        prepareLevelData(level + 1).then(data => {
            setupLevel(data);
            setIsInitialLoading(false);
        });
    }
  };

  const handleRetry = () => {
    setShowTimeUp(false);
    // Use the pre-fetched data for the *next* level as a new attempt
    if (nextLevelData) {
        setupLevel(nextLevelData, true); 
        setNextLevelData(null);
    } else {
        setIsInitialLoading(true);
        prepareLevelData(level).then(data => {
            setupLevel(data, true);
            setIsInitialLoading(false);
        });
    }
    startTimer();
  };
  
  const progressPercentage = Math.min(100, (level / 10) * 100);
  
  const renderInputBoxes = () => {
    if (isInitialLoading || !currentLevelData) {
      return (
        <div className="flex justify-center items-center gap-2 flex-wrap min-h-14">
           <div className="section-center scale-50">
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
      );
    }

    return (
      <div className="relative min-h-14">
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

  const renderChallengeTitle = () => {
    if (!currentLevelData) return null;
    const description = currentLevelData.description;
    const parts = description.split('"');
    
    return (
      <>
        {parts[0]}
        {parts[1] && <span className="text-3xl font-black text-primary mx-1 uppercase">"{parts[1]}"</span>}
        {parts[2]}
      </>
    )
  }

  if (isInitialLoading) {
    return (
      <div className="container py-4 md:py-8 flex flex-col items-center justify-center flex-1">
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
        <p className="mt-4 text-muted-foreground pt-24">{t('preparing_level')}</p>
      </div>
    )
  }

  return (
    <div className="container py-4 md:py-8 flex flex-col items-center justify-center flex-1 animate-fade-in-up">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-2">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">{t('level')}</p>
                <p key={`level-${levelKey}`} className="text-2xl font-bold text-primary animate-pop-in">{level}</p>
              </div>
               <div className="flex flex-col items-center">
                 <Clock className="h-6 w-6 text-primary" />
                 <p className="text-2xl font-bold text-primary">{Math.ceil(timeRemaining)}</p>
              </div>
              {!isTrainingMode && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('score')}</p>
                  <p key={`score-${scoreKey}`} className="text-2xl font-bold text-primary animate-pop-in">{score}</p>
                </div>
              )}
            </div>
             <CardTitle className="text-2xl font-semibold flex items-center justify-center flex-wrap">
              {isTrainingMode && <span className="text-muted-foreground font-normal mr-2">{t('training_mode')} -</span>}
              <span className="mr-2">{t('challenge')}:</span> {renderChallengeTitle()}
            </CardTitle>
            {!isTrainingMode && <Progress value={progressPercentage} className="w-full mt-4" />}
          </CardHeader>
        </Card>
        
        <div className="flex justify-center gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={showHint} disabled={isSubmitting || showTimeUp || showLevelComplete}>
                <Lightbulb className="mr-2 h-4 w-4" />
                {t('hint')}
            </Button>
             <Button variant="outline" size="sm" onClick={handleRevealLetter} disabled={isSubmitting || showTimeUp || showLevelComplete || revealUsed || !currentLevelData}>
                <Key className="mr-2 h-4 w-4" />
                {t('hint_penalty')}
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

            {currentLevelData?.jumbledLetters && currentLevelData?.jumbledLetters.length === 0 ? (
                <div className="flex justify-center items-center p-8">
                     <div className="section-center scale-50">
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
            ) : (
                <LetterGrid letters={currentLevelData?.jumbledLetters || []} onKeyPress={handleKeyPress} disabledLetters={disabledLetterIndexes} disabled={isSubmitting || showTimeUp || showLevelComplete} />
            )}

             <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !currentLevelData || !currentLevelData.solutionWord || inputValue.length !== currentLevelData.solutionWord.length || showTimeUp || showLevelComplete}>
              {(isSubmitting || !currentLevelData) && (
                 <div className="section-center scale-50 -translate-y-8">
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
              )}
              {t('submit')}
              {!isSubmitting && <ArrowRight className="ml-2" />}
            </Button>
          </form>
        </div>
      </div>

      <LevelCompleteDialog
        isOpen={showLevelComplete}
        onContinue={handleNextLevel}
        level={level}
        points={isTrainingMode ? 0 : lastRoundPoints.points}
        bonusPoints={isTrainingMode ? 0 : lastRoundPoints.bonus}
      />
      <TimeUpDialog 
        isOpen={showTimeUp}
        onRetry={handleRetry}
        solution={currentLevelData?.solutionWord || ""}
        hint={currentLevelData?.hint || ""}
        isTrainingMode={isTrainingMode}
      />
    </div>
  );
}

    