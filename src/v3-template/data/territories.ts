// Données de démonstration — territoires. Copiées depuis le standalone V3
// (structure réelle, valeurs illustratives — cf. bandeau "données de
// démonstration" affiché dans le shell). Isolées ici, à l'écart du domaine
// canonique Mbàmbulaan (§12 du mandat).
import type { TerritoryRow } from "../types";

// [nom, région, lat, lon, niveau, nb situations affichées à l'échelle nationale, zone]
export const TERR: TerritoryRow[] = [
  ["Saint-Louis", "Saint-Louis", 16.03, -16.5, "stable", 2, "Grande-Côte"],
  ["Lompoul-sur-Mer", "Louga", 15.45, -16.87, "stable", 1, "Grande-Côte"],
  ["Fass Boye", "Thiès", 15.15, -16.85, "vigilance", 2, "Grande-Côte"],
  ["Kayar", "Thiès", 14.92, -17.12, "vigilance", 2, "Grande-Côte"],
  ["Yoff", "Dakar", 14.75, -17.47, "stable", 1, "Cap-Vert"],
  ["Ouakam", "Dakar", 14.72, -17.5, "stable", 1, "Cap-Vert"],
  ["Soumbédioune", "Dakar", 14.68, -17.46, "stable", 1, "Cap-Vert"],
  ["Hann", "Dakar", 14.71, -17.41, "vigilance", 2, "Cap-Vert"],
  ["Rufisque-Bargny", "Dakar", 14.72, -17.24, "vigilance", 1, "Cap-Vert"],
  ["Popenguine", "Thiès", 14.55, -17.1, "stable", 1, "Petite-Côte"],
  ["Mbour", "Thiès", 14.42, -16.96, "vigilance", 3, "Petite-Côte"],
  ["Joal-Fadiouth", "Fatick", 14.17, -16.83, "critique", 3, "Petite-Côte"],
  ["Djiffer", "Fatick", 13.95, -16.75, "stable", 1, "Sine-Saloum"],
  ["Foundiougne", "Fatick", 13.9, -16.47, "stable", 1, "Sine-Saloum"],
  ["Missirah", "Fatick", 13.68, -16.5, "vigilance", 1, "Sine-Saloum"],
  ["Kafountine", "Ziguinchor", 12.93, -16.75, "stable", 1, "Casamance"],
  ["Elinkine", "Ziguinchor", 12.48, -16.65, "stable", 0, "Casamance"],
  ["Cap Skirring", "Ziguinchor", 12.39, -16.75, "vigilance", 1, "Casamance"]
];

export const ZONES: Array<[string, number, number]> = [
  ["GRANDE-CÔTE", 15.55, -17.35],
  ["CAP-VERT", 14.95, -17.9],
  ["PETITE-CÔTE", 14.3, -17.5],
  ["SINE-SALOUM", 13.7, -17.25],
  ["CASAMANCE", 12.4, -17.25]
];

export const NEIGHBOURS: Array<[string, number, number]> = [
  ["MAURITANIE", 17.1, -13.6],
  ["MALI", 14.1, -11.6],
  ["GAMBIE", 13.42, -15.1],
  ["GUINÉE-BISSAU", 11.95, -15.1]
];

export const READING: Record<"critique" | "vigilance" | "stable", string> = {
  critique:
    "Territoire en activité critique. Plusieurs situations ouvertes se recoupent et une capacité essentielle est indisponible : la coordination y est prioritaire cette semaine.",
  vigilance:
    "Territoire sous vigilance. Les capacités connues fonctionnent, mais au moins une est déclarée fragile après des débarquements successifs.",
  stable:
    "Territoire stable à ce jour. Les signaux reçus restent isolés et les capacités connues sont opérationnelles."
};

// name: [débarquements 30j, acteurs, capacités froides, dont fragiles, signaux, retours pirogues, relais mandaté]
export const TD: Record<string, [number, number, number, number, number, number, number]> = {
  "Saint-Louis": [58, 41, 3, 1, 4, 96, 0],
  "Lompoul-sur-Mer": [21, 12, 1, 0, 2, 34, 0],
  "Fass Boye": [37, 24, 2, 1, 5, 61, 0],
  Kayar: [49, 33, 2, 1, 5, 78, 0],
  Yoff: [44, 29, 1, 0, 3, 66, 1],
  Ouakam: [26, 17, 1, 0, 2, 38, 1],
  Soumbédioune: [51, 36, 1, 0, 3, 72, 1],
  Hann: [63, 47, 2, 1, 6, 88, 1],
  "Rufisque-Bargny": [34, 22, 1, 0, 4, 52, 1],
  Popenguine: [19, 14, 1, 0, 1, 29, 0],
  Mbour: [71, 52, 3, 1, 7, 104, 0],
  "Joal-Fadiouth": [46, 38, 2, 2, 9, 74, 0],
  Djiffer: [29, 21, 1, 0, 3, 44, 0],
  Foundiougne: [23, 18, 1, 0, 2, 31, 0],
  Missirah: [16, 11, 0, 0, 2, 24, 0],
  Kafountine: [42, 31, 2, 0, 3, 58, 0],
  Elinkine: [14, 9, 0, 0, 0, 19, 0],
  "Cap Skirring": [18, 13, 1, 1, 2, 26, 0]
};
