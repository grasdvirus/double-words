
export type Level = {
  level: number;
  challenge: string;
  description: string;
  solutionWord: string; // Mot qui contient la solution
};

// This file is now used for the first 10 levels.
// After level 10, levels are generated dynamically.
export const gameLevels: Level[] = [
    { level: 1, challenge: "on", description: 'Contient "on"', solutionWord: "BONJOUR" },
    { level: 2, challenge: "ou", description: 'Contient "ou"', solutionWord: "JOURNAL" },
    { level: 3, challenge: "ch", description: 'Contient "ch"', solutionWord: "CHATEAU" },
    { level: 4, challenge: "oi", description: 'Contient "oi"', solutionWord: "POISSON" },
    { level: 5, challenge: "an", description: 'Contient "an"', solutionWord: "MANGER" },
    { level: 6, challenge: "tr", description: 'Contient "tr"', solutionWord: "LETTRE" },
    { level: 7, challenge: "es", description: 'Contient "es"', solutionWord: "TESTER" },
    { level: 8, challenge: "re", description: 'Contient "re"', solutionWord: "ARBRE" },
    { level: 9, challenge: "le", description: 'Contient "le"', solutionWord: "TABLEAU" },
    { level: 10, challenge: "qu", description: 'Contient "qu"', solutionWord: "MUSIQUE" },
];
