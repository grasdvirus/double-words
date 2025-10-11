export type Level = {
  level: number;
  challenge: string;
  description: string;
  solutionWord: string; // Mot qui contient la solution
};

export const gameLevels: Level[] = [
  { level: 1, challenge: "ee", description: "Fais une phrase contenant 'ee'", solutionWord: "BELLE" },
  { level: 2, challenge: "rr", description: "Trouve un mot avec 'rr'", solutionWord: "TERRE" },
  { level: 3, challenge: "oo", description: "Compose une phrase contenant 'oo'", solutionWord: "ZOO" },
  { level: 4, challenge: "tt", description: "Trouve un mot avec 'tt'", solutionWord: "PETIT" },
  { level: 5, challenge: "ss", description: "Compose une phrase avec 'ss'", solutionWord: "CLASSE" },
  { level: 6, challenge: "ll", description: "Fais une phrase contenant 'll'", solutionWord: "FILLE" },
  { level: 7, challenge: "pp", description: "Trouve un mot avec 'pp'", solutionWord: "MAPPE" },
  { level: 8, challenge: "aa", description: "Compose une phrase contenant 'aa'", solutionWord: "AARDVARK" },
  { level: 9, challenge: "nn", description: "Trouve un mot avec 'nn'", solutionWord: "ANNEE" },
  { level: 10, challenge: "mm", description: "Compose une phrase avec 'mm'", solutionWord: "HOMME" },
  { level: 11, challenge: "rrr", description: "Trouve un mot avec 'rrr' (lettre triplée)", solutionWord: "SERRURERIE" },
  { level: 12, challenge: "cc", description: "Compose une phrase avec 'cc'", solutionWord: "ACCORD" },
];
