"use client";

import { useState, useMemo, useCallback, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { gameLevels } from "@/lib/game-levels";
import { VirtualKeyboard } from "@/components/virtual-keyboard";
import { LevelCompleteDialog } from "@/components/level-complete-dialog";
import { useToast } from "@/hooks/use-toast";
import { checkOriginality } from "@/ai/flows/check-originality";
import { ArrowRight, LoaderCircle, Undo2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function GameClient() {
  const { level, score, updateScore, nextLevel, history, addWordToHistory } = useGame();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [lastRoundPoints, setLastRoundPoints] = useState({ points: 0, bonus: 0 });
  const { toast } = useToast();

  const currentLevelData = useMemo(() => gameLevels[level - 1], [level]);

  useEffect(() => {
    setInputValue("");
  }, [level]);

  const handleKeyPress = useCallback((key: string) => {
    setInputValue((prev) => prev + key);
  }, []);
  
  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const cleanedInput = inputValue.trim();

    // 1. Check if challenge is met
    if (!cleanedInput.toLowerCase().includes(currentLevelData.challenge)) {
      toast({
        variant: "destructive",
        title: "Dommage !",
        description: `Votre réponse doit contenir "${currentLevelData.challenge}".`,
      });
      updateScore(-5);
      setIsSubmitting(false);
      return;
    }
    
    // 2. Check for originality
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
      toast({
        variant: "destructive",
        title: "Erreur IA",
        description: "Impossible de vérifier l'originalité. Réessayez.",
      });
      setIsSubmitting(false);
      return;
    }
    
    // 3. Calculate points
    let basePoints = 10;
    let creativityBonus = cleanedInput.split(' ').length > 10 ? 5 : 0;
    const totalPoints = basePoints + bonusPoints + creativityBonus;

    updateScore(totalPoints);
    addWordToHistory(cleanedInput);
    
    setLastRoundPoints({ points: totalPoints, bonus: bonusPoints });
    setShowLevelComplete(true);
    setIsSubmitting(false);
  };
  
  const handleContinue = () => {
    setShowLevelComplete(false);
    nextLevel();
    setInputValue("");
  };
  
  const progressPercentage = (level / gameLevels.length) * 100;

  return (
    <div className="container py-8 flex flex-col items-center">
      <Card className="w-full max-w-3xl mb-4">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-2">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Niveau</p>
              <p className="text-2xl font-bold text-primary">{level}</p>
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
      
      <div className="w-full max-w-3xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              placeholder="ÉCRIVEZ VOTRE RÉPONSE ICI..."
              className="h-14 text-center text-xl tracking-widest bg-card"
              autoFocus
              disabled={isSubmitting}
            />
            <Button type="button" size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleBackspace} disabled={isSubmitting || inputValue.length === 0}>
              <Undo2 className="h-5 w-5"/>
            </Button>
          </div>
          <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting || !inputValue.trim()}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin mr-2" />
            ) : (
              <ArrowRight className="mr-2" />
            )}
            Valider
          </Button>
        </form>

        <VirtualKeyboard onKeyPress={handleKeyPress} disabled={isSubmitting} />
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
