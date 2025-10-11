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

interface LevelCompleteDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  level: number;
  points: number;
  bonusPoints: number;
}

export function LevelCompleteDialog({ isOpen, onContinue, level, points, bonusPoints }: LevelCompleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onContinue()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PartyPopper className="h-8 w-8 text-primary" />
            Bravo ! Niveau {level} terminé !
          </DialogTitle>
          <DialogDescription>
            Vous êtes un véritable maître des mots.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Points gagnés</p>
            <p className="text-4xl font-bold text-primary">+{points}</p>
            {bonusPoints > 0 && (
              <p className="text-sm text-accent">+ {bonusPoints} bonus d'originalité !</p>
            )}
          </div>
          <p className="text-center text-sm italic text-muted-foreground">
            "Les doubles lettres, double plaisir !"
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onContinue} className="w-full">
            Niveau Suivant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
