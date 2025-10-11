"use client";

import { Button } from "./ui/button";

interface LetterGridProps {
  letters: string[];
  onKeyPress: (key: string, index: number) => void;
  disabledLetters: boolean[];
  disabled?: boolean;
}

export function LetterGrid({ letters, onKeyPress, disabledLetters, disabled }: LetterGridProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 p-4 rounded-lg bg-background/50 max-w-md mx-auto">
      {letters.map((letter, index) => (
        <Button
          key={index}
          onClick={() => onKeyPress(letter, index)}
          variant="outline"
          className="h-14 w-14 md:h-16 md:w-16 text-2xl font-bold bg-card hover:bg-primary/20 transition-transform transform hover:scale-110 disabled:scale-100"
          disabled={disabled || disabledLetters[index]}
        >
          {letter}
        </Button>
      ))}
    </div>
  );
}
