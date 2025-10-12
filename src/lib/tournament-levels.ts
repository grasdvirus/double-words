export type TournamentLevel = {
  level: number;
  challenge: string;
  description: string;
  solutionWord: string;
};

export interface TournamentCategoryLevels {
  [theme: string]: {
    [category: string]: TournamentLevel[];
  };
}

// Défis spécifiques pour chaque catégorie de tournoi.
// Le 'challenge' est une chaîne de 2 lettres contenue dans 'solutionWord'.
export const tournamentLevels: TournamentCategoryLevels = {
  football: {
    joueurs: [
      { level: 1, challenge: "DA", description: 'Contient "DA"', solutionWord: "ZIDANE" },
      { level: 2, challenge: "TI", description: 'Contient "TI"', solutionWord: "PLATINI" },
      { level: 3, challenge: "LE", description: 'Contient "LE"', solutionWord: "PELE" },
      { level: 4, challenge: "AD", description: 'Contient "AD"', solutionWord: "MARADONA" },
      { level: 5, challenge: "ES", description: 'Contient "ES"', solutionWord: "MESSI" },
      { level: 6, challenge: "ON", description: 'Contient "ON"', solutionWord: "RONALDO" },
      { level: 7, challenge: "MB", description: 'Contient "MB"', solutionWord: "MBAPPE" },
      { level: 8, challenge: "AN", description: 'Contient "AN"', solutionWord: "GRIEZMANN" },
      { level: 9, challenge: "EN", description: 'Contient "EN"', solutionWord: "HENRY" },
      { level: 10, challenge: "OP", description: 'Contient "OP"', solutionWord: "KOPA" },
      { level: 11, challenge: "BA", description: 'Contient "BA"', solutionWord: "BECKENBAUER" },
      { level: 12, challenge: "UY", description: 'Contient "UY"', solutionWord: "CRUYFF" },
      { level: 13, challenge: "OG", description: 'Contient "OG"', solutionWord: "POGBA" },
      { level: 14, challenge: "KA", description: 'Contient "KA"', solutionWord: "KANTE" },
      { level: 15, challenge: "BE", description: 'Contient "BE"', solutionWord: "BENZEMA" },
    ],
    equipes: [
      { level: 1, challenge: "MA", description: 'Contient "MA"', solutionWord: "MARSEILLE" },
      { level: 2, challenge: "LY", description: 'Contient "LY"', solutionWord: "LYON" },
      { level: 3, challenge: "PA", description: 'Contient "PA"', solutionWord: "PARIS" },
      { level: 4, challenge: "LE", description: 'Contient "LE"', solutionWord: "LENS" },
      { level: 5, challenge: "NA", description: 'Contient "NA"', solutionWord: "NANTES" },
      { level: 6, challenge: "MO", description: 'Contient "MO"', solutionWord: "MONACO" },
      { level: 7, challenge: "ER", description: 'Contient "ER"', solutionWord: "LIVERPOOL" },
      { level: 8, challenge: "CH", description: 'Contient "CH"', solutionWord: "MANCHESTER" },
      { level: 9, challenge: "CE", description: 'Contient "CE"', solutionWord: "BARCELONE" },
      { level: 10, challenge: "AD", description: 'Contient "AD"', solutionWord: "MADRID" },
      { level: 11, challenge: "JU", description: 'Contient "JU"', solutionWord: "JUVENTUS" },
      { level: 12, challenge: "LA", description: 'Contient "LA"', solutionWord: "MILAN" },
      { level: 13, challenge: "MU", description: 'Contient "MU"', solutionWord: "MUNICH" },
    ],
  },
};

export function getTournamentLevel(theme: string, category: string, level: number): TournamentLevel | null {
    try {
        const levels = tournamentLevels[theme]?.[category];
        return levels?.find(l => l.level === level) || null;
    } catch (e) {
        return null;
    }
}

export function getTournamentMaxLevel(theme: string, category: string): number {
    try {
        return tournamentLevels[theme]?.[category]?.length || 0;
    } catch (e) {
        return 0;
    }
}
