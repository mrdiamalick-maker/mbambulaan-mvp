// Repères macro-économiques sourcés sur l'économie maritime et halieutique
// sénégalaise. Chiffres publics, cités avec leur source — jamais présentés
// comme des données Mbàmbulaan en temps réel. À actualiser au fil des
// publications officielles (Ministère des Pêches, ANSD, FAO, Banque mondiale).

export interface MacroStat {
  value: string;
  label: string;
  detail: string;
  source: string;
}

export const filiereStats: MacroStat[] = [
  {
    value: "3,2%",
    label: "du PIB national",
    detail: "Contribution directe de la pêche à l'économie sénégalaise.",
    source: "FAO, Initiative Pêches Côtières"
  },
  {
    value: "600 000+",
    label: "emplois directs et indirects",
    detail: "Dont l'écrasante majorité dans la pêche artisanale et la transformation.",
    source: "Banque mondiale"
  },
  {
    value: "≈20 000",
    label: "pirogues artisanales",
    detail: "Contre une centaine de navires industriels — la filière est d'abord artisanale.",
    source: "Commission sous-régionale des pêches"
  },
  {
    value: "230 072 t",
    label: "de produits exportés en 2024",
    detail: "Sur une production totale de 448 756 tonnes, soit environ 30 % des recettes d'exportation du pays.",
    source: "Ministère des Pêches, déc. 2025"
  },
  {
    value: "≈75%",
    label: "des apports en protéines animales",
    detail: "Le poisson reste la principale source de protéines animales pour la population sénégalaise.",
    source: "Banque mondiale"
  },
  {
    value: "94%",
    label: "des emplois directs du secteur",
    detail: "Portés par la pêche artisanale, plutôt que par la pêche industrielle.",
    source: "FAO"
  }
];

export const landingsSplit = [
  { label: "Pêche artisanale", share: 80, note: "Pirogues, quais et sites de débarquement répartis sur tout le littoral." },
  { label: "Pêche industrielle", share: 20, note: "Flotte industrielle, volumes plus concentrés." }
];

export const statsNote = "Chiffres publics consolidés (FAO, Banque mondiale, Ministère des Pêches, CSRP), 2021-2024. Repères nationaux indicatifs : ils ne reflètent pas une mesure en temps réel et seront actualisés à mesure des publications officielles.";
