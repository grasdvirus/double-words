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

interface TimeUpDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  solution: string;
}

export function TimeUpDialog({ isOpen, onContinue, solution }: TimeUpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onContinue()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TimerOff className="h-8 w-8 text-destructive" />
            Temps écoulé !
          </DialogTitle>
          <DialogDescription>
            Pas de chance cette fois-ci. Voici la solution.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Le mot était</p>
            <p className="text-4xl font-bold text-primary tracking-widest">{solution}</p>
            <p className="text-sm text-destructive mt-2">-10 points</p>
          </div>
          <p className="text-center text-sm italic text-muted-foreground">
            "Mieux vaut tard que jamais, mais pas dans ce jeu !"
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
