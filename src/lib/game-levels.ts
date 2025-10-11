export type Level = {
  level: number;
  challenge: string;
  description: string;
  solutionWord: string; // Mot qui contient la solution
};

// This file is no longer used for static levels, but the type definition is kept.
// Levels are now generated dynamically in the game client.
export const gameLevels: Level[] = [];
