// PERIOD — copié depuis le standalone V3 : trois fenêtres temporelles (30
// jours / 90 jours / 12 mois), chacune avec ses propres KPI, sa série de
// barres hebdomadaires/mensuelles de signaux, et sa synthèse rédigée.
import type { PeriodKey } from "../types";

export interface KpiDef {
  k: string;
  v: string;
  delta: string;
  good: boolean;
  note: string;
  series: number[];
  read: string;
}

export interface SignalBarDef {
  lab: string;
  critique: number;
  eleve: number;
  modere: number;
  read: string;
}

export interface PeriodDef {
  range: string;
  sigSub: string;
  synthesis: string;
  bars: SignalBarDef[];
  kpis: KpiDef[];
}

export const PERIOD: Record<PeriodKey, PeriodDef> = {
  "30j": {
    range: "11 août → 9 sept. 2026",
    sigSub: "4 dernières semaines · par niveau de gravité",
    synthesis:
      "Sur quatre semaines, les signaux reçus ont augmenté de 22 % sans que le nombre de territoires concernés change : la hausse est concentrée, pas diffuse. Elle vient d’un seul enchaînement — deux débarquements successifs saturant la chaîne du froid de la Petite-Côte.",
    bars: [
      { lab: "S32", critique: 1, eleve: 3, modere: 4, read: "Deux débarquements successifs relevés à Mbour, aucun signal critique." },
      { lab: "S33", critique: 1, eleve: 4, modere: 3, read: "Première déclaration de fragilité sur une chambre froide de Mbour." },
      { lab: "S34", critique: 2, eleve: 5, modere: 5, read: "Panne de machine à glace déclarée à Joal, non encore qualifiée." },
      { lab: "S35", critique: 3, eleve: 4, modere: 6, read: "La panne de Joal se recoupe avec deux situations déjà ouvertes." },
      { lab: "S36", critique: 3, eleve: 6, modere: 5, read: "Semaine en cours · 3 signaux critiques, tous sur la Petite-Côte." }
    ],
    kpis: [
      { k: "Signaux reçus", v: "48", delta: "+22 %", good: false, note: "Concentrés sur 3 territoires", series: [8, 8, 12, 13, 14], read: "48 signaux reçus en 30 jours, dont 41 sur la Petite-Côte et le Cap-Vert." },
      { k: "Situations ouvertes", v: "24", delta: "+3", good: false, note: "18 critiques ou élevées", series: [21, 22, 22, 23, 24], read: "24 situations ouvertes, dont 18 classées critiques ou élevées." },
      { k: "Délai médian de qualification", v: "44 min", delta: "−9 min", good: true, note: "Objectif programme : 20 min", series: [56, 53, 49, 46, 44], read: "Le délai baisse là où un relais de quai est mandaté — 4 sites sur 18." },
      { k: "Capacités froides fragiles", v: "5", delta: "−1", good: true, note: "sur 14 recensées", series: [6, 6, 7, 6, 5], read: "Une capacité a été remise en service à Djiffer le 2 septembre." },
      { k: "Avancement du portefeuille", v: "51 %", delta: "+2 pts", good: true, note: "9 programmes · 2 sous tension", series: [47, 48, 49, 50, 51], read: "Progression réelle portée par deux programmes en exécution sur neuf." }
    ]
  },
  "90j": {
    range: "11 juin → 9 sept. 2026",
    sigSub: "12 dernières semaines · par niveau de gravité",
    synthesis:
      "Sur trois mois, le volume de signaux a doublé alors que la couverture territoriale est restée stable à 18 sites. Ce n’est pas la situation du littoral qui se dégrade : c’est la capacité de Mbàmbulaan à la voir qui progresse. Les situations closes avec preuve suivent, mais moins vite.",
    bars: [
      { lab: "S25", critique: 0, eleve: 2, modere: 3, read: "Mise en service des premiers relais de quai au Cap-Vert." },
      { lab: "S26", critique: 1, eleve: 2, modere: 2, read: "Premiers signaux remontés par un relais mandaté." },
      { lab: "S27", critique: 0, eleve: 3, modere: 4, read: "Écarts de pesée détectés à Djiffer." },
      { lab: "S28", critique: 1, eleve: 3, modere: 3, read: "Balance de quai recalibrée, preuve enregistrée." },
      { lab: "S29", critique: 2, eleve: 4, modere: 4, read: "Délestage de 3 lots vers Mbour pendant une réparation." },
      { lab: "S30", critique: 1, eleve: 4, modere: 5, read: "Coordination ouverte sur Joal-Fadiouth." },
      { lab: "S31", critique: 1, eleve: 3, modere: 4, read: "Baisse temporaire : période de faible activité en mer." },
      { lab: "S32", critique: 1, eleve: 3, modere: 4, read: "Deux débarquements successifs relevés à Mbour." },
      { lab: "S33", critique: 1, eleve: 4, modere: 3, read: "Première déclaration de fragilité sur une chambre froide." },
      { lab: "S34", critique: 2, eleve: 5, modere: 5, read: "Panne de machine à glace déclarée à Joal." },
      { lab: "S35", critique: 3, eleve: 4, modere: 6, read: "La panne se recoupe avec deux situations ouvertes." },
      { lab: "S36", critique: 3, eleve: 6, modere: 5, read: "Semaine en cours · 3 signaux critiques, tous sur la Petite-Côte." }
    ],
    kpis: [
      { k: "Signaux reçus", v: "132", delta: "+104 %", good: false, note: "Couverture stable à 18 sites", series: [5, 5, 7, 7, 10, 10, 8, 8, 8, 12, 13, 14], read: "La hausse traduit surtout l’extension du réseau de relais, pas une dégradation." },
      { k: "Situations ouvertes", v: "24", delta: "+9", good: false, note: "18 critiques ou élevées", series: [15, 16, 17, 18, 19, 20, 20, 21, 22, 22, 23, 24], read: "24 situations ouvertes contre 15 en juin, à couverture territoriale constante." },
      { k: "Délai médian de qualification", v: "44 min", delta: "−30 min", good: true, note: "Objectif programme : 20 min", series: [74, 72, 70, 66, 63, 60, 58, 56, 53, 49, 46, 44], read: "Le gain de 30 minutes est attribuable au mandat de relais de quai." },
      { k: "Capacités froides fragiles", v: "5", delta: "=", good: true, note: "sur 14 recensées", series: [5, 5, 6, 6, 5, 5, 6, 6, 7, 7, 6, 5], read: "Le stock de capacités fragiles ne baisse pas : les réparations compensent les pannes." },
      { k: "Avancement du portefeuille", v: "51 %", delta: "+14 pts", good: true, note: "9 programmes · 2 sous tension", series: [37, 38, 40, 41, 43, 44, 45, 47, 48, 49, 50, 51], read: "Avancement porté par le Cap-Vert ; le volet froid reste bloqué au financement." }
    ]
  },
  "12m": {
    range: "sept. 2025 → sept. 2026",
    sigSub: "12 derniers mois · par niveau de gravité",
    synthesis:
      "Sur un an, Mbàmbulaan est passé d’un système déclaratif à un système recoupé : la part de signaux confirmés par une source secondaire est passée de 12 % à 58 %. Le volume augmente, mais la proportion de situations closes avec preuve progresse aussi — c’est le signe attendu.",
    bars: [
      { lab: "oct", critique: 0, eleve: 1, modere: 2, read: "Ouverture du dispositif sur 4 sites pilotes." },
      { lab: "nov", critique: 0, eleve: 1, modere: 3, read: "Signaux essentiellement déclaratifs, non recoupés." },
      { lab: "déc", critique: 1, eleve: 2, modere: 3, read: "Premier délestage documenté." },
      { lab: "janv", critique: 1, eleve: 2, modere: 4, read: "Extension à 9 sites." },
      { lab: "févr", critique: 1, eleve: 3, modere: 4, read: "Premiers relais de quai mandatés." },
      { lab: "mars", critique: 2, eleve: 3, modere: 5, read: "La part de signaux recoupés dépasse 30 %." },
      { lab: "avr", critique: 1, eleve: 4, modere: 6, read: "Saison de forte activité, hausse mécanique." },
      { lab: "mai", critique: 2, eleve: 4, modere: 6, read: "Extension à 14 sites." },
      { lab: "juin", critique: 2, eleve: 5, modere: 7, read: "Couverture des 18 sites du littoral atteinte." },
      { lab: "juil", critique: 3, eleve: 6, modere: 8, read: "Coordination ouverte sur Joal-Fadiouth." },
      { lab: "août", critique: 4, eleve: 8, modere: 9, read: "Saturation de la chaîne du froid en Petite-Côte." },
      { lab: "sept", critique: 3, eleve: 6, modere: 5, read: "Mois en cours · relevé partiel au 9 septembre." }
    ],
    kpis: [
      { k: "Signaux reçus", v: "486", delta: "+310 %", good: false, note: "4 → 18 sites couverts", series: [3, 4, 6, 7, 8, 10, 11, 12, 14, 17, 21, 14], read: "La courbe suit l’extension du réseau : 4 sites en octobre, 18 aujourd’hui." },
      { k: "Situations ouvertes", v: "24", delta: "+18", good: false, note: "18 critiques ou élevées", series: [6, 7, 8, 9, 11, 13, 15, 17, 19, 21, 23, 24], read: "Le stock croît moins vite que le volume reçu : la qualification filtre." },
      { k: "Délai médian de qualification", v: "44 min", delta: "−128 min", good: true, note: "Objectif programme : 20 min", series: [172, 165, 150, 141, 128, 118, 104, 95, 82, 70, 52, 44], read: "Division par quatre du délai en un an, corrélée aux relais mandatés." },
      { k: "Capacités froides fragiles", v: "5", delta: "−4", good: true, note: "sur 14 recensées", series: [9, 9, 8, 8, 8, 7, 7, 6, 6, 6, 6, 5], read: "Quatre capacités remises en service durablement depuis un an." },
      { k: "Avancement du portefeuille", v: "51 %", delta: "+51 pts", good: true, note: "9 programmes · 2 sous tension", series: [0, 3, 8, 12, 18, 23, 28, 33, 38, 43, 48, 51], read: "Premier cycle complet du portefeuille : 3 programmes en exécution sur 9." }
    ]
  }
};
