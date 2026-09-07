// Séries de présentation propres à l'Espace État.
//
// Le modèle courant ne contient pas encore un historique suffisamment long
// pour reconstituer ces deux lectures temporelles. Elles restent donc dans
// une couche unique, explicite et remplaçable — jamais dispersées sous forme
// de nombres magiques dans les composants React. Elles servent à préserver
// le rôle visuel de la référence Claude Design en environnement de
// démonstration, sans être présentées comme des statistiques nationales.

export const ETAT_DEMO_SERIES_NOTICE =
  "Série illustrative — mode démonstration. Ne constitue pas une statistique officielle.";

export const signalTrendDemo = [
  { label: "S26", value: 1 },
  { label: "S27", value: 2 },
  { label: "S28", value: 1 },
  { label: "S29", value: 3 },
  { label: "S30", value: 2 },
  { label: "S31", value: 4 },
  { label: "S32", value: 3 },
  { label: "S33", value: 5 },
  { label: "S34", value: 4 },
  { label: "S35", value: 3 },
  { label: "S36", value: 5 },
  { label: "S37", value: 2 }
] as const;

export const resultTrendDemo = [
  { label: "Fév", qualificationMinutes: 74, closedWithConfirmationPct: 21 },
  { label: "Mars", qualificationMinutes: 70, closedWithConfirmationPct: 24 },
  { label: "Avr", qualificationMinutes: 64, closedWithConfirmationPct: 28 },
  { label: "Mai", qualificationMinutes: 59, closedWithConfirmationPct: 33 },
  { label: "Juin", qualificationMinutes: 52, closedWithConfirmationPct: 37 },
  { label: "Juil", qualificationMinutes: 47, closedWithConfirmationPct: 40 },
  { label: "Août", qualificationMinutes: 42, closedWithConfirmationPct: 42 },
  { label: "Sept", qualificationMinutes: 44, closedWithConfirmationPct: 43 }
] as const;

