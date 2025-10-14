
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
import { PartyPopper } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

interface LevelCompleteDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  level: number;
  points: number;
  bonusPoints: number;
}

export function LevelCompleteDialog({ isOpen, onContinue, level, points, bonusPoints }: LevelCompleteDialogProps) {
  const t = useTranslations();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onContinue()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PartyPopper className="h-8 w-8 text-primary" />
            {t('level_complete_title', level)}
          </DialogTitle>
          <DialogDescription>
            {t('level_complete_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t('points_won')}</p>
            <p className="text-4xl font-bold text-primary">+{points}</p>
            {bonusPoints > 0 && (
              <p className="text-sm text-accent">{t('originality_bonus', bonusPoints)}</p>
            )}
          </div>
          <p className="text-center text-sm italic text-muted-foreground">
            {t('level_complete_quote')}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onContinue} className="w-full">
            {t('next_level')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
