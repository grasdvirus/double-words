
// Données pour le mode Tournoi.
// À l'avenir, cela pourrait être déplacé vers une base de données ou un CMS.

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

export function getTournamentWords(theme: string, category: string): string[] | null {
    try {
        return tournamentData[theme][category].words || null;
    } catch (e) {
        return null;
    }
}
