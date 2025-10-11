"use client";

import { Button } from "./ui/button";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

export function VirtualKeyboard({ onKeyPress, disabled }: VirtualKeyboardProps) {
  const keysRows = [
    "A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P",
    "Q", "S", "D", "F", "G", "H", "J", "K", "L", "M",
    "W", "X", "C", "V", "B", "N",
  ];

  return (
    <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-background/50">
      <div className="flex flex-wrap justify-center gap-1.5">
        {keysRows.slice(0, 10).map((key) => (
          <Button
            key={key}
            onClick={() => onKeyPress(key)}
            variant="outline"
            size="icon"
            className="h-12 w-12 text-lg font-semibold bg-card hover:bg-primary/20"
            disabled={disabled}
          >
            {key}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {keysRows.slice(10, 20).map((key) => (
          <Button
            key={key}
            onClick={() => onKeyPress(key)}
            variant="outline"
            size="icon"
            className="h-12 w-12 text-lg font-semibold bg-card hover:bg-primary/20"
            disabled={disabled}
          >
            {key}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {keysRows.slice(20).map((key) => (
          <Button
            key={key}
            onClick={() => onKeyPress(key)}
            variant="outline"
            size="icon"
            className="h-12 w-12 text-lg font-semibold bg-card hover:bg-primary/20"
            disabled={disabled}
          >
            {key}
          </Button>
        ))}
      </div>
    </div>
  );
}
