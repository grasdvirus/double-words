
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TimerOff } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { useGame } from "@/hooks/use-game";
import { useEffect } from "react";

interface TimeUpDialogProps {
  isOpen: boolean;
  onRetry: () => void;
  solution: string;
  hint?: string;
}

export function TimeUpDialog({ isOpen, onRetry, solution, hint }: TimeUpDialogProps) {
  const t = useTranslations();
  const { score, saveFinalScore } = useGame();

  useEffect(() => {
    if (isOpen) {
      saveFinalScore(score);
    }
  }, [isOpen, score, saveFinalScore]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRetry()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TimerOff className="h-8 w-8 text-destructive" />
            {t('time_up_title')}
          </DialogTitle>
          <DialogDescription>
            {t('time_up_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center space-y-2">
            <div>
                <p className="text-sm text-muted-foreground">{t('the_word_was')}</p>
                <p className="text-4xl font-bold text-primary tracking-widest">{solution}</p>
            </div>
            {hint && (
                <div>
                    <p className="text-sm text-muted-foreground">{t('hint')}</p>
                    <p className="text-sm italic">{hint}</p>
                </div>
            )}
            <p className="text-sm text-destructive pt-2">{t('time_up_penalty')}</p>
          </div>
          <p className="text-center text-sm italic text-muted-foreground">
            {t('time_up_quote')}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onRetry} className="w-full">
            {t('new_level')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
