"use client";

import { useEffect, useState } from 'react';

export function FloatingLettersBackground() {
  const [letters, setLetters] = useState<{ id: number; char: string; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const generateLetters = () => {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const newLetters = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        char: alphabet[Math.floor(Math.random() * alphabet.length)],
        style: {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 5 + 10}s`, // 10s to 15s
          animationDelay: `${Math.random() * 10}s`,
          transform: `scale(${Math.random() * 0.5 + 0.5})`,
        },
      }));
      setLetters(newLetters);
    };

    generateLetters();
  }, []);

  return (
    <div className="floating-letters" aria-hidden="true">
      {letters.map(letter => (
        <span key={letter.id} style={letter.style}>
          {letter.char}
        </span>
      ))}
    </div>
  );
}
