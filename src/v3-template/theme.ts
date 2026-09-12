// Design tokens du template privé V3 — reproduits directement depuis le
// standalone "Mbàmbulaan V3 (Claude Design)" fourni comme source de vérité
// pour ce lot. Volontairement séparé de src/app/brand.css et des autres
// feuilles de style existantes (§14 du mandat : ne pas laisser l'ancienne
// architecture visuelle contraindre cette reconstruction).
//
// Toutes les valeurs ci-dessous sont copiées telles quelles depuis le
// script du prototype (mêmes couleurs hexadécimales / rgba, mêmes familles
// de police) — ce ne sont pas des approximations de palette.

// @font-face déclarées dans fonts.css, avec les fichiers .woff2 exacts du
// standalone (voir ce fichier pour le pourquoi).
export const V3_FONT_SERIF = "Newsreader, ui-serif, Georgia, serif";
export const V3_FONT_SANS = "'IBM Plex Sans', system-ui, sans-serif";
export const V3_FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

export const ink = "#0B1A2A"; // marine — fond sidebar / bandeaux sombres, texte principal
export const paper = "#F7F3E9"; // papier — fond de page
export const white = "#FFFFFF";
export const rust = "#B6522F"; // accent principal (liens, actifs, marqueurs)
export const rustDark = "#8E3E22";
export const rustLight = "#DE9C74";
export const rustLighter = "#DE7A50";
export const green = "#4E7B5A"; // vérifié / bonne voie
export const greenLight = "#8FCB9B";

// Niveaux de criticité territoriale (Atlas / Brief)
export const LV = { critique: "#E05A3C", vigilance: "#E0A455", stable: "#9FB9CE" } as const;
export const LVD = { critique: "#C8452B", vigilance: "#D89A4A", stable: "#8FA9C0" } as const;
export const LVT = { critique: "#A63A22", vigilance: "#8E6420", stable: "#4A6478" } as const;
export const LVL = { critique: "Critique", vigilance: "Vigilance", stable: "Stable" } as const;

export function ink_a(alpha: number): string {
  return `rgba(11,26,42,${alpha})`;
}
export function paper_a(alpha: number): string {
  return `rgba(247,243,233,${alpha})`;
}
