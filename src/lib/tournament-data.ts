// This file is being deprecated in favor of tournament-levels.ts
// It is kept for reference but is no longer actively used in the game logic.

export interface TournamentData {
  [theme: string]: {
    [category: string]: {
      name: string;
      words: string[];
    };
  };
}

export const tournamentData: TournamentData = {
  football: {
    joueurs: {
      name: "Joueurs de Football",
      words: [
        "ZIDANE",
        "PLATINI",
        "PELE",
        "MARADONA",
        "MESSI",
        "RONALDO",
        "MBAPPE",
        "GRIEZMANN",
        "HENRY",
        "KOPA",
        "BECKENBAUER",
        "CRUYFF",
        "POGBA",
        "KANTE",
        "BENZEMA",
      ],
    },
    equipes: {
      name: "Équipes de Football",
      words: [
        "MARSEILLE",
        "LYON",
        "PARIS",
        "LENS",
        "NANTES",
        "MONACO",
        "LIVERPOOL",
        "MANCHESTER",
        "BARCELONE",
        "MADRID",
        "JUVENTUS",
        "MILAN",
        "MUNICH",
      ],
    },
  },
};

// This function is no longer the primary way to get words for tournaments.
// The logic has been moved to getTournamentLevel in tournament-levels.ts.
export function getTournamentWords(theme: string, category: string): string[] | null {
    try {
        return tournamentData[theme]?.[category]?.words || null;
    } catch (e) {
        return null;
    }
}
