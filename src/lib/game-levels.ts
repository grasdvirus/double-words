export type Level = {
  level: number;
  challenge: string;
  description: string;
};

export const gameLevels: Level[] = [
  { level: 1, challenge: "ee", description: "Fais une phrase contenant 'ee'" },
  { level: 2, challenge: "rr", description: "Trouve un mot avec 'rr'" },
  { level: 3, challenge: "oo", description: "Compose une phrase contenant 'oo'" },
  { level: 4, challenge: "tt", description: "Trouve un mot avec 'tt'" },
  { level: 5, challenge: "ss", description: "Compose une phrase avec 'ss'" },
  { level: 6, challenge: "ll", description: "Fais une phrase contenant 'll'" },
  { level: 7, challenge: "pp", description: "Trouve un mot avec 'pp'" },
  { level: 8, challenge: "aa", description: "Compose une phrase contenant 'aa'" },
  { level: 9, challenge: "nn", description: "Trouve un mot avec 'nn'" },
  { level: 10, challenge: "mm", description: "Compose une phrase avec 'mm'" },
  { level: 11, challenge: "rrr", description: "Trouve un mot avec 'rrr' (lettre triplée)" },
  { level: 12, challenge: "cc", description: "Compose une phrase avec 'cc'" },
];
